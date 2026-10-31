
const db = require("../config/db");

// 1. Dashboard Overview Statistics
const getReportOverview = async (req, res) => {
    try {
        const [[machines]] = await db.query(`
            SELECT
                COUNT(*) AS totalMachines,
                SUM(status = 'Operational') AS operational,
                SUM(status = 'Maintenance') AS maintenance,
                SUM(status = 'Breakdown') AS breakdown
            FROM machines
        `);

        const [[breakdowns]] = await db.query(`
            SELECT
                COUNT(*) AS totalBreakdowns,
                SUM(status = 'Open') AS openBreakdowns,
                SUM(status = 'In Progress') AS inProgress,
                SUM(status = 'Closed') AS closed
            FROM breakdowns
        `);

        const [[maintenances]] = await db.query(`
            SELECT
                COUNT(*) AS totalMaintenance,
                SUM(status = 'Scheduled') AS scheduled,
                SUM(status = 'In Progress') AS inProgress,
                SUM(status = 'Completed') AS completed
            FROM maintenances
        `);

        return res.status(200).json({
            success: true,
            data: {
                machines,
                breakdowns,
                maintenances
            }
        });

    } catch (error) {
        console.error("Report Overview Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load report overview"
        });
    }
};


// 2. Machine Status Distribution
const getMachineStatusReport = async (req, res) => {
    try {
        const [data] = await db.query(`
            SELECT
                status,
                COUNT(*) AS total
            FROM machines
            GROUP BY status
        `);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error("Machine Status Report Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load machine status report"
        });
    }
};


// 3. Breakdown Statistics
const getBreakdownReport = async (req, res) => {
    try {
        const [byPriority] = await db.query(`
            SELECT
                priority,
                COUNT(*) AS total
            FROM breakdowns
            GROUP BY priority
        `);

        const [byStatus] = await db.query(`
            SELECT
                status,
                COUNT(*) AS total
            FROM breakdowns
            GROUP BY status
        `);

        const [machineBreakdowns] = await db.query(`
            SELECT
                m.machine_id,
                m.machine_code,
                m.machine_name,
                COUNT(b.breakdown_id) AS totalBreakdowns
            FROM machines m
            LEFT JOIN breakdowns b
                ON m.machine_id = b.machine_id
            GROUP BY
                m.machine_id,
                m.machine_code,
                m.machine_name
            ORDER BY totalBreakdowns DESC
        `);

        return res.status(200).json({
            success: true,
            data: {
                byPriority,
                byStatus,
                machineBreakdowns
            }
        });

    } catch (error) {
        console.error("Breakdown Report Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load breakdown report"
        });
    }
};


// 4. Maintenance Completion Statistics
const getMaintenanceReport = async (req, res) => {
    try {
        const [data] = await db.query(`
            SELECT
                status,
                COUNT(*) AS total
            FROM maintenances
            GROUP BY status
        `);

        const [machineMaintenance] = await db.query(`
            SELECT
                m.machine_code,
                m.machine_name,
                COUNT(mt.maintenance_id) AS totalMaintenance,
                SUM(mt.status = 'Completed') AS completed,
                SUM(mt.status = 'Scheduled') AS scheduled,
                SUM(mt.status = 'In Progress') AS inProgress
            FROM machines m
            LEFT JOIN maintenances mt
                ON m.machine_id = mt.machine_id
            GROUP BY
                m.machine_id,
                m.machine_code,
                m.machine_name
            ORDER BY totalMaintenance DESC
        `);

        return res.status(200).json({
            success: true,
            data: {
                statusSummary: data,
                machineMaintenance
            }
        });

    } catch (error) {
        console.error("Maintenance Report Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load maintenance report"
        });
    }
};


// 5. Staff Work Performance
const getStaffPerformanceReport = async (req, res) => {
    try {
        const [data] = await db.query(`
            SELECT
                u.user_id,
                u.name AS staff_name,
                COUNT(wl.log_id) AS totalWorkLogs,
                COUNT(DISTINCT wl.breakdown_id) AS breakdownsWorkedOn
            FROM users u
            LEFT JOIN work_logs wl
                ON u.user_id = wl.staff_id
            WHERE u.role = 'Maintenance Staff'
            GROUP BY u.user_id, u.name
            ORDER BY totalWorkLogs DESC
        `);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error("Staff Performance Report Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load staff performance report"
        });
    }
};


module.exports = {
    getReportOverview,
    getMachineStatusReport,
    getBreakdownReport,
    getMaintenanceReport,
    getStaffPerformanceReport
};
