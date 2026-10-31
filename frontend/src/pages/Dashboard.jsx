
import { useEffect, useState } from "react";

import {
    Factory,
    CheckCircle,
    Wrench,
    AlertTriangle,
    CalendarDays,
    Activity,
    RefreshCw
} from "lucide-react";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

import StatCard from "../components/StatCard";
import AdminLayout from "../layouts/AdminLayout";
import { getDashboardData } from "../services/dashboardService";


function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setError("");
            const result = await getDashboardData();
            setData(result);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const machineStats = data?.machineStats || {};
    const breakdownStats = data?.breakdownStats || {};

    const machineChartData = [
        {
            name: "Operational",
            value: Number(machineStats.operationalMachines || 0),
            color: "#16a36a"
        },
        {
            name: "Maintenance",
            value: Number(machineStats.maintenanceMachines || 0),
            color: "#e8a12a"
        },
        {
            name: "Breakdown",
            value: Number(machineStats.breakdownMachines || 0),
            color: "#e45454"
        }
    ];

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC"
        });
    };

    return (
        <AdminLayout>

            {/* PAGE TITLE */}
            <div className="page-heading">
                <div>
                    <span className="page-eyebrow">OVERVIEW</span>
                    <h1>Dashboard</h1>
                    <p>
                        Monitor your machines and maintenance operations.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={() => {
                        setLoading(true);
                        fetchDashboard();
                    }}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="dashboard-error">
                    {error}
                    <button onClick={fetchDashboard}>Retry</button>
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    Loading dashboard...
                </div>
            ) : (
                <>
                    {/* STATISTICS CARDS */}
                    <div className="stats-grid">

                        <StatCard
                            title="Total Machines"
                            value={machineStats.totalMachines}
                            icon={Factory}
                            color="#3679ed"
                            subtitle="Registered machines"
                        />

                        <StatCard
                            title="Operational"
                            value={machineStats.operationalMachines}
                            icon={CheckCircle}
                            color="#16a36a"
                            subtitle="Running machines"
                        />

                        <StatCard
                            title="Under Maintenance"
                            value={machineStats.maintenanceMachines}
                            icon={Wrench}
                            color="#e8a12a"
                            subtitle="Maintenance status"
                        />

                        <StatCard
                            title="Breakdown Machines"
                            value={machineStats.breakdownMachines}
                            icon={AlertTriangle}
                            color="#e45454"
                            subtitle="Machines with breakdowns"
                        />

                    </div>

                    {/* BREAKDOWN SUMMARY */}
                    <div className="section-heading">
                        <div>
                            <h2>Breakdown Overview</h2>
                            <p>Current breakdown report summary</p>
                        </div>
                    </div>

                    <div className="breakdown-summary">

                        <div className="summary-item">
                            <span>Total Breakdowns</span>
                            <h2>{breakdownStats.totalBreakdowns ?? 0}</h2>
                        </div>

                        <div className="summary-item">
                            <span>Open</span>
                            <h2 className="text-red">
                                {breakdownStats.openBreakdowns ?? 0}
                            </h2>
                        </div>

                        <div className="summary-item">
                            <span>In Progress</span>
                            <h2 className="text-orange">
                                {breakdownStats.ongoingBreakdowns ?? 0}
                            </h2>
                        </div>

                        <div className="summary-item">
                            <span>Closed</span>
                            <h2 className="text-green">
                                {breakdownStats.closedBreakdowns ?? 0}
                            </h2>
                        </div>

                    </div>

                    {/* CHART AND MAINTENANCE */}
                    <div className="dashboard-grid">

                        <div className="dashboard-panel">
                            <div className="panel-heading">
                                <div>
                                    <h3>Machine Status</h3>
                                    <p>Current machine distribution</p>
                                </div>
                                <Activity size={20} />
                            </div>

                            {Number(machineStats.totalMachines || 0) === 0 ? (
                                <div className="empty-chart">
                                    <Factory size={35} />
                                    <strong>No machines registered</strong>
                                    <span>Add machines to view status analytics.</span>
                                </div>
                            ) : (
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <Pie
                                                data={machineChartData.filter(
                                                    item => item.value > 0
                                                )}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="48%"
                                                innerRadius={65}
                                                outerRadius={95}
                                                paddingAngle={4}
                                            >
                                                {machineChartData.map((item) => (
                                                    <Cell
                                                        key={item.name}
                                                        fill={item.color}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        <div className="dashboard-panel">
                            <div className="panel-heading">
                                <div>
                                    <h3>Upcoming Maintenance</h3>
                                    <p>Next scheduled maintenance activities</p>
                                </div>
                                <CalendarDays size={20} />
                            </div>

                            <div className="maintenance-list">
                                {data?.upcomingMaintenance?.length > 0 ? (
                                    data.upcomingMaintenance.map((item) => (
                                        <div
                                            className="maintenance-item"
                                            key={item.maintenance_id}
                                        >
                                            <div className="maintenance-icon">
                                                <Wrench size={18} />
                                            </div>

                                            <div className="maintenance-details">
                                                <strong>{item.machine_name}</strong>
                                                <span>{item.machine_code}</span>
                                                <small>{item.description}</small>
                                            </div>

                                            <div className="maintenance-date">
                                                {formatDate(item.maintenance_date)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <CalendarDays size={30} />
                                        <strong>No upcoming maintenance</strong>
                                        <span>Scheduled activities will appear here.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RECENT BREAKDOWNS */}
                    <div className="dashboard-panel recent-panel">
                        <div className="panel-heading">
                            <div>
                                <h3>Recent Breakdown Reports</h3>
                                <p>Latest reported machine issues</p>
                            </div>
                            <AlertTriangle size={20} />
                        </div>

                        <div className="table-wrapper">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Machine</th>
                                        <th>Description</th>
                                        <th>Reported By</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Reported Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {data?.recentBreakdowns?.length > 0 ? (
                                        data.recentBreakdowns.map((item) => (
                                            <tr key={item.breakdown_id}>
                                                <td>
                                                    <strong>{item.machine_name}</strong>
                                                    <small>{item.machine_code}</small>
                                                </td>

                                                <td>{item.description}</td>
                                                <td>{item.reported_by_name}</td>

                                                <td>
                                                    <span className={`priority-badge ${String(item.priority).toLowerCase()}`}>
                                                        {item.priority}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className={`status-badge ${item.status === "Closed" ? "completed" : item.status === "In Progress" ? "progress" : "open"}`}>
                                                        {item.status}
                                                    </span>
                                                </td>

                                                <td>{formatDate(item.reported_at)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="table-empty">
                                                No breakdown reports available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </>
            )}

        </AdminLayout>
    );
}

export default Dashboard;
