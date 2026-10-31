
const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/settingsController");

const { verifyToken } = require("../middleware/authMiddleware");

// All settings routes require authentication
router.use(verifyToken);

// Get logged-in user's profile
router.get("/profile", getProfile);

// Update profile
router.put("/profile", updateProfile);

// Change password
router.put("/change-password", changePassword);

module.exports = router;
