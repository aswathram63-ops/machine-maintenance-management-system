
const db = require("../config/db");

// Validate that the selected user is active Maintenance Staff
const validateMaintenanceStaff = async (connection, staffId) => {
    if (!staffId || !Number.isInteger(Number(staffId)) || Number(staffId) <= 0) {
        return false;
    }

    const [staff] = await connection.query(
        `SELECT user_id
         FROM users
         WHERE user_id = ?
         AND role = 'Maintenance Staff'
         AND is_active = TRUE`,
        [Number(staffId)]
    );

    return staff.length > 0;
};


// 1. GET ALL MACHINES + SEARCH + FILTER
exports.getMachines = async (req, res) => {
    try {
        const { search, status } = req.query;

        let sql = `
            SELECT
                machine_id,
                machine_code,
                machine_name,
                machine_type,
                location,
                status,
                created_at
            FROM machines
            WHERE 1=1
        `;

        const params = [];

        if (search) {
            sql += ` AND (
                machine_code LIKE ?
                OR machine_name LIKE ?
                OR machine_type LIKE ?
                OR location LIKE ?
            )`;

            const keyword = `%${search}%`;
            params.push(keyword, keyword, keyword, keyword);
        }

        if (status) {
            const allowedStatuses = [
                "Operational",
                "Maintenance",
                "Breakdown"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid machine status"
                });
            }

            sql += " AND status = ?";
            params.push(status);
        }

        sql += " ORDER BY machine_id DESC";

        const [machines] = await db.query(sql, params);

        res.status(200).json({
            success: true,
            count: machines.length,
            machines
        });

    } catch (error) {
        console.error("Get machines error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve machines"
        });
    }
};


// 2. ADD NEW MACHINE + AUTOMATIC MAINTENANCE / BREAKDOWN
exports.addMachine = async (req, res) => {
    const {
        machine_code,
        machine_name,
        machine_type,
        location,
        status,
        description,
        assigned_to
    } = req.body;

    if (!machine_code?.trim() || !machine_name?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Machine code and machine name are required"
        });
    }

    const machineStatus = status || "Operational";

    const allowedStatuses = [
        "Operational",
        "Maintenance",
        "Breakdown"
    ];

    if (!allowedStatuses.includes(machineStatus)) {
        return res.status(400).json({
            success: false,
            message: "Invalid machine status"
        });
    }

    if (machineStatus !== "Operational" && !description?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Description is required for Maintenance or Breakdown status"
        });
    }

    if (machineStatus === "Maintenance" && !assigned_to) {
        return res.status(400).json({
            success: false,
            message: "Please assign maintenance staff"
        });
    }

    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Validate selected staff
        if (machineStatus === "Maintenance") {
            const validStaff = await validateMaintenanceStaff(
                connection,
                assigned_to
            );

            if (!validStaff) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Selected maintenance staff is invalid or inactive"
                });
            }
        }

        // Insert machine
        const [result] = await connection.query(
            `INSERT INTO machines
            (machine_code, machine_name, machine_type, location, status)
            VALUES (?, ?, ?, ?, ?)`,
            [
                machine_code.trim(),
                machine_name.trim(),
                machine_type?.trim() || null,
                location?.trim() || null,
                machineStatus
            ]
        );

        const machineId = result.insertId;

        // Automatically create assigned maintenance record
        if (machineStatus === "Maintenance") {
            await connection.query(
                `INSERT INTO maintenances
                (machine_id, assigned_to, maintenance_date, description, status)
                VALUES (?, ?, CURDATE(), ?, 'Scheduled')`,
                [
                    machineId,
                    Number(assigned_to),
                    description.trim()
                ]
            );
        }

        // Automatically create breakdown record
        if (machineStatus === "Breakdown") {
            await connection.query(
                `INSERT INTO breakdowns
                (machine_id, reported_by, description, priority, status)
                VALUES (?, ?, ?, 'Medium', 'Open')`,
                [
                    machineId,
                    req.user.userId,
                    description.trim()
                ]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Machine added successfully",
            machine_id: machineId
        });

    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Add machine error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Machine code already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Unable to add machine"
        });

    } finally {
        if (connection) connection.release();
    }
};


// 3. GET MACHINE BY ID
exports.getMachineById = async (req, res) => {
    try {
        const { id } = req.params;

        const [machines] = await db.query(
            "SELECT * FROM machines WHERE machine_id = ?",
            [id]
        );

        if (machines.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Machine not found"
            });
        }

        res.status(200).json({
            success: true,
            machine: machines[0]
        });

    } catch (error) {
        console.error("Get machine error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve machine"
        });
    }
};


