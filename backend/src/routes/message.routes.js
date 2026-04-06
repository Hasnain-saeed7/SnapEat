const express = require('express');
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// User routes
router.get('/user/conversations', 
    authMiddleware.authUserMiddleware, 
    messageController.getUserConversations);

router.get('/user/unread', 
    authMiddleware.authUserMiddleware, 
    messageController.getUnreadCountUser);

router.post('/user/conversation/:partnerId', 
    authMiddleware.authUserMiddleware, 
    messageController.getOrCreateConversation);

router.post('/user/:conversationId/send', 
    authMiddleware.authUserMiddleware, 
    messageController.sendMessageAsUser);

router.post('/user/:conversationId/voice',
    authMiddleware.authUserMiddleware,
    upload.single('voice'),
    messageController.sendVoiceAsUser);

// Partner routes
router.get('/partner/conversations', 
    authMiddleware.authFoodPartnerMiddleware, 
    messageController.getPartnerConversations);

router.get('/partner/unread', 
    authMiddleware.authFoodPartnerMiddleware, 
    messageController.getUnreadCountPartner);

router.post('/partner/:conversationId/send', 
    authMiddleware.authFoodPartnerMiddleware, 
    messageController.sendMessageAsPartner);

router.post('/partner/:conversationId/voice',
    authMiddleware.authFoodPartnerMiddleware,
    upload.single('voice'),
    messageController.sendVoiceAsPartner);

// Shared route for getting messages (works for both)
router.get('/:conversationId', 
    authMiddleware.authUserOrPartnerMiddleware, 
    messageController.getMessages);

// Delete message route (works for both)
router.delete('/message/:messageId',
    authMiddleware.authUserOrPartnerMiddleware,
    messageController.deleteMessage);

// Delete entire conversation route (works for both)
router.delete('/conversation/:conversationId',
    authMiddleware.authUserOrPartnerMiddleware,
    messageController.deleteConversation);

module.exports = router;
 



