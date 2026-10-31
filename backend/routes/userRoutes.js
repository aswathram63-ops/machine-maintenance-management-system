
const express = require("express");
const router = express.Router();

const {
    getUsers,
    createUser,
    updateUser,
    updateUserStatus
} = require("../controllers/userController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Admin-only access
router.use(verifyToken, authorizeRoles("Admin"));

// GET all users
router.get("/", getUsers);

// CREATE user
router.post("/", createUser);

// UPDATE user details
router.put("/:id", updateUser);

// ACTIVATE / DEACTIVATE user
router.patch("/:id/status", updateUserStatus);

module.exports = router;