// 4. UPDATE MACHINE + AUTOMATIC RECORD CREATION
exports.updateMachine = async (req, res) => {
    const { id } = req.params;

    const {
        machine_code,
        machine_name,
        machine_type,
        location,
        status,
        description,
        assigned_to
    } = req.body;

    if (!machine_code?.trim() || !machine_name?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Machine code and machine name are required"
        });
    }

    const allowedStatuses = [
        "Operational",
        "Maintenance",
        "Breakdown"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid machine status"
        });
    }

    if (status !== "Operational" && !description?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Description is required for Maintenance or Breakdown status"
        });
    }

    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Get existing machine
        const [machines] = await connection.query(
            "SELECT * FROM machines WHERE machine_id = ? FOR UPDATE",
            [id]
        );

        if (machines.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Machine not found"
            });
        }

        const oldStatus = machines[0].status;

        // Validate staff when a new maintenance assignment is required
        if (
            status === "Maintenance" &&
            assigned_to
        ) {
            const validStaff = await validateMaintenanceStaff(
                connection,
                assigned_to
            );

            if (!validStaff) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Selected maintenance staff is invalid or inactive"
                });
            }
        }

        if (
            status === "Maintenance" &&
            oldStatus !== "Maintenance" &&
            !assigned_to
        ) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Please assign maintenance staff"
            });
        }

        // Update machine
        await connection.query(
            `UPDATE machines
             SET machine_code = ?,
                 machine_name = ?,
                 machine_type = ?,
                 location = ?,
                 status = ?
             WHERE machine_id = ?`,
            [
                machine_code.trim(),
                machine_name.trim(),
                machine_type?.trim() || null,
                location?.trim() || null,
                status,
                id
            ]
        );

        // Create or update maintenance assignment
        if (status === "Maintenance") {

            const [existingMaintenance] = await connection.query(
                `SELECT maintenance_id
                 FROM maintenances
                 WHERE machine_id = ?
                 AND status IN ('Scheduled', 'In Progress')
                 LIMIT 1`,
                [id]
            );

            if (existingMaintenance.length === 0) {
                await connection.query(
                    `INSERT INTO maintenances
                    (machine_id, assigned_to, maintenance_date, description, status)
                    VALUES (?, ?, CURDATE(), ?, 'Scheduled')`,
                    [
                        id,
                        Number(assigned_to),
                        description.trim()
                    ]
                );

            } else if (assigned_to) {
                await connection.query(
                    `UPDATE maintenances
                     SET assigned_to = ?
                     WHERE maintenance_id = ?`,
                    [
                        Number(assigned_to),
                        existingMaintenance[0].maintenance_id
                    ]
                );
            }
        }

        // Create breakdown record when entering Breakdown
        if (status === "Breakdown" && oldStatus !== "Breakdown") {

            const [existingBreakdown] = await connection.query(
                `SELECT breakdown_id
                 FROM breakdowns
                 WHERE machine_id = ?
                 AND status IN ('Open', 'In Progress')
                 LIMIT 1`,
                [id]
            );

            if (existingBreakdown.length === 0) {
                await connection.query(
                    `INSERT INTO breakdowns
                    (machine_id, reported_by, description, priority, status)
                    VALUES (?, ?, ?, 'Medium', 'Open')`,
                    [
                        id,
                        req.user.userId,
                        description.trim()
                    ]
                );
            }
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Machine updated successfully"
        });

    } catch (error) {
        if (connection) await connection.rollback();

        console.error("Update machine error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Machine code already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Unable to update machine"
        });

    } finally {
        if (connection) connection.release();
    }
};


// 5. DELETE MACHINE
exports.deleteMachine = async (req, res) => {
    try {
        const { id } = req.params;

        const [machines] = await db.query(
            "SELECT machine_id FROM machines WHERE machine_id = ?",
            [id]
        );

        if (machines.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Machine not found"
            });
        }

        const [maintenance] = await db.query(
            "SELECT maintenance_id FROM maintenances WHERE machine_id = ? LIMIT 1",
            [id]
        );

        const [breakdowns] = await db.query(
            "SELECT breakdown_id FROM breakdowns WHERE machine_id = ? LIMIT 1",
            [id]
        );

        if (maintenance.length > 0 || breakdowns.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this machine because it has maintenance or breakdown records."
            });
        }

        await db.query(
            "DELETE FROM machines WHERE machine_id = ?",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Machine deleted successfully"
        });

    } catch (error) {
        console.error("Delete machine error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to delete machine"
        });
    }
};
