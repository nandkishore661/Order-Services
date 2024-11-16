// routes/orderRoutes.js
const express = require('express');
const {
    placeOrder,
    getOrderById,
    updateOrderStatus,
    getCustomerOrders,
} = require('../services/order');
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";

const router = express.Router();

// Middleware to check if the user is authorized for placing and getting orders
const checkOrderAccess = (req, res, next) => {
    const { role } = req.user; // Assuming user role is part of the token

    // Allow access for admin, customer, and restaurant_owner
    if (role === "admin" || role === "customer" || role === "restaurant_owner") {
        return next();
    }

    return res.status(403).json({ message: "Access denied" });
};

// Middleware to check if the user is authorized for updating orders
const checkUpdateAccess = (req, res, next) => {
    const { role } = req.user; // Assuming user role is part of the token

    // Allow access for admin and restaurant_owner only
    if (role === "admin" || role === "restaurant_owner") {
        return next();
    }

    return res.status(403).json({ message: "Access denied" });
};

// Middleware to check if the user is authorized for getting customer orders
const checkCustomerOrdersAccess = (req, res, next) => {
    const { role } = req.user; // Assuming user role is part of the token
    // Allow access for admin and customer only
    if (role === "admin" || role === "customer") {
        return next();
    }

    return res.status(403).json({ message: "Access denied" });
};

const authenticateJWT = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user; // Attach user info to the request
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Place an order
router.post('/', authenticateJWT, checkCustomerOrdersAccess, async (req, res) => {
    try {
        const newOrder = await placeOrder(req.body);
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get order by ID
router.get('/:order_id', authenticateJWT, checkCustomerOrdersAccess, async (req, res) => {
    try {
        const order = await getOrderById(req.params.order_id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status
router.put('/:order_id/status', authenticateJWT, checkUpdateAccess, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await updateOrderStatus(req.params.order_id, status);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all orders for a customer
router.get('/customers/:customer_id', authenticateJWT, checkCustomerOrdersAccess, async (req, res) => {
    try {
        const orders = await getCustomerOrders(req.params.customer_id);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;