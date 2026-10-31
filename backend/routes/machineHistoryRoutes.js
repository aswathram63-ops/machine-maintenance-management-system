const express = require("express");
const router = express.Router();

const {
    getMachineHistory
} = require("../controllers/machineHistoryController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Admin-only access
router.get(
    "/:id",
    verifyToken,
    authorizeRoles("Admin"),
    getMachineHistory
);

module.exports = router;