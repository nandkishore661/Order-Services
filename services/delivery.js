// services/deliveryService.js
const Delivery = require('../models/delivery');
const Order = require('../models/order');


// List all available orders
const listAvailableOrders = async () => {
    return await Order.find({ status: 'available' }).populate('items.menu_item_id'); // Populate menu item details if needed
};

// Accept a delivery request
const acceptDelivery = async (order_id, delivery_personnel_id,status) => {
    const delivery = new Delivery({
        order: order_id,
        delivery_personnel_id,
        status: status,
        start_time: new Date(),
    });
    await delivery.save();

    // Update the order with the delivery partner
    await Order.findByIdAndUpdate(order_id, { delivery_partner_id: delivery_personnel_id,status:status });

    return delivery.populate('order'); // Populate order details
};


module.exports = {
    listAvailableOrders,
    acceptDelivery,
};