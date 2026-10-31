
const db = require("../config/db");

// 1. GET BREAKDOWNS
// Admin: All breakdowns
// Staff: Assigned breakdowns
// Operator: Own reported breakdowns
const getBreakdowns = async (req, res) => {
    try {
        const { search, status, priority } = req.query;

        let sql = `
            SELECT
                b.*,
                m.machine_code,
                m.machine_name,
                reporter.name AS reported_by_name,
                staff.name AS assigned_to_name
            FROM breakdowns b
            JOIN machines m ON b.machine_id = m.machine_id
            JOIN users reporter ON b.reported_by = reporter.user_id
            LEFT JOIN users staff ON b.assigned_to = staff.user_id
            WHERE 1=1
        `;

        const params = [];

        // Role-based record filtering
        if (req.user.role === "Maintenance Staff") {
            sql += " AND b.assigned_to = ?";
            params.push(req.user.userId);
        } else if (req.user.role === "Operator") {
            sql += " AND b.reported_by = ?";
            params.push(req.user.userId);
        }

        if (search) {
            sql += ` AND (
                m.machine_code LIKE ?
                OR m.machine_name LIKE ?
                OR b.description LIKE ?
            )`;

            params.push(
                `%${search}%`,
                `%${search}%`,
                `%${search}%`
            );
        }

        if (status) {
            const allowedStatuses = ["Open", "In Progress", "Closed"];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status"
                });
            }

            sql += " AND b.status = ?";
            params.push(status);
        }

        if (priority) {
            const allowedPriorities = [
                "Low", "Medium", "High", "Critical"
            ];

            if (!allowedPriorities.includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid priority"
                });
            }

            sql += " AND b.priority = ?";
            params.push(priority);
        }

        sql += " ORDER BY b.reported_at DESC";

        const [rows] = await db.query(sql, params);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get breakdowns error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch breakdowns",
            error: error.message
        });
    }
};


