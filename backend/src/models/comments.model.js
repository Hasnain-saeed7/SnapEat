const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }, 

    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    foodReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);