const foodPartnerModel = require("../models/foodpartner.model")
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken");


async function authFoodPartnerMiddleware(req, res, next) {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Please login first"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const foodPartner = await foodPartnerModel.findById(decoded.id);

        req.foodPartner = foodPartner

        next()

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token"
        })

    }

}

async function authUserMiddleware(req, res, next) {

    const token = req.cookies.token;

    if (!token) {
        console.log('❌ No token found in cookies')
        return res.status(401).json({
            message: "Please login first"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log('✅ Token decoded:', decoded)

        const user = await userModel.findById(decoded.id);
        console.log('✅ User found:', user ? user._id : 'null')

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            })
        }

        req.user = user

        next()

    } catch (err) {
        console.log('❌ Token verification error:', err.message)
        return res.status(401).json({
            message: "Invalid token"
        })

    }

}

// ✅ Middleware that accepts both users and food partners
async function authUserOrPartnerMiddleware(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Please login first"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Try to find as user first
        const user = await userModel.findById(decoded.id);
        if (user) {
            req.user = user
            req.accountType = 'user'
            return next()
        }

        // If not found as user, try as food partner
        const foodPartner = await foodPartnerModel.findById(decoded.id);
        if (foodPartner) {
            req.foodPartner = foodPartner
            req.accountType = 'foodPartner'
            return next()
        }

        // Neither found
        return res.status(401).json({
            message: "Account not found"
        })

    } catch (err) {
        return res.status(401).json({
            message: "Invalid token"
        })
    }
}

module.exports = {
    authFoodPartnerMiddleware,
    authUserMiddleware,
    authUserOrPartnerMiddleware
}