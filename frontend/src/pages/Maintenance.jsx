
import { useEffect, useState } from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    CalendarDays,
    RefreshCw,
    X,
    Wrench
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";

import {
    getMaintenances,
    getMaintenanceMachines,
    getMaintenanceStaff,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance
} from "../services/maintenanceService";

const initialForm = {
    machine_id: "",
    assigned_to: "",
    maintenance_date: "",
    description: "",
    status: "Scheduled"
};

function Maintenance() {
    const [records, setRecords] = useState([]);
    const [machines, setMachines] = useState([]);
    const [staff, setStaff] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);

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

    const fetchDropdownData = async () => {
        try {
            const [machineResult, staffResult] = await Promise.all([
                getMaintenanceMachines(),
                getMaintenanceStaff()
            ]);

            setMachines(machineResult.machines || []);
            setStaff(staffResult.staff || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load machine and staff details."
            );
        }
    };

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [search, statusFilter]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const openAddModal = () => {
        setEditingId(null);
        setForm(initialForm);
        setShowModal(true);
    };

    const openEditModal = (record) => {
        setEditingId(record.maintenance_id);

        setForm({
            machine_id: String(record.machine_id),
            assigned_to: record.assigned_to
                ? String(record.assigned_to)
                : "",
            maintenance_date: String(record.maintenance_date).slice(0, 10),
            description: record.description || "",
            status: record.status
        });

        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                ...form,
                machine_id: Number(form.machine_id),
                assigned_to: form.assigned_to
                    ? Number(form.assigned_to)
                    : null
            };

            if (editingId) {
                await updateMaintenance(editingId, payload);
                setSuccess("Maintenance updated successfully!");
            } else {
                await addMaintenance(payload);
                setSuccess("Maintenance scheduled successfully!");
            }

            setShowModal(false);
            setForm(initialForm);

            await fetchRecords();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save maintenance."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this maintenance record?")) return;

        try {
            setError("");
            setSuccess("");

            await deleteMaintenance(id);

            setSuccess("Maintenance deleted successfully!");
            await fetchRecords();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete maintenance."
            );
        }
    };

    const statusClass = (status) => {
        if (status === "Completed") return "maintenance-completed";
        if (status === "In Progress") return "maintenance-progress";
        return "maintenance-scheduled";
    };

    const counts = {
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

    return (
        <AdminLayout>

            {/* PAGE HEADER */}
            <div className="page-heading">
                <div>
                    <span className="page-eyebrow">
                        OPERATIONS MANAGEMENT
                    </span>

                    <h1>Maintenance Management</h1>

                    <p>
                        Schedule, assign and monitor machine maintenance.
                    </p>
                </div>

                <button
                    className="add-machine-button"
                    onClick={openAddModal}
                >
                    <Plus size={18} />
                    Schedule Maintenance
                </button>
            </div>

            {/* ALERTS */}
            {success && (
                <div className="machine-success">
                    {success}
                    <button onClick={() => setSuccess("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

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
                    <h2 className="text-orange">{counts.progress}</h2>
                </div>

                <div className="machine-summary-card">
                    <span>Completed</span>
                    <h2 className="text-green">{counts.completed}</h2>
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
                        <h3>Maintenance Schedule</h3>
                        <p>All scheduled and completed maintenance activities.</p>
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
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="table-empty">
                                        Loading maintenance records...
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="table-empty">
                                        <CalendarDays size={30} />
                                        <p>No maintenance records found.</p>
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
                                            {record.assigned_staff || "Unassigned"}
                                        </td>

                                        <td>
                                            <span className={`machine-status ${statusClass(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="machine-actions">

                                                <button
                                                    className="edit-action"
                                                    title="Edit maintenance"
                                                    onClick={() => openEditModal(record)}
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    className="delete-action"
                                                    title="Delete maintenance"
                                                    onClick={() => handleDelete(record.maintenance_id)}
                                                >
                                                    <Trash2 size={16} />
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

            {/* ADD / EDIT MODAL */}
            {showModal && (

                <div
                    className="machine-modal-overlay"
                    onClick={() => setShowModal(false)}
                >

                    <div
                        className="machine-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="machine-modal-header">

                            <div>
                                <h2>
                                    {editingId
                                        ? "Edit Maintenance"
                                        : "Schedule Maintenance"}
                                </h2>

                                <p>
                                    Enter maintenance details below.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="machine-form-grid">

                                <div className="machine-form-group full-width">
                                    <label>Select Machine *</label>

                                    <select
                                        name="machine_id"
                                        value={form.machine_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Choose machine</option>

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
                                    <label>Maintenance Date *</label>

                                    <input
                                        type="date"
                                        name="maintenance_date"
                                        value={form.maintenance_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="machine-form-group">
                                    <label>Assign Maintenance Staff</label>

                                    <select
                                        name="assigned_to"
                                        value={form.assigned_to}
                                        onChange={handleChange}
                                    >
                                        <option value="">Unassigned</option>

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

                                <div className="machine-form-group full-width">
                                    <label>Description *</label>

                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Describe the maintenance activity..."
                                        rows="4"
                                        required
                                    />
                                </div>

                                {editingId && (
                                    <div className="machine-form-group full-width">
                                        <label>Maintenance Status</label>

                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleChange}
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
                                    </div>
                                )}

                            </div>

                            <div className="machine-modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-machine-button"
                                    disabled={saving || machines.length === 0}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Maintenance"
                                            : "Schedule Maintenance"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </AdminLayout>
    );
}

export default Maintenance;
