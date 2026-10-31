
import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

import {
    getBreakdowns,
    getBreakdownMachines,
    getBreakdownStaff,
    addBreakdown,
    updateBreakdown,
    deleteBreakdown
} from "../services/breakdownService";

const initialForm = {
    machine_id: "",
    assigned_to: "",
    description: "",
    priority: "Medium",
    status: "Open"
};

function Breakdowns() {
    const [records, setRecords] = useState([]);
    const [machines, setMachines] = useState([]);
    const [staff, setStaff] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBreakdowns();
        }, 300);

        return () => clearTimeout(timer);
    }, [search, statusFilter, priorityFilter]);

    // Fetch machines and active maintenance staff
    const fetchDropdownData = async () => {
        try {
            const [machineRes, staffRes] = await Promise.all([
                getBreakdownMachines(),
                getBreakdownStaff()
            ]);

            setMachines(machineRes.data.data || []);

            // API returns { success: true, data: [...] }
            setStaff(staffRes.data || []);

        } catch (err) {
            console.error("Dropdown loading error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load machines or staff."
            );
        }
    };

    // Fetch breakdown records
    const fetchBreakdowns = async () => {
        try {
            setLoading(true);

            const response = await getBreakdowns(
                search,
                statusFilter,
                priorityFilter
            );

            setRecords(response.data.data || []);
            setError("");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load breakdown records."
            );
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setForm(initialForm);
        setError("");
        setShowModal(true);
    };

    const openEditModal = (record) => {
        setEditingId(record.breakdown_id);

        setForm({
            machine_id: String(record.machine_id),
            assigned_to: record.assigned_to
                ? String(record.assigned_to)
                : "",
            description: record.description,
            priority: record.priority,
            status: record.status
        });

        setError("");
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.machine_id || !form.description.trim()) {
            setError("Please select a machine and enter a description.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                machine_id: Number(form.machine_id),
                assigned_to: form.assigned_to
                    ? Number(form.assigned_to)
                    : null,
                description: form.description.trim(),
                priority: form.priority,
                ...(editingId ? { status: form.status } : {})
            };

            if (editingId) {
                await updateBreakdown(editingId, payload);
            } else {
                await addBreakdown(payload);
            }

            setShowModal(false);
            setForm(initialForm);
            setEditingId(null);

            await fetchBreakdowns();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save breakdown."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this breakdown?"
        );

        if (!confirmed) return;

        try {
            await deleteBreakdown(id);
            await fetchBreakdowns();

        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to delete breakdown."
            );
        }
    };

    const getStatusClass = (status) => {
        if (status === "Closed") return "breakdown-closed";
        if (status === "In Progress") return "breakdown-progress";
        return "breakdown-open";
    };

    const getPriorityClass = (priority) => {
        return `breakdown-priority-${priority.toLowerCase()}`;
    };

    const openCount = records.filter(
        (r) => r.status === "Open"
    ).length;

    const progressCount = records.filter(
        (r) => r.status === "In Progress"
    ).length;

    const closedCount = records.filter(
        (r) => r.status === "Closed"
    ).length;

    const criticalCount = records.filter(
        (r) => r.priority === "Critical"
    ).length;

    return (
        <AdminLayout>
            <div className="page-container">

                <div className="page-header">
                    <div>
                        <h1>Breakdown Management</h1>
                        <p>Report and monitor machine breakdowns.</p>
                    </div>

                    <button
                        className="primary-btn"
                        onClick={openAddModal}
                    >
                        + Report Breakdown
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="stats-grid">

                    <div className="stat-card">
                        <h3>Total Breakdowns</h3>
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
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                        >
                            <option value="">All Status</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) =>
                                setPriorityFilter(e.target.value)
                            }
                        >
                            <option value="">All Priorities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>

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
                                    <th>Assigned To</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8">
                                            Loading breakdowns...
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="8">
                                            No breakdown records found.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record.breakdown_id}>
                                            <td>#{record.breakdown_id}</td>

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
                                                {record.reported_by_name}
                                            </td>

                                            <td>
                                                {record.assigned_to_name || "Unassigned"}
                                            </td>

                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => openEditModal(record)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(record.breakdown_id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h2>
                                    {editingId
                                        ? "Update Breakdown"
                                        : "Report Breakdown"}
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>

                                <div className="machine-form-group">
                                    <label>Machine *</label>

                                    <select
                                        name="machine_id"
                                        value={form.machine_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Machine
                                        </option>

                                        {machines.map((machine) => (
                                            <option
                                                key={machine.machine_id}
                                                value={machine.machine_id}
                                            >
                                                {machine.machine_code} - {machine.machine_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="machine-form-group">
                                    <label>Assigned Staff</label>

                                    <select
                                        name="assigned_to"
                                        value={form.assigned_to}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Unassigned
                                        </option>

                                        {staff.map((person) => (
                                            <option
                                                key={person.user_id}
                                                value={person.user_id}
                                            >
                                                {person.name}
                                            </option>
                                        ))}
                                    </select>

                                    {staff.length === 0 && (
                                        <small>
                                            No active maintenance staff available.
                                        </small>
                                    )}
                                </div>

                                <div className="machine-form-group">
                                    <label>Description *</label>

                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Describe the machine problem..."
                                        required
                                    />
                                </div>

                                <div className="machine-form-group">
                                    <label>Priority</label>

                                    <select
                                        name="priority"
                                        value={form.priority}
                                        onChange={handleChange}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>

                                {editingId && (
                                    <div className="machine-form-group">
                                        <label>Status</label>

                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleChange}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                )}

                                {error && (
                                    <div className="error-message">
                                        {error}
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="primary-btn"
                                        disabled={saving || machines.length === 0}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingId
                                                ? "Update Breakdown"
                                                : "Report Breakdown"}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}

export default Breakdowns;
