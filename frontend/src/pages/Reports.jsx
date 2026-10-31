
import { useEffect, useState } from "react";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import {
    getReportOverview,
    getMachineStatusReport,
    getBreakdownReport,
    getMaintenanceReport,
    getStaffPerformanceReport
} from "../services/reportService";

const COLORS = ["#2563eb", "#f59e0b", "#ef4444", "#10b981"];

function Reports() {
    const [overview, setOverview] = useState(null);
    const [machineStatus, setMachineStatus] = useState([]);
    const [breakdown, setBreakdown] = useState(null);
    const [maintenance, setMaintenance] = useState(null);
    const [staff, setStaff] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load all reports
    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);

                const [
                    overviewRes,
                    machineRes,
                    breakdownRes,
                    maintenanceRes,
                    staffRes
                ] = await Promise.all([
                    getReportOverview(),
                    getMachineStatusReport(),
                    getBreakdownReport(),
                    getMaintenanceReport(),
                    getStaffPerformanceReport()
                ]);

                setOverview(overviewRes.data.data);
                setMachineStatus(machineRes.data.data || []);
                setBreakdown(breakdownRes.data.data);
                setMaintenance(maintenanceRes.data.data);
                setStaff(staffRes.data.data || []);

            } catch (err) {
                console.error("Reports loading error:", err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load reports. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="page-container">
                <h2>Loading Reports & Analytics...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <h1>Reports & Analytics</h1>
                <p className="error-message">{error}</p>
            </div>
        );
    }

    if (!overview || !breakdown || !maintenance) {
        return (
            <div className="page-container">
                <p>No report data available.</p>
            </div>
        );
    }

    // Convert MySQL values safely to numbers
    const machineStats = overview.machines;
    const breakdownStats = overview.breakdowns;
    const maintenanceStats = overview.maintenances;

    const machineChartData = machineStatus.map(item => ({
        name: item.status,
        value: Number(item.total) || 0
    }));

    const priorityChartData = breakdown.byPriority.map(item => ({
        name: item.priority,
        total: Number(item.total) || 0
    }));

    const breakdownStatusData = breakdown.byStatus.map(item => ({
        name: item.status,
        total: Number(item.total) || 0
    }));

    const maintenanceChartData = maintenance.statusSummary.map(item => ({
        name: item.status,
        total: Number(item.total) || 0
    }));

    return (
        <div className="page-container reports-page">

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Reports & Analytics</h1>
                    <p>
                        Monitor machine performance, maintenance,
                        breakdowns and staff activities.
                    </p>
                </div>
            </div>

            {/* Overview Cards */}
            <h2 className="report-section-title">
                System Overview
            </h2>

            <div className="stats-grid reports-stats-grid">

                <div className="stat-card report-stat-card">
                    <h3>Total Machines</h3>
                    <h2>{Number(machineStats.totalMachines) || 0}</h2>
                    <p>Registered machines</p>
                </div>

                <div className="stat-card report-stat-card">
                    <h3>Total Breakdowns</h3>
                    <h2>{Number(breakdownStats.totalBreakdowns) || 0}</h2>
                    <p>Reported machine issues</p>
                </div>

                <div className="stat-card report-stat-card">
                    <h3>Total Maintenance</h3>
                    <h2>{Number(maintenanceStats.totalMaintenance) || 0}</h2>
                    <p>Maintenance records</p>
                </div>

                <div className="stat-card report-stat-card">
                    <h3>Active Breakdowns</h3>
                    <h2>
                        {(Number(breakdownStats.openBreakdowns) || 0) +
                         (Number(breakdownStats.inProgress) || 0)}
                    </h2>
                    <p>Open and in-progress issues</p>
                </div>

            </div>

            {/* Machine Status and Breakdown Priority */}
            <div className="reports-chart-grid">

                <div className="table-card report-chart-card">
                    <h2>Machine Status Distribution</h2>

                    {machineChartData.length > 0 ? (
                        <div className="report-chart">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={machineChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {machineChartData.map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>

                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p>No machine status data available.</p>
                    )}
                </div>

                <div className="table-card report-chart-card">
                    <h2>Breakdowns by Priority</h2>

                    <div className="report-chart">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={priorityChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="total"
                                    name="Breakdowns"
                                    fill="#ef4444"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Breakdown Status */}
            <div className="table-card report-chart-card">
                <h2>Breakdown Status Analysis</h2>

                <div className="report-chart">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={breakdownStatusData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="total"
                                name="Breakdowns"
                                fill="#f59e0b"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Maintenance Statistics */}
            <div className="table-card report-chart-card">
                <h2>Maintenance Status Analysis</h2>

                <div className="report-chart">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={maintenanceChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="total"
                                name="Maintenance Records"
                                fill="#2563eb"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Machine-wise Breakdown Table */}
            <div className="table-card report-table-card">
                <h2>Machine-wise Breakdown Report</h2>

                <div className="table-responsive">
                    <table className="machine-table">
                        <thead>
                            <tr>
                                <th>Machine Code</th>
                                <th>Machine Name</th>
                                <th>Total Breakdowns</th>
                            </tr>
                        </thead>

                        <tbody>
                            {breakdown.machineBreakdowns.length > 0 ? (
                                breakdown.machineBreakdowns.map(item => (
                                    <tr key={item.machine_id}>
                                        <td>{item.machine_code}</td>
                                        <td>{item.machine_name}</td>
                                        <td>
                                            {Number(item.totalBreakdowns) || 0}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No breakdown data available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Machine-wise Maintenance Table */}
            <div className="table-card report-table-card">
                <h2>Machine-wise Maintenance Report</h2>

                <div className="table-responsive">
                    <table className="machine-table">
                        <thead>
                            <tr>
                                <th>Machine</th>
                                <th>Total</th>
                                <th>Completed</th>
                                <th>Scheduled</th>
                                <th>In Progress</th>
                            </tr>
                        </thead>

                        <tbody>
                            {maintenance.machineMaintenance.map(item => (
                                <tr key={item.machine_code}>
                                    <td>{item.machine_name}</td>
                                    <td>{Number(item.totalMaintenance) || 0}</td>
                                    <td>{Number(item.completed) || 0}</td>
                                    <td>{Number(item.scheduled) || 0}</td>
                                    <td>{Number(item.inProgress) || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Staff Performance */}
            <div className="table-card report-table-card">
                <h2>Staff Work Performance</h2>

                <div className="table-responsive">
                    <table className="machine-table">
                        <thead>
                            <tr>
                                <th>Staff Name</th>
                                <th>Total Work Logs</th>
                                <th>Breakdowns Worked On</th>
                            </tr>
                        </thead>

                        <tbody>
                            {staff.length > 0 ? (
                                staff.map(item => (
                                    <tr key={item.user_id}>
                                        <td>{item.staff_name}</td>
                                        <td>{Number(item.totalWorkLogs) || 0}</td>
                                        <td>{Number(item.breakdownsWorkedOn) || 0}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No staff data available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

export default Reports;
