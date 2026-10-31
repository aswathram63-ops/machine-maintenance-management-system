
const db = require("../config/db");

exports.getDashboardData = async (req, res) => {
    try {
        // 1. Machine statistics
        const [machineStats] = await db.query(`
            SELECT
                COUNT(*) AS totalMachines,
                COALESCE(SUM(status = 'Operational'), 0) AS operationalMachines,
                COALESCE(SUM(status = 'Maintenance'), 0) AS maintenanceMachines,
                COALESCE(SUM(status = 'Breakdown'), 0) AS breakdownMachines
            FROM machines
        `);

        // 2. Breakdown statistics
        const [breakdownStats] = await db.query(`
            SELECT
                COUNT(*) AS totalBreakdowns,
                COALESCE(SUM(status = 'Open'), 0) AS openBreakdowns,
                COALESCE(SUM(status = 'In Progress'), 0) AS ongoingBreakdowns,
                COALESCE(SUM(status = 'Closed'), 0) AS closedBreakdowns
            FROM breakdowns
        `);

        // Convert SQL values into JavaScript numbers
        const machines = {
            totalMachines: Number(machineStats[0].totalMachines),
            operationalMachines: Number(machineStats[0].operationalMachines),
            maintenanceMachines: Number(machineStats[0].maintenanceMachines),
            breakdownMachines: Number(machineStats[0].breakdownMachines)
        };

        const breakdowns = {
            totalBreakdowns: Number(breakdownStats[0].totalBreakdowns),
            openBreakdowns: Number(breakdownStats[0].openBreakdowns),
            ongoingBreakdowns: Number(breakdownStats[0].ongoingBreakdowns),
            closedBreakdowns: Number(breakdownStats[0].closedBreakdowns)
        };

        // 3. Upcoming maintenance
        const [upcomingMaintenance] = await db.query(`
            SELECT
                mt.maintenance_id,
                mt.maintenance_date,
                mt.description,
                mt.status,
                m.machine_code,
                m.machine_name
            FROM maintenances mt
            JOIN machines m
                ON mt.machine_id = m.machine_id
            WHERE mt.maintenance_date >= CURDATE()
              AND mt.status != 'Completed'
            ORDER BY mt.maintenance_date ASC
            LIMIT 5
        `);

        // 4. Recent breakdowns
        const [recentBreakdowns] = await db.query(`
            SELECT
                b.breakdown_id,
                b.description,
                b.priority,
                b.status,
                b.reported_at,
                m.machine_code,
                m.machine_name,
                u.name AS reported_by_name
            FROM breakdowns b
            JOIN machines m
                ON b.machine_id = m.machine_id
            JOIN users u
                ON b.reported_by = u.user_id
            ORDER BY b.reported_at DESC
            LIMIT 5
        `);

        // 5. Send dashboard response
        res.status(200).json({
            success: true,
            machineStats: machines,
            breakdownStats: breakdowns,
            upcomingMaintenance,
            recentBreakdowns
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load dashboard data"
        });
    }
};
