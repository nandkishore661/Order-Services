// models/deliveryModel.js
const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, // Reference to Order model
    delivery_personnel_id: { type: String, required: true },
    status: { type: String, enum: ['available', 'picked up', 'en route', 'delivered'], default: 'available' },
    start_time: { type: Date },
    end_time: { type: Date },
});

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;