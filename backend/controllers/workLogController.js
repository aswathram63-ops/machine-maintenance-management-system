
const db = require("../config/db");

// 1. GET ALL WORK LOGS
// Admin: All work logs
// Maintenance Staff: Own work logs
const getWorkLogs = async (req, res) => {
    try {
        const { search } = req.query;

        let sql = `
            SELECT
                w.*,
                b.description AS breakdown_description,
                COALESCE(b.status, mt.status) AS breakdown_status,
                CASE
                    WHEN w.maintenance_id IS NOT NULL
                    THEN 'Maintenance'
                    ELSE 'Breakdown'
                END AS task_type,
                m.machine_name,
                m.machine_code,
                u.name AS staff_name
            FROM work_logs w
            LEFT JOIN breakdowns b
                ON w.breakdown_id = b.breakdown_id
            LEFT JOIN maintenances mt
                ON w.maintenance_id = mt.maintenance_id
            JOIN machines m
                ON m.machine_id = COALESCE(b.machine_id, mt.machine_id)
            JOIN users u
                ON w.staff_id = u.user_id
            WHERE 1=1
        `;

        const params = [];

        if (req.user.role === "Maintenance Staff") {
            sql += " AND w.staff_id = ?";
            params.push(req.user.userId);
        }

        if (search) {
            sql += `
                AND (
                    m.machine_name LIKE ?
                    OR m.machine_code LIKE ?
                    OR u.name LIKE ?
                    OR w.work_description LIKE ?
                )
            `;

            const keyword = `%${search}%`;
            params.push(keyword, keyword, keyword, keyword);
        }

        sql += " ORDER BY w.log_date DESC";

        const [rows] = await db.query(sql, params);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get work logs error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch work logs",
            error: error.message
        });
    }
};


// 2. GET BREAKDOWNS FOR WORK LOG DROPDOWN
// Admin: All open/in-progress breakdowns
// Staff: Only assigned open/in-progress breakdowns
const getBreakdowns = async (req, res) => {
    try {
        let sql = `
            SELECT
                b.breakdown_id,
                b.machine_id,
                b.description,
                b.status,
                m.machine_name,
                m.machine_code
            FROM breakdowns b
            JOIN machines m
                ON b.machine_id = m.machine_id
            WHERE b.status IN ('Open', 'In Progress')
        `;

        const params = [];

        if (req.user.role === "Maintenance Staff") {
            sql += " AND b.assigned_to = ?";
            params.push(req.user.userId);
        }

        sql += " ORDER BY b.reported_at DESC";

        const [rows] = await db.query(sql, params);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get work log breakdowns error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch breakdowns"
        });
    }
};


// 3. GET MAINTENANCE TASKS FOR WORK LOG DROPDOWN
// Admin: All scheduled/in-progress maintenance
// Staff: Only maintenance assigned to them
const getMaintenances = async (req, res) => {
    try {
        let sql = `
            SELECT
                mt.maintenance_id,
                mt.machine_id,
                mt.description,
                mt.status,
                mt.maintenance_date,
                mt.assigned_to,
                m.machine_name,
                m.machine_code
            FROM maintenances mt
            JOIN machines m
                ON mt.machine_id = m.machine_id
            WHERE mt.status IN ('Scheduled', 'In Progress')
        `;

        const params = [];

        if (req.user.role === "Maintenance Staff") {
            sql += " AND mt.assigned_to = ?";
            params.push(req.user.userId);
        }

        sql += " ORDER BY mt.maintenance_date ASC";

        const [rows] = await db.query(sql, params);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get work log maintenances error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch maintenance tasks"
        });
    }
};


