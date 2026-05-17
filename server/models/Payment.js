const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    orderId: { type: String, required: true, index: true },
    paymentId: { type: String, index: true },

    // Always store integer paise — never floats. 299.00 INR = 29900.
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    status: {
        type: String,
        enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
        default: 'created',
        index: true
    },

    method: { type: String },
    errorCode: { type: String },
    errorDescription: { type: String },

    // Free-form context we pass to Razorpay when creating the order.
    // Lets us look the user up from the webhook payload.
    notes: { type: mongoose.Schema.Types.Mixed },

    capturedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
