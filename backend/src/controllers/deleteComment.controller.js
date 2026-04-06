const commentModel = require('../models/comments.model');
const foodModel = require('../models/food.model');


async function deleteComment(req, res) {
    try {
        const commentId = req.params.commentId;
        const userId = req.user._id;
        const comment = await commentModel.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }   
        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this comment" });
        }   
        await commentModel.findByIdAndDelete(commentId);

        // Decrement commentsCount on the food doc
        await foodModel.findByIdAndUpdate(comment.foodReference, { $inc: { commentsCount: -1 } });

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
        console.error("Error in deleteComment:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }   
}

module.exports = {
    deleteComment
};

