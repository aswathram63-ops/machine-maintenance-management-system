
const express = require("express");
const router = express.Router();

const {
    getDashboardData
} = require("../controllers/dashboardController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.get(
    "/",
    verifyToken,
    authorizeRoles("Admin"),
    getDashboardData
);

module.exports = router;
