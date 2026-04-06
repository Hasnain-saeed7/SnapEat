const express = require('express');
const foodPartnerController = require("../controllers/food-partner.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const multer = require('multer');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
});

/* /api/food-partner/:id */
router.get("/:id",
    authMiddleware.authUserOrPartnerMiddleware,
    foodPartnerController.getFoodPartnerById)

/* /api/food-partner/:id/profile-pic */
router.post("/:id/profile-pic",
    authMiddleware.authFoodPartnerMiddleware,
    upload.single("profilePic"),
    foodPartnerController.uploadProfilePic)

/* /api/food-partner/:id/follow - toggle follow/unfollow */
router.post("/:id/follow",
    authMiddleware.authUserOrPartnerMiddleware,
    foodPartnerController.toggleFollow)

/* /api/food-partner/:id/category - update category */
router.put("/:id/category",
    authMiddleware.authFoodPartnerMiddleware,
    foodPartnerController.updateCategory)

/* /api/food-partner/:id - update profile */
router.put("/:id",
    authMiddleware.authFoodPartnerMiddleware,
    foodPartnerController.updateProfile)

module.exports = router; 