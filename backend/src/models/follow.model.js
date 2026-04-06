const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'foodpartner',
        required: true
    }
}, {
    timestamps: true
});

// Compound index to ensure a user can only follow a partner once
followSchema.index({ user: 1, foodPartner: 1 }, { unique: true });

const followModel = mongoose.model("follow", followSchema);

module.exports = followModel;
