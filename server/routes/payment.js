const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const WebhookEvent = require('../models/WebhookEvent');
const User = require('../models/User');

const PERIOD_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// One paid plan: ShopTracker Pro at ₹299/month. Stored in paise.
// TEMP: dropped to ₹10 for live-mode smoke testing. Restore to 29900 before going live.
const PLAN_AMOUNT_PAISE = 1000;
const PLAN_CURRENCY = 'INR';

// Lazy-initialize the Razorpay client so a server missing payment env vars
// can still boot and serve non-payment routes. The client is created on first
// use; if keys are still missing then, the route handler surfaces a clean 500.
let _razorpay = null;
function getRazorpay() {
    if (_razorpay) return _razorpay;
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        const err = new Error('Razorpay is not configured (missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in env)');
        err.code = 'RAZORPAY_NOT_CONFIGURED';
        throw err;
    }
    _razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    return _razorpay;
}

// @route   POST /api/payments/create-order
// @desc    Create a Razorpay order for the ₹299 monthly plan
// @access  Private
router.post('/create-order', auth, async (req, res) => {
    try {
        const razorpay = getRazorpay();

        // receipt must be ≤40 chars per Razorpay; userId.slice + timestamp keeps it short and unique.
        const receipt = `rcpt_${req.user.id.slice(-8)}_${Date.now()}`;

        const order = await razorpay.orders.create({
            amount: PLAN_AMOUNT_PAISE,
            currency: PLAN_CURRENCY,
            receipt,
            notes: {
                userId: req.user.id.toString(),
                email: req.user.email,
                plan: 'PRO_MONTHLY'
            }
        });

        await Payment.create({
            userId: req.user.id,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            status: 'created',
            notes: order.notes
        });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        if (err.code === 'RAZORPAY_NOT_CONFIGURED') {
            console.error(err.message);
            return res.status(500).json({ msg: 'Payments are not configured on the server' });
        }
        console.error('Create-order error:', err);
        res.status(500).json({ msg: 'Failed to create order', error: err.error?.description || err.message });
    }
});

// @route   POST /api/payments/verify
// @desc    Client-driven payment confirmation. Called from the Razorpay checkout
//          `handler` callback the moment the popup reports success. Verifies the
//          signature locally, double-checks payment status via Razorpay API, and
//          activates the subscription. The webhook remains a safety net for cases
//          where this verify call never runs (browser closed, network drop) and
//          for non-payment events like refunds/disputes.
// @access  Private
router.post('/verify', auth, async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ msg: 'Missing payment verification fields' });
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ msg: 'Payments are not configured on the server' });
    }

    // Razorpay's payment-success signature: HMAC-SHA256("orderId|paymentId", key_secret).
    // Same cryptographic strength as the webhook signature.
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        console.warn(`Verify: bad signature for order ${razorpay_order_id}`);
        return res.status(400).json({ msg: 'Invalid payment signature' });
    }

    // Make sure the order belongs to the calling user — prevents someone with a
    // valid (payment_id, order_id, signature) tuple from activating someone else.
    const paymentDoc = await Payment.findOne({ orderId: razorpay_order_id });
    if (!paymentDoc) {
        return res.status(404).json({ msg: 'Order not found' });
    }
    if (paymentDoc.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ msg: 'Order does not belong to this user' });
    }

    // Fetch the payment from Razorpay to confirm the server-side state. Trusting
    // only the signature would let a replay activate access for a failed payment
    // (signature is over IDs, not status).
    let payment;
    try {
        const razorpay = getRazorpay();
        payment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (err) {
        console.error('Verify: Razorpay fetch failed:', err.message);
        return res.status(502).json({ msg: 'Could not confirm payment with Razorpay' });
    }

    if (payment.status !== 'captured' && payment.status !== 'authorized') {
        return res.status(400).json({
            msg: `Payment is in "${payment.status}" state — cannot activate`,
            paymentStatus: payment.status
        });
    }

    try {
        await applyCapturedPayment({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            amount: payment.amount,
            currency: payment.currency,
            method: payment.method
        });
    } catch (err) {
        console.error('Verify: applyCapturedPayment failed:', err);
        return res.status(500).json({ msg: 'Failed to activate subscription' });
    }

    const freshUser = await User.findById(req.user.id);
    res.json({
        success: true,
        subscription: freshUser.toSubscriptionInfo()
    });
});

