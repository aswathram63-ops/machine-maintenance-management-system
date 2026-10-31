import { useEffect, useState } from "react";

import {
    Search,
    CalendarDays,
    RefreshCw,
    Wrench,
    X
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";

import { getMaintenances } from "../services/maintenanceService";

function OperatorMaintenance() {
    const [records, setRecords] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRecords = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getMaintenances(search, statusFilter);

            setRecords(result.maintenances || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load maintenance records."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [search, statusFilter]);

    const statusClass = (status) => {
        if (status === "Completed") return "maintenance-completed";
        if (status === "In Progress") return "maintenance-progress";
        return "maintenance-scheduled";
    };

    const counts = {
        scheduled: records.filter(
            r => r.status === "Scheduled"
        ).length,

        progress: records.filter(
            r => r.status === "In Progress"
        ).length,

        completed: records.filter(
            r => r.status === "Completed"
        ).length
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const value = String(date).slice(0, 10);
        const [year, month, day] = value.split("-");

        return `${day}-${month}-${year}`;
    };

    return (
        <AdminLayout>

            {/* PAGE HEADER */}
            <div className="page-heading">
                <div>
                    <span className="page-eyebrow">
                        MACHINE OPERATIONS
                    </span>

                    <h1>Maintenance Status</h1>

                    <p>
                        View and track maintenance activities across machines.
                    </p>
                </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="machine-error">
                    {error}

                    <button onClick={() => setError("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* SUMMARY CARDS */}
            <div className="machine-summary-grid">

                <div className="machine-summary-card">
                    <span>Total Records</span>
                    <h2>{records.length}</h2>
                </div>

                <div className="machine-summary-card">
                    <span>Scheduled</span>
                    <h2>{counts.scheduled}</h2>
                </div>

                <div className="machine-summary-card">
                    <span>In Progress</span>
                    <h2 className="text-orange">
                        {counts.progress}
                    </h2>
                </div>

                <div className="machine-summary-card">
                    <span>Completed</span>
                    <h2 className="text-green">
                        {counts.completed}
                    </h2>
                </div>

            </div>

            {/* MAINTENANCE TABLE */}
            <div className="machine-panel">

                <div className="machine-toolbar">

                    <div className="machine-search">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search machine, code or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="machine-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>

                    <button
                        className="machine-refresh"
                        onClick={fetchRecords}
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>

                </div>

                <div className="machine-table-heading">
                    <div>
                        <h3>Maintenance Records</h3>
                        <p>
                            Track scheduled and completed maintenance activities.
                        </p>
                    </div>

                    <span>{records.length} Records</span>
                </div>

                <div className="table-wrapper">

                    <table className="dashboard-table machine-table">

                        <thead>
                            <tr>
                                <th>Machine</th>
                                <th>Maintenance Date</th>
                                <th>Description</th>
                                <th>Assigned Staff</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="table-empty">
                                        Loading maintenance records...
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="table-empty">
                                        <CalendarDays size={30} />
                                        <p>No maintenance records found.</p>
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (

                                    <tr key={record.maintenance_id}>

                                        <td>
                                            <strong>
                                                {record.machine_name}
                                            </strong>

                                            <small>
                                                {record.machine_code}
                                            </small>
                                        </td>

                                        <td>
                                            {formatDate(record.maintenance_date)}
                                        </td>

                                        <td>
                                            {record.description}
                                        </td>

                                        <td>
                                            {record.assigned_staff || "Unassigned"}
                                        </td>

                                        <td>
                                            <span
                                                className={`machine-status ${statusClass(record.status)}`}
                                            >
                                                {record.status}
                                            </span>
                                        </td>

                                    </tr>

                                ))
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </AdminLayout>
    );
}

export default OperatorMaintenance;