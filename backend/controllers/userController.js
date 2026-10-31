
const db = require("../config/db");
const bcrypt = require("bcrypt");

// GET ALL USERS + SEARCH + ROLE FILTER
const getUsers = async (req, res) => {
    try {
        const { search, role } = req.query;

        let sql = `
            SELECT user_id, name, email, role, is_active, created_at
            FROM users
            WHERE 1=1
        `;

        const params = [];

        if (search) {
            sql += " AND (name LIKE ? OR email LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }

        if (role) {
            sql += " AND role = ?";
            params.push(role);
        }

        sql += " ORDER BY created_at DESC";

        const [rows] = await db.query(sql, params);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

// CREATE USER
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const allowedRoles = [
            "Admin",
            "Maintenance Staff",
            "Operator"
        ];

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        const [existing] = await db.query(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users (name, email, password, role)
             VALUES (?, ?, ?, ?)`,
            [name.trim(), email.trim(), hashedPassword, role]
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user_id: result.insertId
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message
        });
    }
};

// UPDATE USER DETAILS
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        const allowedRoles = [
            "Admin",
            "Maintenance Staff",
            "Operator"
        ];

        if (!name || !email || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email and role are required"
            });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role"
            });
        }

        const [user] = await db.query(
            "SELECT user_id FROM users WHERE user_id = ?",
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const [duplicate] = await db.query(
            "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
            [email, id]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already belongs to another user"
            });
        }

        await db.query(
            `UPDATE users
             SET name = ?, email = ?, role = ?
             WHERE user_id = ?`,
            [name.trim(), email.trim(), role, id]
        );

        res.json({
            success: true,
            message: "User updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error.message
        });
    }
};

// ACTIVATE / DEACTIVATE USER
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "is_active must be true or false"
            });
        }

        if (Number(id) === req.user.userId && !is_active) {
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own account"
            });
        }

        const [user] = await db.query(
            "SELECT user_id FROM users WHERE user_id = ?",
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await db.query(
            "UPDATE users SET is_active = ? WHERE user_id = ?",
            [is_active, id]
        );

        res.json({
            success: true,
            message: is_active
                ? "User activated successfully"
                : "User deactivated successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update user status",
            error: error.message
        });
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    updateUserStatus
};
