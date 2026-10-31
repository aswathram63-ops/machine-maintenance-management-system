
    const db = require("../config/db");

    // 1. GET ALL MAINTENANCE RECORDS
    exports.getMaintenances = async (req, res) => {
        try {
            const { search, status } = req.query;

            let sql = `
                SELECT
                    mt.maintenance_id,
                    mt.machine_id,
                    mt.assigned_to,
                    mt.maintenance_date,
                    mt.description,
                    mt.status,
                    mt.completed_at,
                    mt.created_at,
                    m.machine_code,
                    m.machine_name,
                    u.name AS assigned_staff
                FROM maintenances mt
                JOIN machines m
                    ON mt.machine_id = m.machine_id
                LEFT JOIN users u
                    ON mt.assigned_to = u.user_id
                WHERE 1=1
            `;

            const params = [];

            // Maintenance Staff can view only their assigned tasks
            if (req.user.role === "Maintenance Staff") {
                sql += " AND mt.assigned_to = ?";
                params.push(req.user.userId);
            }

            if (search) {
                sql += ` AND (
                    m.machine_name LIKE ?
                    OR m.machine_code LIKE ?
                    OR mt.description LIKE ?
                    OR u.name LIKE ?
                )`;

                const keyword = `%${search}%`;
                params.push(keyword, keyword, keyword, keyword);
            }

            if (status) {
                const allowedStatuses = [
                    "Scheduled",
                    "In Progress",
                    "Completed"
                ];

                if (!allowedStatuses.includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid maintenance status"
                    });
                }

                sql += " AND mt.status = ?";
                params.push(status);
            }

            sql += " ORDER BY mt.maintenance_date DESC";

            const [records] = await db.query(sql, params);

            res.status(200).json({
                success: true,
                count: records.length,
                maintenances: records
            });

        } catch (error) {
            console.error("Get maintenance error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to retrieve maintenance records"
            });
        }
    };


    // 2. GET MACHINES FOR DROPDOWN (ADMIN)
    exports.getMaintenanceMachines = async (req, res) => {
        try {
            const [machines] = await db.query(`
                SELECT machine_id, machine_code, machine_name
                FROM machines
                ORDER BY machine_name ASC
            `);

            res.status(200).json({
                success: true,
                machines
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Unable to retrieve machines"
            });
        }
    };


    // 3. GET MAINTENANCE STAFF FOR DROPDOWN (ADMIN)
    exports.getMaintenanceStaff = async (req, res) => {
        try {
            const [staff] = await db.query(`
                SELECT user_id, name, email
                FROM users
                WHERE role = 'Maintenance Staff'
                AND is_active = TRUE
                ORDER BY name ASC
            `);

            res.status(200).json({
                success: true,
                staff
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Unable to retrieve maintenance staff"
            });
        }
    };


    // 4. ADD MAINTENANCE (ADMIN)
    exports.addMaintenance = async (req, res) => {
        try {
            const {
                machine_id,
                assigned_to,
                maintenance_date,
                description
            } = req.body;

            if (!machine_id || !maintenance_date || !description?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Machine, maintenance date and description are required"
                });
            }

            // Check machine
            const [machines] = await db.query(
                "SELECT machine_id FROM machines WHERE machine_id = ?",
                [machine_id]
            );

            if (machines.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Machine not found"
                });
            }

            // Validate assigned staff when provided
            if (assigned_to) {
                const [staff] = await db.query(
                    `SELECT user_id FROM users
                    WHERE user_id = ?
                    AND role = 'Maintenance Staff'
                    AND is_active = TRUE`,
                    [assigned_to]
                );

                if (staff.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid or inactive maintenance staff"
                    });
                }
            }

            // Validate date format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(maintenance_date)) {
                return res.status(400).json({
                    success: false,
                    message: "Date must be in YYYY-MM-DD format"
                });
            }

            const [result] = await db.query(
                `INSERT INTO maintenances
                (machine_id, assigned_to, maintenance_date, description, status)
                VALUES (?, ?, ?, ?, 'Scheduled')`,
                [
                    machine_id,
                    assigned_to || null,
                    maintenance_date,
                    description.trim()
                ]
            );

            res.status(201).json({
                success: true,
                message: "Maintenance scheduled successfully",
                maintenance_id: result.insertId
            });

        } catch (error) {
            console.error("Add maintenance error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to schedule maintenance"
            });
        }
    };


    // 5. GET MAINTENANCE BY ID (ADMIN)
    exports.getMaintenanceById = async (req, res) => {
        try {
            const { id } = req.params;

            const [records] = await db.query(
                `SELECT mt.*, m.machine_code, m.machine_name,
                        u.name AS assigned_staff
                FROM maintenances mt
                JOIN machines m ON mt.machine_id = m.machine_id
                LEFT JOIN users u ON mt.assigned_to = u.user_id
                WHERE mt.maintenance_id = ?`,
                [id]
            );

            if (records.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Maintenance record not found"
                });
            }

            res.status(200).json({
                success: true,
                maintenance: records[0]
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Unable to retrieve maintenance record"
            });
        }
    };


    // 6. UPDATE MAINTENANCE (ADMIN)
    exports.updateMaintenance = async (req, res) => {
        try {
            const { id } = req.params;

            const {
                machine_id,
                assigned_to,
                maintenance_date,
                description,
                status
            } = req.body;

            const allowedStatuses = [
                "Scheduled",
                "In Progress",
                "Completed"
            ];

            if (
                !machine_id ||
                !maintenance_date ||
                !description?.trim() ||
                !allowedStatuses.includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Provide valid machine, date, description and status"
                });
            }

            if (!/^\d{4}-\d{2}-\d{2}$/.test(maintenance_date)) {
                return res.status(400).json({
                    success: false,
                    message: "Date must be in YYYY-MM-DD format"
                });
            }

            const [existing] = await db.query(
                "SELECT maintenance_id FROM maintenances WHERE maintenance_id = ?",
                [id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Maintenance record not found"
                });
            }

            const [machines] = await db.query(
                "SELECT machine_id FROM machines WHERE machine_id = ?",
                [machine_id]
            );

            if (machines.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Machine not found"
                });
            }

            if (assigned_to) {
                const [staff] = await db.query(
                    `SELECT user_id FROM users
                    WHERE user_id = ?
                    AND role = 'Maintenance Staff'
                    AND is_active = TRUE`,
                    [assigned_to]
                );

                if (staff.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid or inactive maintenance staff"
                    });
                }
            }

            await db.query(
                `UPDATE maintenances
                SET machine_id = ?,
                    assigned_to = ?,
                    maintenance_date = ?,
                    description = ?,
                    status = ?,
                    completed_at = CASE
                        WHEN ? = 'Completed'
                            THEN COALESCE(completed_at, NOW())
                        ELSE NULL
                    END
                WHERE maintenance_id = ?`,
                [
                    machine_id,
                    assigned_to || null,
                    maintenance_date,
                    description.trim(),
                    status,
                    status,
                    id
                ]
            );

            res.status(200).json({
                success: true,
                message: "Maintenance updated successfully"
            });

        } catch (error) {
            console.error("Update maintenance error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to update maintenance"
            });
        }
    };


    // 7. UPDATE ASSIGNED MAINTENANCE STATUS (STAFF)
    