// @route   GET /api/payments/status
// @desc    Get current subscription state — frontend polls this after checkout
// @access  Private
router.get('/status', auth, async (req, res) => {
    const lastPayment = await Payment.findOne({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .lean();

    res.json({
        subscription: req.user.toSubscriptionInfo(),
        lastPayment: lastPayment ? {
            orderId: lastPayment.orderId,
            paymentId: lastPayment.paymentId,
            amount: lastPayment.amount,
            status: lastPayment.status,
            createdAt: lastPayment.createdAt
        } : null
    });
});

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------
// Razorpay POSTs payment events here. The route is mounted with express.raw()
// in index.js so req.body is a Buffer — we need raw bytes to verify the
// HMAC signature Razorpay sends in the x-razorpay-signature header.
//
// Response policy:
//   200 — event handled (or already-handled / unknown-but-acknowledged)
//   400 — invalid signature (don't retry, won't fix itself)
//   500 — transient processing error (Razorpay will retry)
//
// Idempotency strategy:
//   1. Each business-state mutation is idempotent on its own (checks the
//      Payment doc's current status before mutating User.currentPeriodEnd).
//   2. After mutating, we insert a WebhookEvent doc keyed by event.id. The
//      unique index on eventId prevents duplicate processing if Razorpay
//      retries before we acknowledge.
// ---------------------------------------------------------------------------

router.post('/webhook', async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('Webhook hit but RAZORPAY_WEBHOOK_SECRET is not set');
        return res.status(500).json({ msg: 'Webhook secret not configured' });
    }
    if (!signature) {
        return res.status(400).json({ msg: 'Missing signature header' });
    }

    // req.body is a Buffer here because of express.raw() in index.js.
    const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : req.body;

    let isValid;
    try {
        isValid = Razorpay.validateWebhookSignature(rawBody, signature, webhookSecret);
    } catch (err) {
        console.error('Signature validation threw:', err.message);
        return res.status(400).json({ msg: 'Signature validation failed' });
    }
    if (!isValid) {
        console.warn('Invalid webhook signature received');
        return res.status(400).json({ msg: 'Invalid signature' });
    }

    let event;
    try {
        event = JSON.parse(rawBody);
    } catch (err) {
        return res.status(400).json({ msg: 'Invalid JSON' });
    }

    const eventId = event.id;
    const eventType = event.event;

    if (!eventId || !eventType) {
        return res.status(400).json({ msg: 'Malformed event' });
    }

    // Fast path: if we've already processed this exact event, ack and exit.
    const alreadyProcessed = await WebhookEvent.findOne({ eventId }).lean();
    if (alreadyProcessed) {
        console.log(`Webhook ${eventId} already processed (${eventType}) — ack`);
        return res.status(200).json({ msg: 'Already processed' });
    }

    try {
        let paymentId, orderId;

        switch (eventType) {
            case 'payment.captured':
                ({ paymentId, orderId } = await handlePaymentCaptured(event));
                break;

            case 'payment.failed':
                ({ paymentId, orderId } = await handlePaymentFailed(event));
                break;

            case 'refund.processed':
                ({ paymentId } = await handleRefundProcessed(event));
                break;

            case 'refund.failed':
                ({ paymentId } = await handleRefundFailed(event));
                break;

            case 'payment.dispute.created':
                ({ paymentId } = await handleDisputeCreated(event));
                break;

            default:
                console.log(`Webhook ${eventId}: unhandled event type "${eventType}" — ack`);
        }

        // Record processed event — unique eventId index prevents double-processing on retry.
        await WebhookEvent.create({
            eventId,
            event: eventType,
            paymentId,
            orderId,
            rawPayload: event
        });

        res.status(200).json({ msg: 'Processed' });
    } catch (err) {
        // Duplicate-key races (E11000) mean another delivery already processed this
        // event between our findOne and create — safe to acknowledge.
        if (err.code === 11000) {
            console.log(`Webhook ${eventId}: duplicate key on insert — already processed`);
            return res.status(200).json({ msg: 'Already processed (race)' });
        }
        console.error(`Webhook ${eventId} processing failed:`, err);
        // 500 → Razorpay will retry. Don't insert WebhookEvent on failure so retry
        // gets a fresh attempt at the work.
        res.status(500).json({ msg: 'Processing failed' });
    }
});

