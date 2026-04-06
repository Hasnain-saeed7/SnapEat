const orderModel = require('../models/order.model');
const foodModel = require('../models/food.model');
const { Message, Conversation } = require('../models/message.model');

async function createOrder(req, res) {
    try {
        const { items, deliveryMethod, deliveryAddress, paymentMethod } = req.body;
        const userId = req.user._id;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        // Validate items and calculate total
        let totalAmount = 0;
        const orderItems = [];
        let foodPartnerId = null;

        for (const item of items) {
            const food = await foodModel.findById(item.foodId).populate('foodPartner');
            if (!food) {
                return res.status(404).json({ message: `Food item not found: ${item.foodId}` });
            }

            // Ensure all items are from the same partner
            if (!foodPartnerId) {
                foodPartnerId = food.foodPartner._id;
            } else if (foodPartnerId.toString() !== food.foodPartner._id.toString()) {
                return res.status(400).json({ message: "All items must be from the same restaurant" });
            }

            const quantity = item.quantity || 1;
            totalAmount += food.price * quantity;

            orderItems.push({
                food: food._id,
                name: food.name,
                price: food.price,
                quantity
            });
        }

        const order = await orderModel.create({
            user: userId,
            foodPartner: foodPartnerId,
            items: orderItems,
            totalAmount,
            deliveryMethod: deliveryMethod || 'delivery',
            deliveryAddress: deliveryAddress || {},
            paymentMethod: paymentMethod || 'cash'
        });

        const populatedOrder = await orderModel.findById(order._id)
            .populate('user', 'fullName email')
            .populate('foodPartner', 'name profilePic')
            .populate('items.food', 'name video price');

        // Auto-create conversation and send partner confirmation message after order placement
        let conversation = await Conversation.findOne({
            user: userId,
            partner: foodPartnerId
        });

        if (!conversation) {
            conversation = await Conversation.create({
                user: userId,
                partner: foodPartnerId,
                lastMessage: '',
                lastMessageAt: new Date()
            });
        }

        const autoMessage = 'Your order will be served in 30 minutes';

        await Message.create({
            conversation: conversation._id,
            sender: foodPartnerId,
            senderModel: 'foodpartner',
            content: autoMessage,
            messageType: 'text'
        });

        await Conversation.findByIdAndUpdate(conversation._id, {
            lastMessage: autoMessage,
            lastMessageAt: new Date()
        });

        res.status(201).json({
            message: "Order placed successfully",
            order: populatedOrder
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: "Failed to create order", error: error.message });
    }
}

async function getUserOrders(req, res) {
    try {
        const userId = req.user._id;
        const orders = await orderModel.find({ user: userId })
            .populate('foodPartner', 'name profilePic')
            .populate('items.food', 'name video price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Orders retrieved successfully",
            orders
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ message: "Failed to get orders", error: error.message });
    }
}

async function getPartnerOrders(req, res) {
    try {
        const partnerId = req.foodPartner._id;
        const orders = await orderModel.find({ foodPartner: partnerId })
            .populate('user', 'fullName email')
            .populate('items.food', 'name video price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Orders retrieved successfully",
            orders
        });
    } catch (error) {
        console.error('Get partner orders error:', error);
        res.status(500).json({ message: "Failed to get orders", error: error.message });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const partnerId = req.foodPartner._id;

        const order = await orderModel.findOne({ _id: orderId, foodPartner: partnerId });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            message: "Order status updated",
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: "Failed to update order", error: error.message });
    }
}

async function getOrderById(req, res) {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId)
            .populate('user', 'fullName email')
            .populate('foodPartner', 'name profilePic address')
            .populate('items.food', 'name video price');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Order retrieved successfully",
            order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: "Failed to get order", error: error.message });
    }
}

module.exports = {
    createOrder,
    getUserOrders,
    getPartnerOrders,
    updateOrderStatus,
    getOrderById
};
