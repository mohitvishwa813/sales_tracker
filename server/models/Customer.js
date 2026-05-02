const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    debts: [DebtSchema],
    createdAt: { type: Date, default: Date.now }
});

// Calculate total debt virtually or maintain it. We can just compute it when needed or maintain it.
CustomerSchema.virtual('totalDebt').get(function() {
    return this.debts.reduce((sum, debt) => sum + debt.amount, 0);
});

// Ensure virtuals are included in JSON
CustomerSchema.set('toJSON', { virtuals: true });
CustomerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Customer', CustomerSchema);
