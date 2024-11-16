// services/orderService.js
const Order = require('../models/order');

// Place an order
const placeOrder = async (orderData) => {
    const newOrder = new Order(orderData);
    await newOrder.save();
    return newOrder;
};

// Get order by ID
const getOrderById = async (orderId) => {
    return await Order.findById(orderId);
};

// Update order status
const updateOrderStatus = async (orderId, status) => {
    return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
};

// Get all orders for a customer
const getCustomerOrders = async (customerId) => {
    return await Order.find({ customer_id: customerId });
};

module.exports = {
    placeOrder,
    getOrderById,
    updateOrderStatus,
    getCustomerOrders,
};