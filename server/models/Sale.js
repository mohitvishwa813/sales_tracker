const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sellingPrice: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    profit: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', SaleSchema);
