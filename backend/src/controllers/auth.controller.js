const userModel = require("../models/user.model")
const foodPartnerModel = require("../models/foodpartner.model")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const storageService = require('../services/storage.service');
const { v4: uuid } = require("uuid");
const { validateEmail, validatePassword, validatePhoneNumber, validateAddress, validateName } = require('../utils/validations');

// Check if email exists
async function checkEmailExists(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    // Check in both user and food partner models
    const userExists = await userModel.findOne({ email });
    const partnerExists = await foodPartnerModel.findOne({ email });

    res.status(200).json({
      exists: !!(userExists || partnerExists)
    });
  } catch (err) {
    console.error("Error in checkEmailExists:", err);
    res.status(500).json({
      message: "Internal server error"
    });
  }
}

async function registerUser(req, res) {

    const { fullName, email, password } = req.body;

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        message: emailValidation.message
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: passwordValidation.message
      });
    }

    // Validate full name
    const nameValidation = validateName(fullName);
    if (!nameValidation.valid) {
      return res.status(400).json({
        message: nameValidation.message
      });
    }

    const isUserAlreadyExists = await userModel.findOne({
        email
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "This email is already registered"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePicUrl = null;
    
    // Upload profile picture if provided
    if (req.file) {
        try {
            const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid());
            profilePicUrl = fileUploadResult.url;
        } catch (err) {
            console.error("Error uploading profile picture:", err);
        }
    }

    const user = await userModel.create({
        fullName,
        email,
        password: hashedPassword,
        profilePic: profilePicUrl
    })

    const token = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET)

    res.cookie("token", token)

    res.status(201).json({
        message: "User registered successfully",
        user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic
        }
    })

}

async function loginUser(req, res) {

    const { email, password } = req.body;

    const user = await userModel.findOne({
        email
    })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET)

    res.cookie("token", token)

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName
        }
    })
}

function logoutUser(req, res) {
    res.clearCookie("token");
    res.status(200).json({
        message: "User logged out successfully"
    });
}


async function registerFoodPartner(req, res) {

    const { name, email, password, phone, address, contactName, category } = req.body;

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        message: emailValidation.message
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: passwordValidation.message
      });
    }

    // Validate business name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return res.status(400).json({
        message: `Business name: ${nameValidation.message}`
      });
    }

    // Validate contact name
    const contactNameValidation = validateName(contactName);
    if (!contactNameValidation.valid) {
      return res.status(400).json({
        message: `Contact name: ${contactNameValidation.message}`
      });
    }

    // Validate phone
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({
        message: phoneValidation.message
      });
    }

    // Validate address
    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
      return res.status(400).json({
        message: addressValidation.message
      });
    }

    const isAccountAlreadyExists = await foodPartnerModel.findOne({
        email
    })

    if (isAccountAlreadyExists) {
        return res.status(400).json({
            message: "This email is already registered"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const foodPartner = await foodPartnerModel.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        contactName,
        category
    })

    const token = jwt.sign({
        id: foodPartner._id,
    }, process.env.JWT_SECRET)

    res.cookie("token", token)

    res.status(201).json({
        message: "Food partner registered successfully",
        foodPartner: {
            _id: foodPartner._id,
            email: foodPartner.email,
            name: foodPartner.name,
            address: foodPartner.address,
            contactName: foodPartner.contactName,
            phone: foodPartner.phone,
            category: foodPartner.category
        }
    })

}

async function loginFoodPartner(req, res) {

    const { email, password } = req.body;

    const foodPartner = await foodPartnerModel.findOne({
        email
    })

    if (!foodPartner) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, foodPartner.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign({
        id: foodPartner._id,
    }, process.env.JWT_SECRET)

    res.cookie("token", token)

    res.status(200).json({
        message: "Food partner logged in successfully",
        foodPartner: {
            _id: foodPartner._id,
            email: foodPartner.email,
            name: foodPartner.name
        }
    })
}

function logoutFoodPartner(req, res) {
    res.clearCookie("token");
    res.status(200).json({
        message: "Food partner logged out successfully"
    });
}

async function getCurrentUser(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                profilePic: user.profilePic
            }
        });
    } catch (err) {
        console.error("Error in getCurrentUser:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

module.exports = {
    checkEmailExists,
    registerUser,
    loginUser,
    logoutUser,
    registerFoodPartner,
    loginFoodPartner,
    logoutFoodPartner,
    getCurrentUser
}