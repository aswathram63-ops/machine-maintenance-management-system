
import { useEffect, useState } from "react";
import {
    AlertTriangle,
    Clock,
    CheckCircle,
    Activity,
    RefreshCw
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import StatCard from "../components/StatCard";
import { getBreakdowns } from "../services/breakdownService";

function OperatorDashboard() {
    const [breakdowns, setBreakdowns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setError("");

            const response = await getBreakdowns();
            const result = response.data;

            const records = Array.isArray(result)
                ? result
                : result.breakdowns ||
                  result.data ||
                  result.records ||
                  [];

            setBreakdowns(records);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your breakdown reports."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const total = breakdowns.length;

    const open = breakdowns.filter(
        item => item.status === "Open"
    ).length;

    const inProgress = breakdowns.filter(
        item => item.status === "In Progress"
    ).length;

    const closed = breakdowns.filter(
        item => item.status === "Closed"
    ).length;

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <AdminLayout>
            <div className="page-heading">
                <div>
                    <span className="page-eyebrow">
                        OPERATOR OVERVIEW
                    </span>
                    <h1>My Dashboard</h1>
                    <p>
                        Monitor machine issues and track your reported breakdowns.
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
                    Loading your dashboard...
                </div>
            ) : (
                <>
                    <div className="stats-grid">
                        <StatCard
                            title="My Reports"
                            value={total}
                            icon={AlertTriangle}
                            color="#3679ed"
                            subtitle="Total reported breakdowns"
                        />

                        <StatCard
                            title="Open"
                            value={open}
                            icon={Clock}
                            color="#e45454"
                            subtitle="Awaiting action"
                        />

                        <StatCard
                            title="In Progress"
                            value={inProgress}
                            icon={Activity}
                            color="#e8a12a"
                            subtitle="Currently being repaired"
                        />

                        <StatCard
                            title="Closed"
                            value={closed}
                            icon={CheckCircle}
                            color="#16a36a"
                            subtitle="Resolved breakdowns"
                        />
                    </div>

                    <div className="section-heading">
                        <div>
                            <h2>My Breakdown Reports</h2>
                            <p>
                                Track the status of issues you have reported.
                            </p>
                        </div>
                    </div>

                    <div className="dashboard-panel recent-panel">
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
                                                        {item.machine_name || "—"}
                                                    </strong>
                                                    <small>
                                                        {item.machine_code || "—"}
                                                    </small>
                                                </td>

                                                <td>{item.description}</td>

                                                <td>
                                                    <span className={`priority-badge ${String(item.priority || "").toLowerCase()}`}>
                                                        {item.priority || "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className={`status-badge ${
                                                        item.status === "Closed"
                                                            ? "completed"
                                                            : item.status === "In Progress"
                                                            ? "progress"
                                                            : "open"
                                                    }`}>
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
                                            <td colSpan="5" className="table-empty">
                                                You have not reported any breakdowns yet.
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

export default OperatorDashboard;
