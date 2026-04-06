const { Message, Conversation } = require('../models/message.model');
const User = require('../models/user.model');
const FoodPartner = require('../models/foodpartner.model');
const storageService = require('../services/storage.service');
const { v4: uuid } = require('uuid');

// Get or create conversation between user and partner
const getOrCreateConversation = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const userId = req.user._id;

        // Find existing conversation
        let conversation = await Conversation.findOne({
            user: userId,
            partner: partnerId
        }).populate('user', 'fullName profilePic')
          .populate('partner', 'name profilePic');

        // Create if doesn't exist
        if (!conversation) {
            conversation = await Conversation.create({
                user: userId,
                partner: partnerId
            });
            conversation = await Conversation.findById(conversation._id)
                .populate('user', 'fullName profilePic')
                .populate('partner', 'name profilePic');
        }

        res.json({ conversation });
    } catch (error) {
        console.error('Get/Create conversation error:', error);
        res.status(500).json({ message: 'Failed to get conversation' });
    }
};

// Get all conversations for a user
const getUserConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({ user: userId })
            .populate('partner', 'name profilePic category')
            .sort({ lastMessageAt: -1 })
            .lean();

        // Get unread count for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (convo) => {
                const unreadCount = await Message.countDocuments({
                    conversation: convo._id,
                    senderModel: 'foodpartner',
                    read: false
                });
                return { ...convo, unreadCount };
            })
        );

        res.json({ conversations: conversationsWithUnread });
    } catch (error) {
        console.error('Get user conversations error:', error);
        res.status(500).json({ message: 'Failed to get conversations' });
    }
};

// Get all conversations for a partner
const getPartnerConversations = async (req, res) => {
    try {
        const partnerId = req.foodPartner._id;

        const conversations = await Conversation.find({ partner: partnerId })
            .populate('user', 'fullName profilePic')
            .sort({ lastMessageAt: -1 })
            .lean();

        // Get unread count for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (convo) => {
                const unreadCount = await Message.countDocuments({
                    conversation: convo._id,
                    senderModel: 'user',
                    read: false
                });
                return { ...convo, unreadCount };
            })
        );

        res.json({ conversations: conversationsWithUnread });
    } catch (error) {
        console.error('Get partner conversations error:', error);
        res.status(500).json({ message: 'Failed to get conversations' });
    }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?._id;
        const partnerId = req.foodPartner?._id;

        // Verify access to conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const isUserInConvo = userId && conversation.user.toString() === userId.toString();
        const isPartnerInConvo = partnerId && conversation.partner.toString() === partnerId.toString();

        if (!isUserInConvo && !isPartnerInConvo) {
            return res.status(403).json({ message: 'Not authorized to view this conversation' });
        }

        const messages = await Message.find({ conversation: conversationId })
            .sort({ createdAt: 1 })
            .limit(100);

        // Mark messages as read
        if (userId) {
            await Message.updateMany(
                { conversation: conversationId, senderModel: 'foodpartner', read: false },
                { read: true }
            );
        } else if (partnerId) {
            await Message.updateMany(
                { conversation: conversationId, senderModel: 'user', read: false },
                { read: true }
            );
        }

        res.json({ messages, conversation });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Failed to get messages' });
    }
};

// Send a message (user)
const sendMessageAsUser = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!content?.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Verify conversation exists and user has access
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || conversation.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const message = await Message.create({
            conversation: conversationId,
            sender: userId,
            senderModel: 'user',
            content: content.trim(),
            messageType: 'text'
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: content.trim().substring(0, 100),
            lastMessageAt: new Date()
        });

        res.status(201).json({ message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// Send a message (partner)
const sendMessageAsPartner = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { content } = req.body;
        const partnerId = req.foodPartner._id;

        if (!content?.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Verify conversation exists and partner has access
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || conversation.partner.toString() !== partnerId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const message = await Message.create({
            conversation: conversationId,
            sender: partnerId,
            senderModel: 'foodpartner',
            content: content.trim(),
            messageType: 'text'
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: content.trim().substring(0, 100),
            lastMessageAt: new Date()
        });

        res.status(201).json({ message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// Send voice message (user)
const sendVoiceAsUser = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { duration } = req.body;
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ message: 'Voice file is required' });
        }

        // Verify conversation exists and user has access
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || conversation.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get file extension from original name or default to webm
        const ext = req.file.originalname?.split('.').pop() || 'webm';
        
        // Upload voice to Cloudinary as audio (returns direct URL string)
        const voiceUrl = await storageService.uploadFile(req.file.buffer, `voice_${uuid()}.${ext}`, 'audio');

        const message = await Message.create({
            conversation: conversationId,
            sender: userId,
            senderModel: 'user',
            messageType: 'voice',
            voiceUrl: voiceUrl,
            voiceDuration: parseFloat(duration) || 0
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: '🎤 Voice message',
            lastMessageAt: new Date()
        });

        res.status(201).json({ message });
    } catch (error) {
        console.error('Send voice error:', error);
        res.status(500).json({ message: 'Failed to send voice message' });
    }
};

