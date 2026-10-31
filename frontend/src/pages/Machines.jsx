
import { useEffect, useState } from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Factory,
    X,
    RefreshCw,
    MapPin
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";

import { getMaintenanceStaff } from "../services/maintenanceService";

import {
    getMachines,
    addMachine,
    updateMachine,
    deleteMachine
} from "../services/machineService";

const initialForm = {
    machine_code: "",
    machine_name: "",
    machine_type: "",
    location: "",
    status: "Operational",
    description: "",
    assigned_to: ""
};

function Machines() {
    const [machines, setMachines] = useState([]);
    const [staff, setStaff] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    // FETCH MAINTENANCE STAFF
    const fetchStaff = async () => {
        try {
            const result = await getMaintenanceStaff();
            setStaff(result.staff || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load maintenance staff."
            );
        }
    };

    // FETCH MACHINES
    const fetchMachines = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getMachines(search, statusFilter);

            setMachines(result.machines || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to retrieve machines."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        fetchMachines();
    }, [search, statusFilter]);

    // HANDLE INPUT CHANGES
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        if (name === "status") {
            setForm((previous) => ({
                ...previous,
                status: value,
                description:
                    value === "Operational"
                        ? ""
                        : previous.description,
                assigned_to:
                    value === "Maintenance"
                        ? previous.assigned_to
                        : ""
            }));
        }
    };

    // OPEN ADD MODAL
    const openAddModal = () => {
        setEditingId(null);
        setForm(initialForm);
        setError("");
        setShowModal(true);
    };

    // OPEN EDIT MODAL
    const openEditModal = (machine) => {
        setEditingId(machine.machine_id);

        setForm({
            machine_code: machine.machine_code || "",
            machine_name: machine.machine_name || "",
            machine_type: machine.machine_type || "",
            location: machine.location || "",
            status: machine.status || "Operational",
            description: "",
            assigned_to: ""
        });

        setError("");
        setShowModal(true);
    };

    // ADD / UPDATE MACHINE
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (
                form.status !== "Operational" &&
                !form.description.trim()
            ) {
                setError("Please enter a description.");
                return;
            }

            if (
                form.status === "Maintenance" &&
                !form.assigned_to
            ) {
                setError("Please assign maintenance staff.");
                return;
            }

            const machineData = {
                ...form,

                assigned_to:
                    form.status === "Maintenance"
                        ? Number(form.assigned_to)
                        : null,

                description:
                    form.status === "Operational"
                        ? null
                        : form.description.trim()
            };

            if (editingId) {
                await updateMachine(editingId, machineData);
                setSuccess("Machine updated successfully!");
            } else {
                await addMachine(machineData);
                setSuccess("Machine added successfully!");
            }

            setShowModal(false);
            setForm(initialForm);

            await fetchMachines();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save machine."
            );
        } finally {
            setSaving(false);
        }
    };

    // DELETE MACHINE
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this machine?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await deleteMachine(id);

            setSuccess("Machine deleted successfully!");

            await fetchMachines();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete machine."
            );
        }
    };

    // STATUS CLASS
    const getStatusClass = (status) => {
        switch (status) {
            case "Operational":
                return "machine-operational";

            case "Maintenance":
                return "machine-maintenance";

            case "Breakdown":
                return "machine-breakdown";

            default:
                return "";
        }
    };

    return (
        <AdminLayout>

            {/* PAGE HEADER */}
            <div className="page-heading">
                <div>
                    <span className="page-eyebrow">
                        ASSET MANAGEMENT
                    </span>

                    <h1>Machine Management</h1>

                    <p>
                        Register, monitor and manage industrial machines.
                    </p>
                </div>

                <button
                    className="add-machine-button"
                    onClick={openAddModal}
                >
                    <Plus size={18} />
                    Add Machine
                </button>
            </div>

            {/* SUCCESS MESSAGE */}
            {success && (
                <div className="machine-success">
                    {success}

                    <button onClick={() => setSuccess("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
                <div className="machine-error">
                    {error}

                    <button onClick={() => setError("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* MACHINE SUMMARY */}
            <div className="machine-summary-grid">

                <div className="machine-summary-card">
                    <span>Total Machines</span>
                    <h2>{machines.length}</h2>
                </div>

                <div className="machine-summary-card">
                    <span>Operational</span>

                    <h2 className="text-green">
                        {machines.filter(
                            m => m.status === "Operational"
                        ).length}
                    </h2>
                </div>

                <div className="machine-summary-card">
                    <span>Maintenance</span>

                    <h2 className="text-orange">
                        {machines.filter(
                            m => m.status === "Maintenance"
                        ).length}
                    </h2>
                </div>

                <div className="machine-summary-card">
                    <span>Breakdown</span>

                    <h2 className="text-red">
                        {machines.filter(
                            m => m.status === "Breakdown"
                        ).length}
                    </h2>
                </div>

            </div>

            {/* MACHINE TABLE */}
            <div className="machine-panel">

                <div className="machine-toolbar">

                    <div className="machine-search">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search machine name or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="machine-filter"
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                    >
                        <option value="">All Status</option>
                        <option value="Operational">Operational</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Breakdown">Breakdown</option>
                    </select>

                    <button
                        className="machine-refresh"
                        onClick={fetchMachines}
                        title="Refresh machines"
                    >
                        <RefreshCw size={18} />
                    </button>

                </div>

                <div className="machine-table-heading">
                    <div>
                        <h3>Registered Machines</h3>
                        <p>Manage all machines in your facility.</p>
                    </div>

                    <span>{machines.length} Records</span>
                </div>

                <div className="table-wrapper">

                    <table className="dashboard-table machine-table">

                        <thead>
                            <tr>
                                <th>Machine Code</th>
                                <th>Machine Name</th>
                                <th>Type</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="table-empty">
                                        Loading machines...
                                    </td>
                                </tr>

                            ) : machines.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="table-empty">
                                        <Factory size={30} />
                                        <p>No machines found.</p>
                                    </td>
                                </tr>

                            ) : (
                                machines.map((machine) => (

                                    <tr key={machine.machine_id}>

                                        <td>
                                            <strong>
                                                {machine.machine_code}
                                            </strong>
                                        </td>

                                        <td>
                                            <strong>
                                                {machine.machine_name}
                                            </strong>
                                        </td>

                                        <td>
                                            {machine.machine_type || "—"}
                                        </td>

                                        <td>
                                            <span className="machine-location">
                                                <MapPin size={13} />
                                                {machine.location || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`machine-status ${getStatusClass(machine.status)}`}>
                                                {machine.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="machine-actions">

                                                <button
                                                    className="edit-action"
                                                    title="Edit machine"
                                                    onClick={() => openEditModal(machine)}
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    className="delete-action"
                                                    title="Delete machine"
                                                    onClick={() => handleDelete(machine.machine_id)}
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
                                    {editingId ? "Edit Machine" : "Add New Machine"}
                                </h2>

                                <p>
                                    Enter the machine information below.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="modal-close"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="machine-form-grid">

                                {/* MACHINE CODE */}
                                <div className="machine-form-group">
                                    <label>Machine Code *</label>

                                    <input
                                        type="text"
                                        name="machine_code"
                                        value={form.machine_code}
                                        onChange={handleInputChange}
                                        placeholder="Example: MCH002"
                                        required
                                    />
                                </div>

                                {/* MACHINE NAME */}
                                <div className="machine-form-group">
                                    <label>Machine Name *</label>

                                    <input
                                        type="text"
                                        name="machine_name"
                                        value={form.machine_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter machine name"
                                        required
                                    />
                                </div>

                                {/* MACHINE TYPE */}
                                <div className="machine-form-group">
                                    <label>Machine Type</label>

                                    <input
                                        type="text"
                                        name="machine_type"
                                        value={form.machine_type}
                                        onChange={handleInputChange}
                                        placeholder="Example: CNC"
                                    />
                                </div>

                                {/* LOCATION */}
                                <div className="machine-form-group">
                                    <label>Location</label>

                                    <input
                                        type="text"
                                        name="location"
                                        value={form.location}
                                        onChange={handleInputChange}
                                        placeholder="Enter machine location"
                                    />
                                </div>

                                {/* MACHINE STATUS */}
                                <div className="machine-form-group full-width">
                                    <label>Machine Status</label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Operational">
                                            Operational
                                        </option>

                                        <option value="Maintenance">
                                            Maintenance
                                        </option>

                                        <option value="Breakdown">
                                            Breakdown
                                        </option>
                                    </select>
                                </div>

                                {/* CONDITIONAL DESCRIPTION */}
                                {form.status !== "Operational" && (
                                    <div className="machine-form-group full-width">

                                        <label>
                                            {form.status === "Maintenance"
                                                ? "Maintenance Description *"
                                                : "Breakdown Description *"}
                                        </label>

                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleInputChange}
                                            placeholder={
                                                form.status === "Maintenance"
                                                    ? "Enter maintenance reason..."
                                                    : "Describe the machine breakdown..."
                                            }
                                            rows="3"
                                            required
                                        />

                                    </div>
                                )}

                                {/* MAINTENANCE STAFF ASSIGNMENT */}
                                {form.status === "Maintenance" && (
                                    <div className="machine-form-group full-width">

                                        <label>
                                            Assign Maintenance Staff *
                                        </label>

                                        <select
                                            name="assigned_to"
                                            value={form.assigned_to}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">
                                                Select Maintenance Staff
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
                                )}

                            </div>

                            {/* MODAL ACTIONS */}
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
                                    disabled={
                                        saving ||
                                        (form.status === "Maintenance" && staff.length === 0)
                                    }
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Machine"
                                            : "Save Machine"
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

export default Machines;
