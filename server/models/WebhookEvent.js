const mongoose = require('mongoose');

const WebhookEventSchema = new mongoose.Schema({
    // Razorpay's event.id — used as the idempotency key.
    // Unique index ensures a duplicate webhook delivery can't be processed twice.
    eventId: { type: String, required: true, unique: true, index: true },

    event: { type: String, required: true },
    paymentId: { type: String, index: true },
    orderId: { type: String, index: true },

    processedAt: { type: Date, default: Date.now },
    rawPayload: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('WebhookEvent', WebhookEventSchema);
