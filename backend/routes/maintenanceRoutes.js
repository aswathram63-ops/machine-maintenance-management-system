
const express = require("express");
const router = express.Router();

const {
    getMaintenances,
    getMaintenanceMachines,
    getMaintenanceStaff,
    addMaintenance,
    getMaintenanceById,
    updateMaintenance,
    updateMaintenanceStatus,
    deleteMaintenance
} = require("../controllers/maintenanceController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// All routes require authentication
router.use(verifyToken);


// 1. GET MAINTENANCE RECORDS
// Admin: all records
// Maintenance Staff: only assigned records
router.get(
    "/",
    authorizeRoles("Admin", "Maintenance Staff","Operator"),
    getMaintenances
);


// 2. GET MACHINES FOR DROPDOWN (ADMIN ONLY)
router.get(
    "/machines",
    authorizeRoles("Admin"),
    getMaintenanceMachines
);


// 3. GET STAFF FOR DROPDOWN (ADMIN ONLY)
router.get(
    "/staff",
    authorizeRoles("Admin"),
    getMaintenanceStaff
);


// 4. ADD MAINTENANCE (ADMIN ONLY)
router.post(
    "/",
    authorizeRoles("Admin"),
    addMaintenance
);


// 5. UPDATE ASSIGNED MAINTENANCE STATUS (STAFF)
router.patch(
    "/:id/status",
    authorizeRoles("Maintenance Staff"),
    updateMaintenanceStatus
);


// 6. GET MAINTENANCE BY ID (ADMIN ONLY)
router.get(
    "/:id",
    authorizeRoles("Admin"),
    getMaintenanceById
);


// 7. UPDATE MAINTENANCE (ADMIN ONLY)
router.put(
    "/:id",
    authorizeRoles("Admin"),
    updateMaintenance
);


// 8. DELETE MAINTENANCE (ADMIN ONLY)
router.delete(
    "/:id",
    authorizeRoles("Admin"),
    deleteMaintenance
);


module.exports = router;
