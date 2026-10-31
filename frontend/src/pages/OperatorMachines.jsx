
import { useEffect, useState } from "react";
import {
    Search,
    Factory,
    RefreshCw,
    MapPin,
    Eye,
    X
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import {
    getMachines,
    getMachineById
} from "../services/machineService";

function OperatorMachines() {
    const [machines, setMachines] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

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
        fetchMachines();
    }, [search, statusFilter]);

    const viewDetails = async (id) => {
        try {
            setDetailsLoading(true);
            setSelectedMachine(null);

            const result = await getMachineById(id);

            setSelectedMachine(
                result.machine || result.data || result
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load machine details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

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

    const operational = machines.filter(
        m => m.status === "Operational"
    ).length;

    const maintenance = machines.filter(
        m => m.status === "Maintenance"
    ).length;

    const breakdown = machines.filter(
        m => m.status === "Breakdown"
    ).length;

    return (
        <AdminLayout>
            <div className="page-heading">
                <div>
                    <span className="page-eyebrow">
                        MACHINE OVERVIEW
                    </span>
                    <h1>Machines</h1>
                    <p>
                        View registered machines and monitor their current status.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={fetchMachines}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="machine-error">
                    {error}
                    <button onClick={() => setError("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="machine-summary-grid">
                <div className="machine-summary-card">
                    <span>Total Machines</span>
                    <h2>{machines.length}</h2>
                </div>

                <div className="machine-summary-card">
                    <span>Operational</span>
                    <h2 className="text-green">{operational}</h2>
                </div>

                <div className="machine-summary-card">
                    <span>Maintenance</span>
                    <h2 className="text-orange">{maintenance}</h2>
                </div>

                <div className="machine-summary-card">
                    <span>Breakdown</span>
                    <h2 className="text-red">{breakdown}</h2>
                </div>
            </div>

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
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Operational">Operational</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Breakdown">Breakdown</option>
                    </select>
                </div>

                <div className="machine-table-heading">
                    <div>
                        <h3>Registered Machines</h3>
                        <p>View machine information and status.</p>
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
                                <th>Details</th>
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
                                machines.map(machine => (
                                    <tr key={machine.machine_id}>
                                        <td>
                                            <strong>{machine.machine_code}</strong>
                                        </td>
                                        <td>
                                            <strong>{machine.machine_name}</strong>
                                        </td>
                                        <td>{machine.machine_type || "—"}</td>
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
                                            <button
                                                className="edit-action"
                                                title="View machine details"
                                                onClick={() => viewDetails(machine.machine_id)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {detailsLoading && (
                <div className="machine-modal-overlay">
                    <div className="machine-modal">
                        Loading machine details...
                    </div>
                </div>
            )}

            {selectedMachine && (
                <div
                    className="machine-modal-overlay"
                    onClick={() => setSelectedMachine(null)}
                >
                    <div
                        className="machine-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="machine-modal-header">
                            <div>
                                <h2>Machine Details</h2>
                                <p>Machine information</p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setSelectedMachine(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="machine-form-grid">
                            <div className="machine-form-group">
                                <label>Machine Code</label>
                                <strong>{selectedMachine.machine_code || "—"}</strong>
                            </div>

                            <div className="machine-form-group">
                                <label>Machine Name</label>
                                <strong>{selectedMachine.machine_name || "—"}</strong>
                            </div>

                            <div className="machine-form-group">
                                <label>Machine Type</label>
                                <strong>{selectedMachine.machine_type || "—"}</strong>
                            </div>

                            <div className="machine-form-group">
                                <label>Location</label>
                                <strong>{selectedMachine.location || "—"}</strong>
                            </div>

                            <div className="machine-form-group full-width">
                                <label>Current Status</label>
                                <span className={`machine-status ${getStatusClass(selectedMachine.status)}`}>
                                    {selectedMachine.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default OperatorMachines;
