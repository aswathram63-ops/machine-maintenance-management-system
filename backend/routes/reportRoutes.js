
const express = require("express");
const router = express.Router();

const {
    getReportOverview,
    getMachineStatusReport,
    getBreakdownReport,
    getMaintenanceReport,
    getStaffPerformanceReport
} = require("../controllers/reportController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Admin-only access
router.use(verifyToken, authorizeRoles("Admin"));

// Report APIs
router.get("/overview", getReportOverview);
router.get("/machine-status", getMachineStatusReport);
router.get("/breakdowns", getBreakdownReport);
router.get("/maintenance", getMaintenanceReport);
router.get("/staff-performance", getStaffPerformanceReport);

module.exports = router;
