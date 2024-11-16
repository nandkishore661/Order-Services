// models/orderModel.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menu_item_id: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
    customer_id: { type: String, required: true },
    restaurant_id: { type: String, required: true },
    total_amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'assigned', 'closed'], default: 'pending' },
    created_at: { type: Date, default: Date.now },
    items: [orderItemSchema],
    delivery_partner_id: { type: String, default: null }, // New field for delivery partner
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;