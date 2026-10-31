
import { useEffect, useState } from "react";

import {
    ClipboardList,
    CalendarDays,
    CheckCircle,
    Clock,
    AlertTriangle,
    RefreshCw,
    Wrench,
    Activity
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import StatCard from "../components/StatCard";

import { getMaintenances } from "../services/maintenanceService";
import { getBreakdowns } from "../services/breakdownService";

function StaffDashboard() {
    const [maintenances, setMaintenances] = useState([]);
    const [breakdowns, setBreakdowns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setError("");

            const [maintenanceResult, breakdownResult] =
                await Promise.all([
                    getMaintenances(),
                    getBreakdowns()
                ]);

            setMaintenances(
                maintenanceResult.maintenances || []
            );

            setBreakdowns(
                breakdownResult.data?.data || []
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load staff dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const scheduledCount = maintenances.filter(
        item => item.status === "Scheduled"
    ).length;

    const progressCount = maintenances.filter(
        item => item.status === "In Progress"
    ).length;

    const completedCount = maintenances.filter(
        item => item.status === "Completed"
    ).length;

    const openBreakdowns = breakdowns.filter(
        item => item.status === "Open"
    ).length;

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC"
        });
    };

    const getStatusClass = (status) => {
        if (status === "Completed" || status === "Closed") {
            return "completed";
        }

        if (status === "In Progress") {
            return "progress";
        }

        return "open";
    };

    return (
        <AdminLayout>

            {/* PAGE HEADER */}
            <div className="page-heading">
                <div>
                    <span className="page-eyebrow">
                        STAFF OVERVIEW
                    </span>

                    <h1>My Dashboard</h1>

                    <p>
                        Monitor your assigned maintenance tasks
                        and breakdown activities.
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
                    <button
                        onClick={() => {
                            setLoading(true);
                            fetchDashboard();
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    Loading your dashboard...
                </div>
            ) : (
                <>

                    {/* MAINTENANCE STATISTICS */}
                    <div className="stats-grid">

                        <StatCard
                            title="Assigned Tasks"
                            value={maintenances.length}
                            icon={ClipboardList}
                            color="#3679ed"
                            subtitle="Your maintenance tasks"
                        />

                        <StatCard
                            title="Scheduled"
                            value={scheduledCount}
                            icon={CalendarDays}
                            color="#e8a12a"
                            subtitle="Pending activities"
                        />

                        <StatCard
                            title="In Progress"
                            value={progressCount}
                            icon={Clock}
                            color="#3679ed"
                            subtitle="Currently working"
                        />

                        <StatCard
                            title="Completed"
                            value={completedCount}
                            icon={CheckCircle}
                            color="#16a36a"
                            subtitle="Finished activities"
                        />

                    </div>

                    {/* BREAKDOWN SUMMARY */}
                    <div className="section-heading">
                        <div>
                            <h2>Assigned Breakdown Overview</h2>
                            <p>
                                Breakdown issues assigned to you
                            </p>
                        </div>
                    </div>

                    <div className="breakdown-summary">

                        <div className="summary-item">
                            <span>Total Assigned Breakdowns</span>
                            <h2>{breakdowns.length}</h2>
                        </div>

                        <div className="summary-item">
                            <span>Open</span>
                            <h2 className="text-red">
                                {openBreakdowns}
                            </h2>
                        </div>

                        <div className="summary-item">
                            <span>In Progress</span>
                            <h2 className="text-orange">
                                {progressBreakdownCount(breakdowns)}
                            </h2>
                        </div>

                        <div className="summary-item">
                            <span>Closed</span>
                            <h2 className="text-green">
                                {breakdowns.filter(
                                    item => item.status === "Closed"
                                ).length}
                            </h2>
                        </div>

                    </div>

                    {/* ASSIGNED MAINTENANCE */}
                    <div className="dashboard-panel recent-panel">

                        <div className="panel-heading">
                            <div>
                                <h3>My Maintenance Tasks</h3>
                                <p>
                                    Your assigned maintenance activities
                                </p>
                            </div>

                            <Wrench size={20} />
                        </div>

                        <div className="table-wrapper">
                            <table className="dashboard-table">

                                <thead>
                                    <tr>
                                        <th>Machine</th>
                                        <th>Description</th>
                                        <th>Scheduled Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {maintenances.length > 0 ? (
                                        maintenances.map(item => (
                                            <tr key={item.maintenance_id}>
                                                <td>
                                                    <strong>
                                                        {item.machine_name}
                                                    </strong>
                                                    <small>
                                                        {item.machine_code}
                                                    </small>
                                                </td>

                                                <td>
                                                    {item.description}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        item.maintenance_date
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${getStatusClass(item.status)}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="table-empty"
                                            >
                                                No maintenance tasks assigned.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </div>

                    {/* ASSIGNED BREAKDOWNS */}
                    <div className="dashboard-panel recent-panel">

                        <div className="panel-heading">
                            <div>
                                <h3>My Assigned Breakdowns</h3>
                                <p>
                                    Machine issues requiring your attention
                                </p>
                            </div>

                            <AlertTriangle size={20} />
                        </div>

                        <div className="table-wrapper">
                            <table className="dashboard-table">

                                <thead>
                                    <tr>
                                        <th>Machine</th>
                                        <th>Description</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Reported Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {breakdowns.length > 0 ? (
                                        breakdowns.map(item => (
                                            <tr key={item.breakdown_id}>
                                                <td>
                                                    <strong>
                                                        {item.machine_name}
                                                    </strong>
                                                    <small>
                                                        {item.machine_code}
                                                    </small>
                                                </td>

                                                <td>
                                                    {item.description}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`priority-badge ${String(item.priority).toLowerCase()}`}
                                                    >
                                                        {item.priority}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${getStatusClass(item.status)}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>

                                                <td>
                                                    {formatDate(item.reported_at)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="table-empty"
                                            >
                                                No breakdowns assigned.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </div>

                    {/* ACTIVITY INFORMATION */}
                    <div className="dashboard-panel">
                        <div className="panel-heading">
                            <div>
                                <h3>Work Summary</h3>
                                <p>
                                    Overview of your current activities
                                </p>
                            </div>

                            <Activity size={20} />
                        </div>

                        <div className="maintenance-list">
                            <div className="maintenance-item">
                                <div className="maintenance-icon">
                                    <ClipboardList size={18} />
                                </div>

                                <div className="maintenance-details">
                                    <strong>
                                        Maintenance completion
                                    </strong>
                                    <span>
                                        {completedCount} of {maintenances.length} tasks completed
                                    </span>
                                </div>
                            </div>

                            <div className="maintenance-item">
                                <div className="maintenance-icon">
                                    <AlertTriangle size={18} />
                                </div>

                                <div className="maintenance-details">
                                    <strong>
                                        Breakdown activities
                                    </strong>
                                    <span>
                                        {breakdowns.length} breakdowns assigned to you
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </>
            )}

        </AdminLayout>
    );
}

// Count breakdowns currently in progress
function progressBreakdownCount(breakdowns) {
    return breakdowns.filter(
        item => item.status === "In Progress"
    ).length;
}

export default StaffDashboard;