// 7. UPDATE ASSIGNED MAINTENANCE STATUS (STAFF)
exports.updateMaintenanceStatus = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { id } = req.params;
        const { status, work_description } = req.body;

        const allowedStatuses = [
            "Scheduled",
            "In Progress",
            "Completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid maintenance status"
            });
        }

        if (
            status === "Completed" &&
            (!work_description || !work_description.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a completion report"
            });
        }

        await connection.beginTransaction();

        // Verify that the task belongs to logged-in staff
        const [records] = await connection.query(
            `SELECT maintenance_id, assigned_to, status
             FROM maintenances
             WHERE maintenance_id = ?
             AND assigned_to = ?
             FOR UPDATE`,
            [id, req.user.userId]
        );

        if (records.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Assigned maintenance record not found"
            });
        }

        const maintenance = records[0];

        // Prevent duplicate completion
        if (
            maintenance.status === "Completed" &&
            status === "Completed"
        ) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Maintenance is already completed"
            });
        }

        // Update maintenance status
        await connection.query(
            `UPDATE maintenances
             SET status = ?,
                 completed_at = CASE
                    WHEN ? = 'Completed' THEN NOW()
                    ELSE NULL
                 END
             WHERE maintenance_id = ?
             AND assigned_to = ?`,
            [status, status, id, req.user.userId]
        );

        // Automatically create work log when completed
        if (status === "Completed") {
            await connection.query(
                `INSERT INTO work_logs
                 (breakdown_id, maintenance_id, staff_id, work_description)
                 VALUES (NULL, ?, ?, ?)`,
                [
                    id,
                    req.user.userId,
                    work_description.trim()
                ]
            );
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: status === "Completed"
                ? "Maintenance completed and work log generated successfully"
                : "Maintenance status updated successfully"
        });

    } catch (error) {
        await connection.rollback();

        console.error("Staff maintenance status error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update maintenance status"
        });

    } finally {
        connection.release();
    }
};


    // 8. DELETE MAINTENANCE (ADMIN)
    exports.deleteMaintenance = async (req, res) => {
        try {
            const { id } = req.params;

            const [result] = await db.query(
                "DELETE FROM maintenances WHERE maintenance_id = ?",
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Maintenance record not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Maintenance deleted successfully"
            });

        } catch (error) {
            console.error("Delete maintenance error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to delete maintenance"
            });
        }
    };