// Send voice message (partner)
const sendVoiceAsPartner = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { duration } = req.body;
        const partnerId = req.foodPartner._id;

        if (!req.file) {
            return res.status(400).json({ message: 'Voice file is required' });
        }

        // Verify conversation exists and partner has access
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || conversation.partner.toString() !== partnerId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get file extension from original name or default to webm
        const ext = req.file.originalname?.split('.').pop() || 'webm';
        
        // Upload voice to Cloudinary as audio (returns direct URL string)
        const voiceUrl = await storageService.uploadFile(req.file.buffer, `voice_${uuid()}.${ext}`, 'audio');

        const message = await Message.create({
            conversation: conversationId,
            sender: partnerId,
            senderModel: 'foodpartner',
            messageType: 'voice',
            voiceUrl: voiceUrl,
            voiceDuration: parseFloat(duration) || 0
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: '🎤 Voice message',
            lastMessageAt: new Date()
        });

        res.status(201).json({ message });
    } catch (error) {
        console.error('Send voice error:', error);
        res.status(500).json({ message: 'Failed to send voice message' });
    }
};

// Get unread count for user
const getUnreadCountUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({ user: userId });
        const conversationIds = conversations.map(c => c._id);

        const unreadCount = await Message.countDocuments({
            conversation: { $in: conversationIds },
            senderModel: 'foodpartner',
            read: false
        });

        res.json({ unreadCount });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Failed to get unread count' });
    }
};

// Get unread count for partner
const getUnreadCountPartner = async (req, res) => {
    try {
        const partnerId = req.foodPartner._id;

        const conversations = await Conversation.find({ partner: partnerId });
        const conversationIds = conversations.map(c => c._id);

        const unreadCount = await Message.countDocuments({
            conversation: { $in: conversationIds },
            senderModel: 'user',
            read: false
        });

        res.json({ unreadCount });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Failed to get unread count' });
    }
};

// Delete message
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const role = req.user ? 'user' : 'foodpartner';
        const senderId = req.user ? req.user._id : req.foodPartner._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Verify ownership
        if (message.sender.toString() !== senderId.toString() || message.senderModel !== role) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        const conversationId = message.conversation;

        await Message.findByIdAndDelete(messageId);

        // If no messages left, delete the whole conversation
        const latestMessage = await Message.findOne({ conversation: conversationId }).sort({ createdAt: -1 });

        if (!latestMessage) {
            await Conversation.findByIdAndDelete(conversationId);
            return res.json({ message: 'Message deleted and chat removed successfully' });
        }

        // Keep conversation preview in sync
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage:
                latestMessage.messageType === 'voice'
                    ? '🎤 Voice message'
                    : (latestMessage.content || '').substring(0, 100),
            lastMessageAt: latestMessage.createdAt
        });

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
};

// Delete entire conversation
const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?._id;
        const partnerId = req.foodPartner?._id;

        // Verify conversation exists
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Verify user has access to this conversation
        const isUserInConvo = userId && conversation.user.toString() === userId.toString();
        const isPartnerInConvo = partnerId && conversation.partner.toString() === partnerId.toString();

        if (!isUserInConvo && !isPartnerInConvo) {
            return res.status(403).json({ message: 'Not authorized to delete this conversation' });
        }

        // Delete all messages in the conversation
        await Message.deleteMany({ conversation: conversationId });

        // Delete the conversation itself
        await Conversation.findByIdAndDelete(conversationId);

        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({ message: 'Failed to delete conversation' });
    }
};

module.exports = {
    getOrCreateConversation,
    getUserConversations,
    getPartnerConversations,
    getMessages,
    sendMessageAsUser,
    sendMessageAsPartner,
    sendVoiceAsUser,
    sendVoiceAsPartner,
    getUnreadCountUser,
    getUnreadCountPartner,
    deleteMessage,
    deleteConversation
};
