// routes/orderRoutes.js
const express = require('express');
const deliveryService = require('../services/delivery');
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";

const router = express.Router();


// Middleware to check if the user is authorized for getting customer orders
const checkAccess = (req, res, next) => {
    const { role } = req.user; // Assuming user role is part of the token
    // Allow access for admin and customer only
    if (role === "admin" || role === "delivery_personnel") {
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


// GET /deliveries: List all available deliveries for pickup
router.get('/',authenticateJWT,checkAccess, async (req, res) => {
    try {
        const deliveries = await deliveryService.listAvailableOrders();
        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /deliveries/{order_id}/accept: Accept a delivery request
router.post('/:order_id',authenticateJWT,checkAccess,  async (req, res) => {
    const { order_id } = req.params;
    const { delivery_personnel_id,status } = req.body;

    try {
        const delivery = await deliveryService.acceptDelivery(order_id, delivery_personnel_id,status);
        if (!delivery.user) {
            return res.status(404).json({ message: 'Delivery not found or already accepted' });
        }
        res.json(delivery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;