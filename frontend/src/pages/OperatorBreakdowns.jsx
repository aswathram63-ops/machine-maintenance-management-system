
import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

import {
    getBreakdowns,
    getBreakdownMachines,
    addBreakdown
} from "../services/breakdownService";

const initialForm = {
    machine_id: "",
    description: "",
    priority: "Medium"
};

function OperatorBreakdowns() {
    const [records, setRecords] = useState([]);
    const [machines, setMachines] = useState([]);

    const [form, setForm] = useState(initialForm);

    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchBreakdowns = async () => {
        try {
            setLoading(true);

            const response = await getBreakdowns();
            setRecords(response.data.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load your breakdown reports."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchMachines = async () => {
        try {
            const response = await getBreakdownMachines();
            setMachines(response.data.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load machines."
            );
        }
    };

    useEffect(() => {
        fetchMachines();
        fetchBreakdowns();
    }, []);

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
            setSuccess("");

            await addBreakdown({
                machine_id: Number(form.machine_id),
                description: form.description.trim(),
                priority: form.priority
            });

            setForm(initialForm);
            setShowModal(false);

            setSuccess("Breakdown reported successfully!");

            await fetchBreakdowns();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to report breakdown."
            );
        } finally {
            setSaving(false);
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
                        <h1>Report Breakdown</h1>
                        <p>
                            Report machine problems and track your reported issues.
                        </p>
                    </div>

                    <button
                        className="primary-btn"
                        onClick={() => {
                            setForm(initialForm);
                            setError("");
                            setShowModal(true);
                        }}
                    >
                        + Report Breakdown
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <div className="stats-grid">

                    <div className="stat-card">
                        <h3>My Reports</h3>
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
                        <h3>My Reported Breakdowns</h3>

                        <button
                            className="primary-btn"
                            onClick={fetchBreakdowns}
                        >
                            Refresh
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
                                    <th>Reported At</th>
                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td colSpan="6">
                                            Loading your reports...
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            You haven't reported any breakdowns yet.
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
                                                {record.reported_at
                                                    ? new Date(record.reported_at).toLocaleDateString()
                                                    : "—"}
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
                                <h2>Report Machine Breakdown</h2>

                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>

                                <div className="machine-form-group">
                                    <label>Select Machine *</label>

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
                                            ? "Submitting..."
                                            : "Submit Report"}
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

export default OperatorBreakdowns;
