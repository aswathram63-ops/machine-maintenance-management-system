
const express = require("express");
const router = express.Router();

const {
    getBreakdowns,
    getMachines,
    getStaff,
    createBreakdown,
    getBreakdownById,
    updateBreakdown,
    updateBreakdownStatus,
    deleteBreakdown
} = require("../controllers/breakdownController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// All routes require authentication
router.use(verifyToken);


// 1. GET BREAKDOWNS
// Admin: All breakdowns
// Staff: Assigned breakdowns
// Operator: Own reported breakdowns
router.get(
    "/",
    authorizeRoles("Admin", "Maintenance Staff", "Operator"),
    getBreakdowns
);


// 2. GET MACHINES FOR REPORTING
router.get(
    "/machines",
    authorizeRoles("Admin", "Maintenance Staff", "Operator"),
    getMachines
);


// 3. GET STAFF FOR ASSIGNMENT (ADMIN ONLY)
router.get(
    "/staff",
    authorizeRoles("Admin"),
    getStaff
);


// 4. CREATE BREAKDOWN
// All three roles can report breakdowns
router.post(
    "/",
    authorizeRoles("Admin", "Maintenance Staff", "Operator"),
    createBreakdown
);


// 5. UPDATE ASSIGNED BREAKDOWN STATUS (STAFF ONLY)
router.patch(
    "/:id/status",
    authorizeRoles("Maintenance Staff"),
    updateBreakdownStatus
);


// 6. GET BREAKDOWN BY ID
router.get(
    "/:id",
    authorizeRoles("Admin", "Maintenance Staff", "Operator"),
    getBreakdownById
);


// 7. FULL BREAKDOWN UPDATE (ADMIN ONLY)
router.put(
    "/:id",
    authorizeRoles("Admin"),
    updateBreakdown
);


// 8. DELETE BREAKDOWN (ADMIN ONLY)
router.delete(
    "/:id",
    authorizeRoles("Admin"),
    deleteBreakdown
);


module.exports = router;
