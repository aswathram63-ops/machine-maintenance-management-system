
import { useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    CalendarDays,
    X
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";

import {
    getMaintenances,
    updateMaintenanceStatus
} from "../services/maintenanceService";

function StaffMaintenance() {
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [workDescription, setWorkDescription] = useState("");

    const fetchRecords = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getMaintenances(search, statusFilter);
            setRecords(result.maintenances || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load assigned maintenance."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [search, statusFilter]);

    const handleStatusChange = async (id, status) => {
        if (status === "Completed") {
            const task = records.find(
                item => item.maintenance_id === id
            );

            setSelectedTask(task);
            setWorkDescription("");
            setError("");
            setShowModal(true);
            return;
        }

        try {
            setUpdatingId(id);
            setError("");
            setSuccess("");

            await updateMaintenanceStatus(id, status);

            setSuccess("Maintenance status updated successfully!");
            await fetchRecords();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update maintenance status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCompletion = async (e) => {
        e.preventDefault();

        if (!workDescription.trim()) {
            setError("Please enter your completion report.");
            return;
        }

        try {
            setUpdatingId(selectedTask.maintenance_id);
            setError("");

            await updateMaintenanceStatus(
                selectedTask.maintenance_id,
                "Completed",
                workDescription.trim()
            );

            setShowModal(false);
            setSelectedTask(null);
            setWorkDescription("");

            setSuccess(
                "Maintenance completed! Work log generated successfully."
            );

            await fetchRecords();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to complete maintenance."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const counts = {
        total: records.length,
        scheduled: records.filter(r => r.status === "Scheduled").length,
        progress: records.filter(r => r.status === "In Progress").length,
        completed: records.filter(r => r.status === "Completed").length
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const value = String(date).slice(0, 10);
        const [year, month, day] = value.split("-");

        return `${day}-${month}-${year}`;
    };

    const statusClass = (status) => {
        if (status === "Completed") return "maintenance-completed";
        if (status === "In Progress") return "maintenance-progress";
        return "maintenance-scheduled";
    };

    return (
        <AdminLayout>

            <div className="page-heading">
                <div>
                    <span className="page-eyebrow">
                        STAFF WORKSPACE
                    </span>

                    <h1>My Maintenance</h1>

                    <p>
                        View your assigned maintenance tasks and update
                        their progress.
                    </p>
                </div>
            </div>

            {success && (
                <div className="machine-success">
                    {success}
                    <button onClick={() => setSuccess("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {error && !showModal && (
                <div className="machine-error">
                    {error}
                    <button onClick={() => setError("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="machine-summary-grid">

                <div className="machine-summary-card">
                    <span>Total Assigned</span>
                    <h2>{counts.total}</h2>
                </div>

                <div className="machine-summary-card">
                    <span>Scheduled</span>
                    <h2>{counts.scheduled}</h2>
                </div>

                <div className="machine-summary-card">
                    <span>In Progress</span>
                    <h2 className="text-orange">{counts.progress}</h2>
                </div>

                <div className="machine-summary-card">
                    <span>Completed</span>
                    <h2 className="text-green">{counts.completed}</h2>
                </div>

            </div>

            <div className="machine-panel">

                <div className="machine-toolbar">

                    <div className="machine-search">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search machine or description..."
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
                        <h3>Assigned Maintenance Tasks</h3>
                        <p>Maintenance activities assigned to you.</p>
                    </div>

                    <span>{records.length} Tasks</span>
                </div>

                <div className="table-wrapper">

                    <table className="dashboard-table machine-table">

                        <thead>
                            <tr>
                                <th>Machine</th>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Update Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="table-empty">
                                        Loading your tasks...
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="table-empty">
                                        <CalendarDays size={30} />
                                        <p>No assigned maintenance tasks found.</p>
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (
                                    <tr key={record.maintenance_id}>

                                        <td>
                                            <strong>{record.machine_name}</strong>
                                            <small>{record.machine_code}</small>
                                        </td>

                                        <td>
                                            {formatDate(record.maintenance_date)}
                                        </td>

                                        <td>{record.description}</td>

                                        <td>
                                            <span className={`machine-status ${statusClass(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>

                                        <td>
                                            <select
                                                className="machine-filter"
                                                value={record.status}
                                                disabled={
                                                    updatingId === record.maintenance_id ||
                                                    record.status === "Completed"
                                                }
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        record.maintenance_id,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="Scheduled">
                                                    Scheduled
                                                </option>
                                                <option value="In Progress">
                                                    In Progress
                                                </option>
                                                <option value="Completed">
                                                    Completed
                                                </option>
                                            </select>

                                            {updatingId === record.maintenance_id && (
                                                <small>Updating...</small>
                                            )}
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* COMPLETION REPORT MODAL */}
            {showModal && selectedTask && (
                <div className="modal-overlay">

                    <div className="modal-content">

                        <div className="modal-header">
                            <h2>Complete Maintenance</h2>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    setError("");
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCompletion}>

                            <div className="machine-form-group">
                                <label>Machine</label>

                                <input
                                    value={`${selectedTask.machine_name} (${selectedTask.machine_code})`}
                                    disabled
                                />
                            </div>

                            <div className="machine-form-group">
                                <label>Maintenance Task</label>

                                <input
                                    value={selectedTask.description}
                                    disabled
                                />
                            </div>

                            <div className="machine-form-group">
                                <label>Completion Report *</label>

                                <textarea
                                    rows="5"
                                    value={workDescription}
                                    onChange={(e) =>
                                        setWorkDescription(e.target.value)
                                    }
                                    placeholder="Describe the maintenance work you completed..."
                                    required
                                />
                            </div>

                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    disabled={updatingId === selectedTask.maintenance_id}
                                    onClick={() => {
                                        setShowModal(false);
                                        setError("");
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={
                                        updatingId === selectedTask.maintenance_id ||
                                        !workDescription.trim()
                                    }
                                >
                                    {updatingId === selectedTask.maintenance_id
                                        ? "Completing..."
                                        : "Complete & Generate Work Log"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </AdminLayout>
    );
}

export default StaffMaintenance;
