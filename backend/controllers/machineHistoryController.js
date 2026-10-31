const db = require("../config/db");

// Get complete history of a machine
const getMachineHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Get machine details
        const [machines] = await db.query(
            `SELECT *
             FROM machines
             WHERE machine_id = ?`,
            [id]
        );

        if (machines.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Machine not found"
            });
        }

        // 2. Get maintenance history
        const [maintenance] = await db.query(
            `SELECT
                m.maintenance_id,
                m.maintenance_date,
                m.description,
                m.status,
                m.completed_at,
                u.name AS assigned_staff
             FROM maintenances m
             LEFT JOIN users u
                ON m.assigned_to = u.user_id
             WHERE m.machine_id = ?
             ORDER BY m.maintenance_date DESC`,
            [id]
        );

        // 3. Get breakdown history
        const [breakdowns] = await db.query(
            `SELECT
                b.breakdown_id,
                b.description,
                b.priority,
                b.status,
                b.reported_at,
                b.resolved_at,
                reporter.name AS reported_by,
                staff.name AS assigned_staff
             FROM breakdowns b
             LEFT JOIN users reporter
                ON b.reported_by = reporter.user_id
             LEFT JOIN users staff
                ON b.assigned_to = staff.user_id
             WHERE b.machine_id = ?
             ORDER BY b.reported_at DESC`,
            [id]
        );

        // 4. Get repair / work log history
        const [workLogs] = await db.query(
            `SELECT
                wl.log_id,
                wl.work_description,
                wl.log_date,
                u.name AS staff_name,
                b.breakdown_id
             FROM work_logs wl
             INNER JOIN breakdowns b
                ON wl.breakdown_id = b.breakdown_id
             LEFT JOIN users u
                ON wl.staff_id = u.user_id
             WHERE b.machine_id = ?
             ORDER BY wl.log_date DESC`,
            [id]
        );

        return res.status(200).json({
            success: true,
            data: {
                machine: machines[0],
                maintenance,
                breakdowns,
                workLogs
            }
        });

    } catch (error) {
        console.error("Machine History Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve machine history"
        });
    }
};

module.exports = { getMachineHistory };