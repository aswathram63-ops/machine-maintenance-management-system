
import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

import {
    getWorkLogs,
    getWorkLogBreakdowns,
    getWorkLogMaintenances,
    getWorkLogStaff,
    addWorkLog
} from "../services/workLogService";

function WorkLogs() {
    const [records, setRecords] = useState([]);
    const [breakdowns, setBreakdowns] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [staff, setStaff] = useState([]);

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        task_type: "Breakdown",
        task_id: "",
        staff_id: "",
        work_description: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchWorkLogs();
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const fetchDropdownData = async () => {
        try {
            const [
                breakdownRes,
                maintenanceRes,
                staffRes
            ] = await Promise.all([
                getWorkLogBreakdowns(),
                getWorkLogMaintenances(),
                getWorkLogStaff()
            ]);

            setBreakdowns(breakdownRes.data.data || []);
            setMaintenances(maintenanceRes.data.data || []);
            setStaff(staffRes.data.data || []);

        } catch (err) {
            setError("Unable to load work log dropdown data.");
        }
    };

    const fetchWorkLogs = async () => {
        try {
            setLoading(true);

            const response = await getWorkLogs(search);
            setRecords(response.data.data || []);
            setError("");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load work logs."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(previous => ({
            ...previous,
            [name]: value
        }));
    };

    const openModal = () => {
        setForm({
            task_type: "Breakdown",
            task_id: "",
            staff_id: "",
            work_description: ""
        });

        setError("");
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.task_id ||
            !form.staff_id ||
            !form.work_description.trim()
        ) {
            setError("Please complete all required fields.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                staff_id: Number(form.staff_id),
                work_description: form.work_description.trim()
            };

            if (form.task_type === "Breakdown") {
                payload.breakdown_id = Number(form.task_id);
            } else {
                payload.maintenance_id = Number(form.task_id);
            }

            await addWorkLog(payload);

            setShowModal(false);

            setForm({
                task_type: "Breakdown",
                task_id: "",
                staff_id: "",
                work_description: ""
            });

            await Promise.all([
                fetchWorkLogs(),
                fetchDropdownData()
            ]);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to add work log."
            );
        } finally {
            setSaving(false);
        }
    };

    const activeTasks =
        form.task_type === "Breakdown"
            ? breakdowns
            : maintenances;

    const totalLogs = records.length;
    const breakdownLogs = records.filter(
        record => record.task_type === "Breakdown"
    ).length;
    const maintenanceLogs = records.filter(
        record => record.task_type === "Maintenance"
    ).length;

    return (
        <AdminLayout>
            <div className="page-container">

                <div className="page-header">
                    <div>
                        <h1>Work Logs & Repair Tracking</h1>
                        <p>
                            Record and monitor machine repair and maintenance activities.
                        </p>
                    </div>

                    <button
                        className="primary-btn"
                        onClick={openModal}
                    >
                        + Add Work Log
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="stats-grid">

                    <div className="stat-card">
                        <h3>Total Work Logs</h3>
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
                            placeholder="Search machine, staff or work description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
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
                                    <th>Staff</th>
                                    <th>Work Description</th>
                                    <th>Status</th>
                                    <th>Log Date</th>
                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td colSpan="8">
                                            Loading work logs...
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="8">
                                            No work logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map(record => (
                                        <tr key={record.log_id}>

                                            <td>#{record.log_id}</td>

                                            <td>
                                                {record.task_type}
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
                                                {record.task_type === "Maintenance"
                                                    ? `#${record.maintenance_id}`
                                                    : `#${record.breakdown_id}`}
                                            </td>

                                            <td>
                                                {record.staff_name}
                                            </td>

                                            <td className="work-description">
                                                {record.work_description}
                                            </td>

                                            <td>
                                                <span className={`status-badge ${
                                                    record.breakdown_status === "Completed" ||
                                                    record.breakdown_status === "Closed"
                                                        ? "breakdown-closed"
                                                        : record.breakdown_status === "In Progress"
                                                            ? "breakdown-progress"
                                                            : "breakdown-open"
                                                }`}>
                                                    {record.breakdown_status}
                                                </span>
                                            </td>

                                            <td>
                                                {new Date(
                                                    record.log_date
                                                ).toLocaleDateString("en-IN")}
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
                                <h2>Add Work Log</h2>

                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>

                                <div className="machine-form-group">
                                    <label>Task Type *</label>

                                    <select
                                        name="task_type"
                                        value={form.task_type}
                                        onChange={(e) => {
                                            setForm(previous => ({
                                                ...previous,
                                                task_type: e.target.value,
                                                task_id: ""
                                            }));
                                        }}
                                    >
                                        <option value="Breakdown">
                                            Breakdown Repair
                                        </option>

                                        <option value="Maintenance">
                                            Scheduled Maintenance
                                        </option>
                                    </select>
                                </div>

                                <div className="machine-form-group">
                                    <label>
                                        {form.task_type === "Breakdown"
                                            ? "Breakdown *"
                                            : "Maintenance Task *"}
                                    </label>

                                    <select
                                        name="task_id"
                                        value={form.task_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Task
                                        </option>

                                        {activeTasks.map(item => (
                                            <option
                                                key={
                                                    form.task_type === "Breakdown"
                                                        ? item.breakdown_id
                                                        : item.maintenance_id
                                                }
                                                value={
                                                    form.task_type === "Breakdown"
                                                        ? item.breakdown_id
                                                        : item.maintenance_id
                                                }
                                            >
                                                #{form.task_type === "Breakdown"
                                                    ? item.breakdown_id
                                                    : item.maintenance_id}
                                                {" - "}
                                                {item.machine_name}
                                                {" ("}
                                                {item.status}
                                                {")"}
                                            </option>
                                        ))}
                                    </select>

                                    {activeTasks.length === 0 && (
                                        <small>
                                            No available tasks of this type.
                                        </small>
                                    )}
                                </div>

                                <div className="machine-form-group">
                                    <label>Maintenance Staff *</label>

                                    <select
                                        name="staff_id"
                                        value={form.staff_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Staff
                                        </option>

                                        {staff.map(person => (
                                            <option
                                                key={person.user_id}
                                                value={person.user_id}
                                            >
                                                {person.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="machine-form-group">
                                    <label>Work Description *</label>

                                    <textarea
                                        name="work_description"
                                        value={form.work_description}
                                        onChange={handleChange}
                                        rows="5"
                                        placeholder="Describe the work performed..."
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
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="primary-btn"
                                        disabled={
                                            saving ||
                                            activeTasks.length === 0 ||
                                            staff.length === 0
                                        }
                                    >
                                        {saving ? "Saving..." : "Add Work Log"}
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

export default WorkLogs;