// ---- Event handlers (each returns { paymentId, orderId } for logging) ----

async function handlePaymentCaptured(event) {
    const payment = event.payload?.payment?.entity;
    if (!payment) throw new Error('payment.captured: missing payment entity');

    const { id: paymentId, order_id: orderId, amount, method, currency } = payment;
    await applyCapturedPayment({ orderId, paymentId, amount, currency, method });
    return { paymentId, orderId };
}

// Shared activation primitive — used by both the webhook handler and the
// client-driven /verify endpoint. Idempotent: re-running on an already-captured
// Payment is a no-op, so whichever path arrives first wins and the second is harmless.
async function applyCapturedPayment({ orderId, paymentId, amount, currency, method }) {
    const paymentDoc = await Payment.findOne({ orderId });
    if (!paymentDoc) {
        // Order wasn't created by us. For webhooks this can be a leaked URL or
        // unrelated test event; for /verify the caller has already enforced
        // ownership, so this branch is dead there. Either way, do nothing.
        console.warn(`applyCapturedPayment: unknown order ${orderId} — ignoring`);
        return { activated: false, reason: 'unknown-order' };
    }

    if (paymentDoc.status === 'captured') {
        console.log(`Payment ${paymentId} already captured — skipping period extension`);
        return { activated: false, reason: 'already-captured' };
    }

    paymentDoc.paymentId = paymentId;
    paymentDoc.status = 'captured';
    if (method) paymentDoc.method = method;
    if (amount) paymentDoc.amount = amount;
    if (currency) paymentDoc.currency = currency;
    paymentDoc.capturedAt = new Date();
    await paymentDoc.save();

    const user = await User.findById(paymentDoc.userId);
    if (!user) {
        console.warn(`applyCapturedPayment: user ${paymentDoc.userId} not found for order ${orderId}`);
        return { activated: false, reason: 'user-missing' };
    }

    // Extend from whichever is later: now, or their existing period end.
    // This way paying early stacks rather than resetting.
    const now = new Date();
    const baseline = user.currentPeriodEnd && user.currentPeriodEnd > now
        ? user.currentPeriodEnd
        : now;
    user.currentPeriodEnd = new Date(baseline.getTime() + PERIOD_DAYS * MS_PER_DAY);
    user.subscriptionState = 'ACTIVE';
    user.lastPaymentAt = now;
    await user.save();

    console.log(`User ${user.id} subscription extended to ${user.currentPeriodEnd.toISOString()}`);
    return { activated: true };
}

async function handlePaymentFailed(event) {
    const payment = event.payload?.payment?.entity;
    if (!payment) throw new Error('payment.failed: missing payment entity');

    const { id: paymentId, order_id: orderId, error_code, error_description, method } = payment;

    const paymentDoc = await Payment.findOne({ orderId });
    if (paymentDoc && paymentDoc.status !== 'captured') {
        paymentDoc.paymentId = paymentId;
        paymentDoc.status = 'failed';
        paymentDoc.method = method;
        paymentDoc.errorCode = error_code;
        paymentDoc.errorDescription = error_description;
        await paymentDoc.save();
    }
    return { paymentId, orderId };
}

async function handleRefundProcessed(event) {
    const refund = event.payload?.refund?.entity;
    if (!refund) throw new Error('refund.processed: missing refund entity');

    const { payment_id: paymentId } = refund;
    const paymentDoc = await Payment.findOne({ paymentId });
    if (paymentDoc) {
        paymentDoc.status = 'refunded';
        await paymentDoc.save();
        // Policy decision: we don't auto-revoke the user's current period.
        // If you want to revoke immediately on refund, flip user.subscriptionState
        // to INACTIVE and clear currentPeriodEnd here.
    }
    return { paymentId };
}

async function handleRefundFailed(event) {
    const refund = event.payload?.refund?.entity;
    const paymentId = refund?.payment_id;
    console.warn(`Refund failed for payment ${paymentId}`);
    return { paymentId };
}

async function handleDisputeCreated(event) {
    const dispute = event.payload?.dispute?.entity;
    const paymentId = dispute?.payment_id;
    console.warn(`Dispute opened against payment ${paymentId}: ${dispute?.reason_description}`);
    // Future: trigger an alert to ops here (email, Slack, etc).
    return { paymentId };
}

module.exports = router;
