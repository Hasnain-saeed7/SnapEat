const express = require('express');
const router = express.Router();
const { authUserMiddleware, authFoodPartnerMiddleware } = require('../middlewares/auth.middleware');
const { 
    createOrder, 
    getUserOrders, 
    getPartnerOrders, 
    updateOrderStatus, 
    getOrderById 
} = require('../controllers/order.controller');

// User routes
router.post('/', authUserMiddleware, createOrder);
router.get('/my-orders', authUserMiddleware, getUserOrders);
router.get('/:orderId', authUserMiddleware, getOrderById);

// Partner routes
router.get('/partner/orders', authFoodPartnerMiddleware, getPartnerOrders);
router.put('/partner/:orderId/status', authFoodPartnerMiddleware, updateOrderStatus);

module.exports = router;