// 4. GET ACTIVE MAINTENANCE STAFF (ADMIN)
const getStaff = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT user_id, name, email
            FROM users
            WHERE role = 'Maintenance Staff'
            AND is_active = TRUE
            ORDER BY name
        `);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get staff error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch staff"
        });
    }
};


// 5. CREATE WORK LOG
// Exactly one task type must be selected:
// breakdown_id OR maintenance_id
// Admin: Selects staff
// Staff: Automatically uses their own account
const createWorkLog = async (req, res) => {
    try {
        const {
            breakdown_id,
            maintenance_id,
            staff_id,
            work_description
        } = req.body;

        const hasBreakdown = Boolean(breakdown_id);
        const hasMaintenance = Boolean(maintenance_id);

        if (hasBreakdown === hasMaintenance) {
            return res.status(400).json({
                success: false,
                message: "Select either a breakdown or a maintenance task"
            });
        }

        if (!work_description || !work_description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Work description is required"
            });
        }

        // Determine staff ID based on role
        const selectedStaffId =
            req.user.role === "Admin"
                ? staff_id
                : req.user.userId;

        if (!selectedStaffId) {
            return res.status(400).json({
                success: false,
                message: "Maintenance staff is required"
            });
        }

        // Validate active maintenance staff
        const [staff] = await db.query(
            `SELECT user_id
             FROM users
             WHERE user_id = ?
             AND role = 'Maintenance Staff'
             AND is_active = TRUE`,
            [selectedStaffId]
        );

        if (staff.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or inactive maintenance staff"
            });
        }

        // BREAKDOWN WORK LOG
        if (hasBreakdown) {
            let sql = `
                SELECT breakdown_id, status, assigned_to
                FROM breakdowns
                WHERE breakdown_id = ?
            `;

            const params = [breakdown_id];

            if (req.user.role === "Maintenance Staff") {
                sql += " AND assigned_to = ?";
                params.push(req.user.userId);
            }

            const [rows] = await db.query(sql, params);

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Breakdown not found or not assigned to you"
                });
            }

            if (rows[0].status === "Closed") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot add work logs to a closed breakdown"
                });
            }

            await db.query(
                `INSERT INTO work_logs
                 (breakdown_id, maintenance_id, staff_id, work_description)
                 VALUES (?, NULL, ?, ?)`,
                [
                    breakdown_id,
                    selectedStaffId,
                    work_description.trim()
                ]
            );

            if (req.user.role === "Admin") {
                await db.query(
                    `UPDATE breakdowns
                     SET assigned_to = ?,
                         status = 'In Progress'
                     WHERE breakdown_id = ?`,
                    [selectedStaffId, breakdown_id]
                );
            } else {
                await db.query(
                    `UPDATE breakdowns
                     SET status = 'In Progress'
                     WHERE breakdown_id = ?
                     AND assigned_to = ?`,
                    [breakdown_id, req.user.userId]
                );
            }
        }

        // MAINTENANCE WORK LOG
        if (hasMaintenance) {
            let sql = `
                SELECT maintenance_id, status, assigned_to
                FROM maintenances
                WHERE maintenance_id = ?
            `;

            const params = [maintenance_id];

            if (req.user.role === "Maintenance Staff") {
                sql += " AND assigned_to = ?";
                params.push(req.user.userId);
            }

            const [rows] = await db.query(sql, params);

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Maintenance task not found or not assigned to you"
                });
            }

            if (rows[0].status === "Completed") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot add work logs to completed maintenance"
                });
            }

            await db.query(
                `INSERT INTO work_logs
                 (breakdown_id, maintenance_id, staff_id, work_description)
                 VALUES (NULL, ?, ?, ?)`,
                [
                    maintenance_id,
                    selectedStaffId,
                    work_description.trim()
                ]
            );

            if (req.user.role === "Admin") {
                await db.query(
                    `UPDATE maintenances
                     SET assigned_to = ?,
                         status = 'In Progress'
                     WHERE maintenance_id = ?`,
                    [selectedStaffId, maintenance_id]
                );
            } else {
                await db.query(
                    `UPDATE maintenances
                     SET status = 'In Progress'
                     WHERE maintenance_id = ?
                     AND assigned_to = ?`,
                    [maintenance_id, req.user.userId]
                );
            }
        }

        res.status(201).json({
            success: true,
            message: "Work log added successfully"
        });

    } catch (error) {
        console.error("Create work log error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add work log",
            error: error.message
        });
    }
};


// 6. GET WORK LOG BY ID
// Admin: Any work log
// Staff: Own work log only
const getWorkLogById = async (req, res) => {
    try {
        let sql = `
            SELECT
                w.*,
                b.description AS breakdown_description,
                COALESCE(b.status, mt.status) AS breakdown_status,
                CASE
                    WHEN w.maintenance_id IS NOT NULL
                    THEN 'Maintenance'
                    ELSE 'Breakdown'
                END AS task_type,
                m.machine_name,
                m.machine_code,
                u.name AS staff_name
            FROM work_logs w
            LEFT JOIN breakdowns b
                ON w.breakdown_id = b.breakdown_id
            LEFT JOIN maintenances mt
                ON w.maintenance_id = mt.maintenance_id
            JOIN machines m
                ON m.machine_id = COALESCE(b.machine_id, mt.machine_id)
            JOIN users u
                ON w.staff_id = u.user_id
            WHERE w.log_id = ?
        `;

        const params = [req.params.id];

        if (req.user.role === "Maintenance Staff") {
            sql += " AND w.staff_id = ?";
            params.push(req.user.userId);
        }

        const [rows] = await db.query(sql, params);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Work log not found"
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get work log by ID error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch work log",
            error: error.message
        });
    }
};


module.exports = {
    getWorkLogs,
    getBreakdowns,
    getMaintenances,
    getStaff,
    createWorkLog,
    getWorkLogById
};
