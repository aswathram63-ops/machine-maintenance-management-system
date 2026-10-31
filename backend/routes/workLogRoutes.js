
const express = require("express");
const router = express.Router();

const {
    getWorkLogs,
    getBreakdowns,
    getMaintenances,
    getStaff,
    createWorkLog,
    getWorkLogById
} = require("../controllers/workLogController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.use(verifyToken);

// 1. GET WORK LOGS
router.get(
    "/",
    authorizeRoles("Admin", "Maintenance Staff"),
    getWorkLogs
);

// 2. GET BREAKDOWNS
router.get(
    "/breakdowns",
    authorizeRoles("Admin", "Maintenance Staff"),
    getBreakdowns
);

// 3. GET MAINTENANCE TASKS
router.get(
    "/maintenances",
    authorizeRoles("Admin", "Maintenance Staff"),
    getMaintenances
);

// 4. GET MAINTENANCE STAFF
router.get(
    "/staff",
    authorizeRoles("Admin"),
    getStaff
);

// 5. CREATE WORK LOG
router.post(
    "/",
    authorizeRoles("Admin", "Maintenance Staff"),
    createWorkLog
);

// 6. GET WORK LOG BY ID
router.get(
    "/:id",
    authorizeRoles("Admin", "Maintenance Staff"),
    getWorkLogById
);

module.exports = router;
