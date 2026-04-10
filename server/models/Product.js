const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    costPrice: { type: Number, required: true },
    defaultSellingPrice: { type: Number, required: true },
    minPrice: { type: Number, required: true },
    maxDiscount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
