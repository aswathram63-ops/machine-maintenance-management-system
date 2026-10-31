
const express = require("express");
const router = express.Router();

const {
    getMachines,
    addMachine,
    getMachineById,
    updateMachine,
    deleteMachine
} = require("../controllers/machineController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// View machines - Admin and Operator
router.get(
    "/",
    verifyToken,
    authorizeRoles("Admin", "Operator"),
    getMachines
);

// Add machine - Admin only
router.post(
    "/",
    verifyToken,
    authorizeRoles("Admin"),
    addMachine
);

// View machine details - Admin and Operator
router.get(
    "/:id",
    verifyToken,
    authorizeRoles("Admin", "Operator"),
    getMachineById
);

// Update machine - Admin only
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("Admin"),
    updateMachine
);

// Delete machine - Admin only
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("Admin"),
    deleteMachine
);

module.exports = router;
