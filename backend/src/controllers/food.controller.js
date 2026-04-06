const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model")
const saveModel = require("../models/save.model") 
const commentModel = require("../models/comments.model")
const { v4: uuid } = require("uuid")


async function createFood(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Video file is required" });
        }

        // Upload video to Cloudinary
        const fileName = `${uuid()}.mp4`; // Add file extension for proper handling
        console.log("Uploading file to Cloudinary:", fileName);
        
        const fileUploadResult = await storageService.uploadFile(req.file.buffer, fileName);
        
        console.log("Upload successful, URL:", fileUploadResult);
        
        if (!fileUploadResult) {
            throw new Error("File upload returned empty result");
        }

        const foodItem = await foodModel.create({
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price) || 0,
            video: fileUploadResult,
            foodPartner: req.foodPartner._id
        });

        res.status(201).json({
            message: "food created successfully",
            food: foodItem
        });
    } catch (error) {
        console.error("Error in createFood:", error);
        
        // More detailed error message
        let errorMessage = "Failed to create food item";
        if (error.message && error.message.includes("validation failed")) {
            errorMessage = "Video upload failed or returned invalid data";
        } else if (error.http_code) {
            errorMessage = `Cloudinary error: ${error.message}`;
        }
        
        res.status(500).json({ 
            message: errorMessage, 
            error: error.message,
            details: error.http_code ? `HTTP ${error.http_code}` : null
        });
    }
}

async function getFoodItems(req, res) {
    const foodItems = await foodModel.find({}).populate('foodPartner', 'name profilePic category')
    res.status(200).json({
        message: "Food items fetched successfully",
        foodItems
    })
}


async function likeFood(req, res) {
    const { foodId } = req.body;
    const user = req.user;

    const isAlreadyLiked = await likeModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadyLiked) {
        await likeModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: -1 }
        })

        return res.status(200).json({
            message: "Food unliked successfully"
        })
    }

    const like = await likeModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { likeCount: 1 }
    })

    res.status(201).json({
        message: "Food liked successfully",
        like
    })

}

async function saveFood(req, res) {
    try {
        const { foodId } = req.body;
        const user = req.user;

        if (!foodId) {
            return res.status(400).json({ message: "Missing foodId in request body." });
        }
        if (!user || !user._id) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        const foodExists = await foodModel.findById(foodId);
        if (!foodExists) {
            return res.status(404).json({ message: "Food item not found." });
        }

        const isAlreadySaved = await saveModel.findOne({
            user: user._id,
            food: foodId
        });

        if (isAlreadySaved) {
            await saveModel.deleteOne({
                user: user._id,
                food: foodId
            });

            await foodModel.findByIdAndUpdate(foodId, {
                $inc: { savesCount: -1 }
            });

            return res.status(200).json({
                message: "Food unsaved successfully"
            });
        }

        const save = await saveModel.create({
            user: user._id,
            food: foodId
        });

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: 1 }
        });

        res.status(201).json({
            message: "Food saved successfully",
            save
        });
    } catch (err) {
        console.error("Error in saveFood:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

async function getSaveFood(req, res) {

    const user = req.user;

    const savedFoods = await saveModel.find({ user: user._id }).populate({
        path: 'food',
        populate: {
            path: 'foodPartner',
            select: 'name profilePic category'
        }
    });

    if (!savedFoods || savedFoods.length === 0) {
        return res.status(404).json({ message: "No saved foods found" });
    }

    res.status(200).json({
        message: "Saved foods retrieved successfully",
        savedFoods
    });

}
 



async function addComments(req, res) {
    try {
        const { foodId, comment } = req.body;
        const user = req.user;

        if (!foodId || !comment) {
            return res.status(400).json({ message: "Missing foodId or comment." });
        }

        const foodExists = await foodModel.findById(foodId);
        if (!foodExists) {
            return res.status(404).json({ message: "Food item not found." });
        }

        const newComment = await commentModel.create({
            user: user._id,
            foodReference: foodId,
            referenceId: foodId,
            text: comment
        });

        // ✅ Populate so frontend gets fullName and profilePic immediately
        const populated = await commentModel
            .findById(newComment._id)
            .populate('user', 'fullName email profilePic');

        // ✅ Increment commentsCount on the food doc
        await foodModel.findByIdAndUpdate(foodId, { $inc: { commentsCount: 1 } });

        res.status(201).json({
            message: "Comment added successfully",
            comment: populated
        });

    } catch (err) {
        console.error("Error in addComments:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
}


async function getComments(req, res) {
    try {
        const { foodId } = req.query;
        if (!foodId) {
            return res.status(400).json({ message: "Missing foodId in query parameters." });
        }
        
        const comments = await commentModel
            .find({ foodReference: foodId })
            .populate('user', 'fullName email profilePic')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Comments retrieved successfully",
            comments
        });
    } catch (err) {
        console.error("Error in getComments:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
}


    
  




async function deleteFood(req, res) {
    try {
        const { foodId } = req.params;
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food item not found." });
        }

        await foodModel.findByIdAndDelete(foodId);

        res.status(200).json({ message: "Food item deleted successfully." });
    } catch (err) {
        console.error("Error in deleteFood:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSaveFood,
    addComments,
    getComments,
    deleteFood
}