// 2. GET MACHINES FOR BREAKDOWN REPORTING
const getMachines = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT machine_id, machine_code, machine_name
            FROM machines
            ORDER BY machine_name
        `);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch machines"
        });
    }
};


// 3. GET ACTIVE MAINTENANCE STAFF
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
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch staff"
        });
    }
};


// 4. VALIDATE MACHINE
const validateMachine = async (machineId) => {
    const [rows] = await db.query(
        "SELECT machine_id FROM machines WHERE machine_id = ?",
        [machineId]
    );

    return rows.length > 0;
};


// 5. VALIDATE ASSIGNED STAFF
const validateStaff = async (staffId) => {
    if (
        staffId === null ||
        staffId === undefined ||
        staffId === ""
    ) {
        return true;
    }

    const [rows] = await db.query(
        `SELECT user_id FROM users
         WHERE user_id = ?
         AND role = 'Maintenance Staff'
         AND is_active = TRUE`,
        [staffId]
    );

    return rows.length > 0;
};


// 6. CREATE BREAKDOWN
// Admin, Maintenance Staff and Operator can report
const createBreakdown = async (req, res) => {
    try {
        const {
            machine_id,
            assigned_to,
            description,
            priority
        } = req.body;

        // Always take reporter ID from authenticated token
        const reported_by = req.user.userId;

        const allowedPriorities = [
            "Low", "Medium", "High", "Critical"
        ];

        if (
            !machine_id ||
            !description ||
            !description.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Machine and description are required"
            });
        }

        if (priority && !allowedPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: "Invalid priority"
            });
        }

        if (!(await validateMachine(machine_id))) {
            return res.status(404).json({
                success: false,
                message: "Machine not found"
            });
        }

        // Only Admin can assign maintenance staff
        if (req.user.role !== "Admin" && assigned_to) {
            return res.status(403).json({
                success: false,
                message: "Only Admin can assign maintenance staff"
            });
        }

        const staffId =
            req.user.role === "Admin"
                ? (assigned_to || null)
                : null;

        if (!(await validateStaff(staffId))) {
            return res.status(400).json({
                success: false,
                message: "Invalid or inactive maintenance staff"
            });
        }

        const [result] = await db.query(
            `INSERT INTO breakdowns
             (machine_id, reported_by, assigned_to, description, priority)
             VALUES (?, ?, ?, ?, ?)`,
            [
                machine_id,
                reported_by,
                staffId,
                description.trim(),
                priority || "Medium"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Breakdown reported successfully",
            breakdown_id: result.insertId
        });

    } catch (error) {
        console.error("Create breakdown error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to report breakdown",
            error: error.message
        });
    }
};


// 7. GET BREAKDOWN BY ID
// Enforce ownership for Staff and Operator
const getBreakdownById = async (req, res) => {
    try {
        let sql = `
            SELECT
                b.*,
                m.machine_code,
                m.machine_name,
                reporter.name AS reported_by_name,
                staff.name AS assigned_to_name
            FROM breakdowns b
            JOIN machines m ON b.machine_id = m.machine_id
            JOIN users reporter ON b.reported_by = reporter.user_id
            LEFT JOIN users staff ON b.assigned_to = staff.user_id
            WHERE b.breakdown_id = ?
        `;

        const params = [req.params.id];

        if (req.user.role === "Maintenance Staff") {
            sql += " AND b.assigned_to = ?";
            params.push(req.user.userId);
        } else if (req.user.role === "Operator") {
            sql += " AND b.reported_by = ?";
            params.push(req.user.userId);
        }

        const [rows] = await db.query(sql, params);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Breakdown not found"
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get breakdown error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch breakdown",
            error: error.message
        });
    }
};


// 8. UPDATE BREAKDOWN (ADMIN ONLY)
// Full editing: machine, assignment, description, priority and status
const updateBreakdown = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            machine_id,
            assigned_to,
            description,
            priority,
            status
        } = req.body;

        const allowedPriorities = [
            "Low", "Medium", "High", "Critical"
        ];

        const allowedStatuses = [
            "Open", "In Progress", "Closed"
        ];

        const [existing] = await db.query(
            "SELECT * FROM breakdowns WHERE breakdown_id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Breakdown not found"
            });
        }

        if (machine_id && !(await validateMachine(machine_id))) {
            return res.status(404).json({
                success: false,
                message: "Machine not found"
            });
        }

        const staffId =
            assigned_to === "" ? null : assigned_to;

        if (
            assigned_to !== undefined &&
            !(await validateStaff(staffId))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid or inactive maintenance staff"
            });
        }

        if (priority && !allowedPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: "Invalid priority"
            });
        }

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const old = existing[0];

        await db.query(
            `UPDATE breakdowns SET
                machine_id = ?,
                assigned_to = ?,
                description = ?,
                priority = ?,
                status = ?,
                resolved_at = ?
             WHERE breakdown_id = ?`,
            [
                machine_id ?? old.machine_id,
                assigned_to === undefined
                    ? old.assigned_to
                    : staffId,
                description?.trim() || old.description,
                priority || old.priority,
                status || old.status,
                (status || old.status) === "Closed"
                    ? (old.resolved_at || new Date())
                    : null,
                id
            ]
        );

        res.json({
            success: true,
            message: "Breakdown updated successfully"
        });

    } catch (error) {
        console.error("Update breakdown error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update breakdown",
            error: error.message
        });
    }
};


// 9. UPDATE ASSIGNED BREAKDOWN STATUS (STAFF)
// Automatically generates a work log when breakdown is closed.
const updateBreakdownStatus = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        connection = await db.getConnection();

        const { id } = req.params;
        const { status, work_description } = req.body;

        const allowedStatuses = [
            "Open",
            "In Progress",
            "Closed"
        ];

        // Validate status
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid breakdown status"
            });
        }

        // Completion report is compulsory when closing
        if (
            status === "Closed" &&
            (
                typeof work_description !== "string" ||
                !work_description.trim()
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a repair completion report"
            });
        }

        // Start database transaction
        await connection.beginTransaction();
        transactionStarted = true;

        // Verify breakdown belongs to logged-in staff
        const [existing] = await connection.query(
            `SELECT breakdown_id, status
             FROM breakdowns
             WHERE breakdown_id = ?
             AND assigned_to = ?
             FOR UPDATE`,
            [id, req.user.userId]
        );

        if (existing.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Assigned breakdown not found"
            });
        }

        // Prevent duplicate work logs
        if (
            existing[0].status === "Closed" &&
            status === "Closed"
        ) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: "Breakdown is already closed"
            });
        }

        // Update breakdown status
        await connection.query(
            `UPDATE breakdowns
             SET status = ?,
                 resolved_at = CASE
                    WHEN ? = 'Closed' THEN NOW()
                    ELSE NULL
                 END
             WHERE breakdown_id = ?
             AND assigned_to = ?`,
            [
                status,
                status,
                id,
                req.user.userId
            ]
        );

        // Automatically generate work log when breakdown is closed
        if (status === "Closed") {
            await connection.query(
                `INSERT INTO work_logs
                 (
                    breakdown_id,
                    maintenance_id,
                    staff_id,
                    work_description
                 )
                 VALUES (?, NULL, ?, ?)`,
                [
                    id,
                    req.user.userId,
                    work_description.trim()
                ]
            );
        }

        // Commit transaction
        await connection.commit();
        transactionStarted = false;

        res.json({
            success: true,
            message: status === "Closed"
                ? "Breakdown closed and work log generated successfully"
                : "Breakdown status updated successfully"
        });

    } catch (error) {

        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error(
            "Update breakdown status error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update breakdown status"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


// 10. DELETE BREAKDOWN (ADMIN ONLY)
const deleteBreakdown = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query(
            "SELECT breakdown_id FROM breakdowns WHERE breakdown_id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Breakdown not found"
            });
        }

        const [logs] = await db.query(
            "SELECT log_id FROM work_logs WHERE breakdown_id = ? LIMIT 1",
            [id]
        );

        if (logs.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete breakdown because work logs exist"
            });
        }

        await db.query(
            "DELETE FROM breakdowns WHERE breakdown_id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Breakdown deleted successfully"
        });

    } catch (error) {
        console.error("Delete breakdown error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete breakdown",
            error: error.message
        });
    }
};


module.exports = {
    getBreakdowns,
    getMachines,
    getStaff,
    createBreakdown,
    getBreakdownById,
    updateBreakdown,
    updateBreakdownStatus,
    deleteBreakdown
};
