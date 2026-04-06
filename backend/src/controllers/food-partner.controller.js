const foodPartnerModel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');
const followModel = require('../models/follow.model');

async function getFoodPartnerById(req, res) {
    try {
        const foodPartnerId = req.params.id;
        const followerId = req.user?._id || req.foodPartner?._id;

        // Validate MongoDB ObjectId format first
        if (!foodPartnerId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid food partner ID format" });
        }

        const foodPartner = await foodPartnerModel.findById(foodPartnerId);

        if (!foodPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        const foodItemsByFoodPartner = await foodModel.find({ foodPartner: foodPartnerId });

        // Check if current user is following this partner
        let isFollowing = false;
        if (followerId) {
            const followRecord = await followModel.findOne({
                user: followerId,
                foodPartner: foodPartnerId
            });
            isFollowing = !!followRecord;
        }

        res.status(200).json({
            message: "Food partner retrieved successfully",
            foodPartner: {
                ...foodPartner.toObject(),
                foodItems: foodItemsByFoodPartner,
                isFollowing
            }
        });

    } catch (error) {
        console.error('getFoodPartnerById error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function uploadProfilePic(req, res) {
    try {
        const foodPartnerId = req.params.id;
        
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const storageService = require('../services/storage.service');
        const { v4: uuid } = require("uuid");
        
        const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid());

        const updatedPartner = await foodPartnerModel.findByIdAndUpdate(
            foodPartnerId,
            { profilePic: fileUploadResult.url },
            { new: true }
        );

        if (!updatedPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        res.status(200).json({
            message: "Profile picture updated successfully",
            profilePic: fileUploadResult.url
        });
    } catch (error) {
        console.error('Profile pic upload error:', error);
        res.status(500).json({ message: "Failed to upload profile picture" });
    }
}

async function toggleFollow(req, res) {
    try {
        const foodPartnerId = req.params.id;
        const followerId = req.user?._id || req.foodPartner?._id;

        if (!followerId) {
            return res.status(401).json({ message: "Please login first" });
        }

        // Validate MongoDB ObjectId format
        if (!foodPartnerId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid food partner ID format" });
        }

        // Food partners cannot follow themselves
        if (followerId.toString() === foodPartnerId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const foodPartner = await foodPartnerModel.findById(foodPartnerId);
        if (!foodPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        // Check if already following
        const existingFollow = await followModel.findOne({
            user: followerId,
            foodPartner: foodPartnerId
        });

        if (existingFollow) {
            // Unfollow
            await followModel.deleteOne({ _id: existingFollow._id });
            await foodPartnerModel.findByIdAndUpdate(foodPartnerId, {
                $inc: { followersCount: -1 }
            });

            return res.status(200).json({
                message: "Unfollowed successfully",
                isFollowing: false,
                followersCount: Math.max(0, (foodPartner.followersCount || 0) - 1)
            });
        } else {
            // Follow
            await followModel.create({
                user: followerId,
                foodPartner: foodPartnerId
            });
            await foodPartnerModel.findByIdAndUpdate(foodPartnerId, {
                $inc: { followersCount: 1 }
            });

            return res.status(200).json({
                message: "Followed successfully",
                isFollowing: true,
                followersCount: (foodPartner.followersCount || 0) + 1
            });
        }
    } catch (error) {
        console.error('Toggle follow error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function updateCategory(req, res) {
    try {
        const foodPartnerId = req.params.id;
        const { category } = req.body;

        if (!category) {
            return res.status(400).json({ message: "Category is required" });
        }

        const updatedPartner = await foodPartnerModel.findByIdAndUpdate(
            foodPartnerId,
            { category },
            { new: true }
        );

        if (!updatedPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        res.status(200).json({
            message: "Category updated successfully",
            category: updatedPartner.category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: "Failed to update category" });
    }
}

async function updateProfile(req, res) {
    try {
        const foodPartnerId = req.params.id;
        const { name, contactName, phone, email, address, category } = req.body;

        // Verify the logged-in partner is updating their own profile
        if (req.foodPartner._id.toString() !== foodPartnerId) {
            return res.status(403).json({ message: "Not authorized to update this profile" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (contactName) updateData.contactName = contactName;
        if (phone) updateData.phone = phone;
        if (email) updateData.email = email;
        if (address) updateData.address = address;
        if (category) updateData.category = category;

        const updatedPartner = await foodPartnerModel.findByIdAndUpdate(
            foodPartnerId,
            updateData,
            { new: true }
        );

        if (!updatedPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            foodPartner: updatedPartner
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: "Failed to update profile" });
    }
}

module.exports = {
    getFoodPartnerById,
    uploadProfilePic,
    toggleFollow,
    updateCategory,
    updateProfile
};