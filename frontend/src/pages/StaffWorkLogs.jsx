
import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { getWorkLogs } from "../services/workLogService";

function StaffWorkLogs() {
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchWorkLogs();
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const fetchWorkLogs = async () => {
        try {
            setLoading(true);

            const response = await getWorkLogs(search);

            setRecords(response.data.data || []);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load your work logs."
            );
        } finally {
            setLoading(false);
        }
    };

    const totalLogs = records.length;

    const breakdownLogs = records.filter(
        (record) => record.task_type === "Breakdown"
    ).length;

    const maintenanceLogs = records.filter(
        (record) => record.task_type === "Maintenance"
    ).length;

    return (
        <AdminLayout>
            <div className="page-container">

                <div className="page-header">
                    <div>
                        <h1>My Work Logs</h1>
                        <p>
                            View your automatically generated maintenance
                            and breakdown completion records.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="stats-grid">

                    <div className="stat-card">
                        <h3>My Total Work Logs</h3>
                        <h2>{totalLogs}</h2>
                    </div>

                    <div className="stat-card">
                        <h3>Breakdown Logs</h3>
                        <h2>{breakdownLogs}</h2>
                    </div>

                    <div className="stat-card">
                        <h3>Maintenance Logs</h3>
                        <h2>{maintenanceLogs}</h2>
                    </div>

                </div>

                <div className="table-card">

                    <div className="table-toolbar">
                        <input
    type="text"
    placeholder="Search machine or work description..."
    value={search}
    onChange={(e) => {
        setSearch(e.target.value);
    }}
    disabled={false}
    style={{
        pointerEvents: "auto",
        cursor: "text",
        position: "relative",
        zIndex: 2
    }}
/>
                    </div>

                    <div className="table-responsive">

                        <table className="machine-table">

                            <thead>
                                <tr>
                                    <th>Log ID</th>
                                    <th>Task Type</th>
                                    <th>Machine</th>
                                    <th>Task ID</th>
                                    <th>Work Description</th>
                                    <th>Status</th>
                                    <th>Log Date</th>
                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td colSpan="7">
                                            Loading your work logs...
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="7">
                                            No work logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((record) => {
                                        const taskType = record.task_type;

                                        const taskId =
                                            taskType === "Maintenance"
                                                ? record.maintenance_id
                                                : record.breakdown_id;

                                        const status =
                                            record.breakdown_status;

                                        return (
                                            <tr key={record.log_id}>

                                                <td>
                                                    #{record.log_id}
                                                </td>

                                                <td>
                                                    {taskType}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {record.machine_name}
                                                    </strong>
                                                    <br />
                                                    <small>
                                                        {record.machine_code}
                                                    </small>
                                                </td>

                                                <td>
                                                    #{taskId}
                                                </td>

                                                <td className="work-description">
                                                    {record.work_description}
                                                </td>

                                                <td>
                                                    <span className={`status-badge ${
                                                        status === "Closed" ||
                                                        status === "Completed"
                                                            ? "breakdown-closed"
                                                            : status === "In Progress"
                                                                ? "breakdown-progress"
                                                                : "breakdown-open"
                                                    }`}>
                                                        {status || "Completed"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {new Date(
                                                        record.log_date
                                                    ).toLocaleDateString("en-IN")}
                                                </td>

                                            </tr>
                                        );
                                    })
                                )}

                            </tbody>
                        </table>

                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}

export default StaffWorkLogs;
