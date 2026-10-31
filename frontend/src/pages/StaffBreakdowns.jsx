
import { useEffect, useState } from "react";

import {
    Search,
    RefreshCw,
    AlertTriangle,
    X
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";

import {
    getBreakdowns,
    updateBreakdownStatus
} from "../services/breakdownService";

function StaffBreakdowns() {
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedBreakdown, setSelectedBreakdown] = useState(null);
    const [workDescription, setWorkDescription] = useState("");

    const fetchBreakdowns = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getBreakdowns(
                search,
                statusFilter,
                priorityFilter
            );

            setRecords(response.data.data || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load assigned breakdowns."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBreakdowns();
        }, 300);

        return () => clearTimeout(timer);
    }, [search, statusFilter, priorityFilter]);

    const handleStatusChange = async (id, status) => {
        if (status === "Closed") {
            const breakdown = records.find(
                item => item.breakdown_id === id
            );

            setSelectedBreakdown(breakdown);
            setWorkDescription("");
            setError("");
            setShowModal(true);
            return;
        }

        try {
            setUpdatingId(id);
            setError("");
            setSuccess("");

            await updateBreakdownStatus(id, status);

            setSuccess("Breakdown status updated successfully!");

            await fetchBreakdowns();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update breakdown status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCompletion = async (e) => {
        e.preventDefault();

        if (!workDescription.trim()) {
            setError("Please enter your repair completion report.");
            return;
        }

        try {
            setUpdatingId(selectedBreakdown.breakdown_id);
            setError("");

            await updateBreakdownStatus(
                selectedBreakdown.breakdown_id,
                "Closed",
                workDescription.trim()
            );

            setShowModal(false);
            setSelectedBreakdown(null);
            setWorkDescription("");

            setSuccess(
                "Breakdown closed! Work log generated successfully."
            );

            await fetchBreakdowns();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to close breakdown."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const openCount = records.filter(
        r => r.status === "Open"
    ).length;

    const progressCount = records.filter(
        r => r.status === "In Progress"
    ).length;

    const closedCount = records.filter(
        r => r.status === "Closed"
    ).length;

    const criticalCount = records.filter(
        r => r.priority === "Critical"
    ).length;

    const getStatusClass = (status) => {
        if (status === "Closed") return "breakdown-closed";
        if (status === "In Progress") return "breakdown-progress";
        return "breakdown-open";
    };

    const getPriorityClass = (priority) => {
        return `breakdown-priority-${priority.toLowerCase()}`;
    };

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN");
    };

    return (
        <AdminLayout>

            <div className="page-container">

                <div className="page-header">
                    <div>
                        <span className="page-eyebrow">
                            STAFF WORKSPACE
                        </span>

                        <h1>My Breakdowns</h1>

                        <p>
                            View and manage breakdowns assigned to you.
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
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="stats-grid">

                    <div className="stat-card">
                        <h3>Total Assigned</h3>
                        <h2>{records.length}</h2>
                    </div>

                    <div className="stat-card">
                        <h3>Open</h3>
                        <h2>{openCount}</h2>
                    </div>

                    <div className="stat-card">
                        <h3>In Progress</h3>
                        <h2>{progressCount}</h2>
                    </div>

                    <div className="stat-card">
                        <h3>Closed</h3>
                        <h2>{closedCount}</h2>
                    </div>

                    <div className="stat-card">
                        <h3>Critical</h3>
                        <h2>{criticalCount}</h2>
                    </div>

                </div>

                <div className="table-card">

                    <div className="table-toolbar">

                        <input
                            type="text"
                            placeholder="Search machine or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="">All Priorities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>

                        <button
                            className="machine-refresh"
                            onClick={fetchBreakdowns}
                            title="Refresh"
                        >
                            <RefreshCw size={18} />
                        </button>

                    </div>

                    <div className="table-responsive">

                        <table className="machine-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Machine</th>
                                    <th>Description</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Reported By</th>
                                    <th>Reported Date</th>
                                    <th>Update Status</th>
                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td colSpan="8">
                                            Loading assigned breakdowns...
                                        </td>
                                    </tr>

                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="8">
                                            <AlertTriangle size={28} />
                                            <p>No assigned breakdowns found.</p>
                                        </td>
                                    </tr>

                                ) : (
                                    records.map((record) => (

                                        <tr key={record.breakdown_id}>

                                            <td>
                                                #{record.breakdown_id}
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

                                            <td className="breakdown-description">
                                                {record.description}
                                            </td>

                                            <td>
                                                <span className={`status-badge ${getPriorityClass(record.priority)}`}>
                                                    {record.priority}
                                                </span>
                                            </td>

                                            <td>
                                                <span className={`status-badge ${getStatusClass(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>

                                            <td>
                                                {record.reported_by_name || "—"}
                                            </td>

                                            <td>
                                                {formatDate(record.reported_at)}
                                            </td>

                                            <td>
                                                <select
                                                    value={record.status}
                                                    disabled={
                                                        updatingId === record.breakdown_id ||
                                                        record.status === "Closed"
                                                    }
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            record.breakdown_id,
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="Open">
                                                        Open
                                                    </option>

                                                    <option value="In Progress">
                                                        In Progress
                                                    </option>

                                                    <option value="Closed">
                                                        Closed
                                                    </option>
                                                </select>

                                                {updatingId === record.breakdown_id && (
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

            </div>

            {/* REPAIR COMPLETION REPORT MODAL */}
            {showModal && selectedBreakdown && (
                <div className="modal-overlay">

                    <div className="modal-content">

                        <div className="modal-header">
                            <h2>Close Breakdown</h2>

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
                                    value={`${selectedBreakdown.machine_name} (${selectedBreakdown.machine_code})`}
                                    disabled
                                />
                            </div>

                            <div className="machine-form-group">
                                <label>Breakdown Description</label>

                                <textarea
                                    value={selectedBreakdown.description}
                                    rows="3"
                                    disabled
                                />
                            </div>

                            <div className="machine-form-group">
                                <label>Repair Completion Report *</label>

                                <textarea
                                    value={workDescription}
                                    onChange={(e) =>
                                        setWorkDescription(e.target.value)
                                    }
                                    rows="5"
                                    placeholder="Describe the repair work performed and how the issue was resolved..."
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
                                    disabled={updatingId === selectedBreakdown.breakdown_id}
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
                                        updatingId === selectedBreakdown.breakdown_id ||
                                        !workDescription.trim()
                                    }
                                >
                                    {updatingId === selectedBreakdown.breakdown_id
                                        ? "Closing..."
                                        : "Close & Generate Work Log"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </AdminLayout>
    );
}

export default StaffBreakdowns;
