// One-off reconciliation: find Payment docs that are still status:"created" but
// were actually captured by Razorpay (likely due to a missed webhook), and
// activate the user's subscription for each.
//
// Run with:  node scripts/reconcile-stuck-payments.js
// Requires:  MONGODB_URI, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET in env

require('dotenv').config();
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const User = require('../models/User');

const PERIOD_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

async function run() {
    if (!process.env.MONGODB_URI || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('Missing required env vars: MONGODB_URI, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const stuck = await Payment.find({ status: 'created' });
    console.log(`Found ${stuck.length} Payment doc(s) still in "created" state`);

    let activated = 0;
    let skipped = 0;
    let errored = 0;

    for (const paymentDoc of stuck) {
        try {
            // Razorpay's order has a `payments` collection — fetch all payments
            // made against this order and find one that succeeded.
            const { items: payments } = await razorpay.orders.fetchPayments(paymentDoc.orderId);
            const captured = payments.find(p => p.status === 'captured');

            if (!captured) {
                console.log(`  ${paymentDoc.orderId}: no captured payment — skip`);
                skipped++;
                continue;
            }

            paymentDoc.paymentId = captured.id;
            paymentDoc.status = 'captured';
            paymentDoc.method = captured.method;
            paymentDoc.amount = captured.amount;
            paymentDoc.currency = captured.currency;
            paymentDoc.capturedAt = new Date(captured.created_at * 1000);
            await paymentDoc.save();

            const user = await User.findById(paymentDoc.userId);
            if (!user) {
                console.log(`  ${paymentDoc.orderId}: user ${paymentDoc.userId} missing — payment marked but no user to activate`);
                errored++;
                continue;
            }

            const now = new Date();
            const baseline = user.currentPeriodEnd && user.currentPeriodEnd > now
                ? user.currentPeriodEnd
                : now;
            user.currentPeriodEnd = new Date(baseline.getTime() + PERIOD_DAYS * MS_PER_DAY);
            user.subscriptionState = 'ACTIVE';
            user.lastPaymentAt = paymentDoc.capturedAt;
            await user.save();

            console.log(`  ${paymentDoc.orderId} → activated user ${user.email} until ${user.currentPeriodEnd.toISOString()}`);
            activated++;
        } catch (err) {
            console.error(`  ${paymentDoc.orderId}: error —`, err.error?.description || err.message);
            errored++;
        }
    }

    console.log(`\nDone. activated=${activated}  skipped=${skipped}  errored=${errored}`);
    await mongoose.disconnect();
    process.exit(0);
}

run().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
