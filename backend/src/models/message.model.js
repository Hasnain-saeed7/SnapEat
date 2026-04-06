const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'conversation',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['user', 'foodpartner']
    },
    content: {
        type: String,
        default: ''
    },
    messageType: {
        type: String,
        enum: ['text', 'voice'],
        default: 'text'
    },
    voiceUrl: {
        type: String,
        default: null
    },
    voiceDuration: {
        type: Number,
        default: 0
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const conversationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'foodpartner',
        required: true
    },
    lastMessage: {
        type: String,
        default: ''
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to ensure one conversation per user-partner pair
conversationSchema.index({ user: 1, partner: 1 }, { unique: true });

const Message = mongoose.model('message', messageSchema);
const Conversation = mongoose.model('conversation', conversationSchema);

module.exports = { Message, Conversation };
