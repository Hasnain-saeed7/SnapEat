const express = require('express');
const foodController = require("../controllers/food.controller")
const deleteCommentController = require("../controllers/deleteComment.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const router = express.Router();
const multer = require('multer');


const upload = multer({
    storage: multer.memoryStorage(),
})


/* POST /api/food/ [protected]*/
router.post('/',
    authMiddleware.authFoodPartnerMiddleware,
    upload.single("mama"),
    foodController.createFood)


/* GET /api/food/ [protected - user or partner] */
router.get("/",
    authMiddleware.authUserOrPartnerMiddleware,
    foodController.getFoodItems)


router.post('/like',
    authMiddleware.authUserMiddleware,
    foodController.likeFood)


router.post('/save',
    authMiddleware.authUserMiddleware,
    foodController.saveFood
)


router.get('/save',
    authMiddleware.authUserMiddleware,
    foodController.getSaveFood
)
 

router.post('/comment',
    authMiddleware.authUserMiddleware,
    foodController.addComments
) 

router.get('/comments',
    authMiddleware.authUserMiddleware,
    foodController.getComments
) 

router.delete('/comment/:commentId',
    authMiddleware.authUserMiddleware,
    deleteCommentController.deleteComment
) 

/* DELETE /api/food/:foodId [protected - food partner only] */
router.delete('/:foodId',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.deleteFood
)

module.exports = router