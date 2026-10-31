
import { useEffect, useState } from "react";
import { getMachines } from "../services/machineService";
import { getMachineHistory } from "../services/machineHistoryService";

function MachineHistory() {
    const [machines, setMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState("");
    const [history, setHistory] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Load machine list
    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const response = await getMachines();

                setMachines(
                    Array.isArray(response.machines)
                        ? response.machines
                        : []
                );
            } catch (err) {
                console.error("Machine loading error:", err);
                setError("Failed to load machines");
            }
        };

        fetchMachines();
    }, []);

    // Load selected machine history
    const handleMachineChange = async (e) => {
        const machineId = e.target.value;

        setSelectedMachine(machineId);
        setHistory(null);
        setError("");

        if (!machineId) return;

        setLoading(true);

        try {
            const response = await getMachineHistory(machineId);
            setHistory(response.data.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load machine history"
            );
        } finally {
            setLoading(false);
        }
    };

    const machine = history?.machine;

    return (
        <div className="page-container">

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Machine History</h1>
                    <p>
                        View complete maintenance, breakdown and repair history.
                    </p>
                </div>
            </div>

            {/* Machine Selection */}
            <div className="history-select-card">
                <div className="machine-form-group">
                    <label>Select Machine</label>

                    <select
                        value={selectedMachine}
                        onChange={handleMachineChange}
                    >
                        <option value="">Choose a machine</option>

                        {machines.map((item) => (
                            <option
                                key={item.machine_id}
                                value={item.machine_id}
                            >
                                {item.machine_code} - {item.machine_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <p className="error-message">{error}</p>
            )}

            {loading && (
                <p>Loading machine history...</p>
            )}

            {/* Machine Details */}
            {machine && !loading && (
                <>

                    {/* Machine Information Cards */}
                    <div className="history-machine-details">
                        <h2>Machine Information</h2>

                        <div className="history-machine-info">

                            <div className="history-info-card">
                                <h3>Machine Code</h3>
                                <h2>{machine.machine_code}</h2>
                            </div>

                            <div className="history-info-card">
                                <h3>Machine Name</h3>
                                <h2>{machine.machine_name}</h2>
                            </div>

                            <div className="history-info-card">
                                <h3>Machine Type</h3>
                                <h2>{machine.machine_type || "N/A"}</h2>
                            </div>

                            <div className="history-info-card">
                                <h3>Current Status</h3>
                                <h2>{machine.status}</h2>
                            </div>

                        </div>

                        <p>
                            <strong>Location:</strong>{" "}
                            {machine.location || "N/A"}
                        </p>
                    </div>

                    {/* Maintenance History */}
                    <div className="history-section">
                        <h2>Maintenance History</h2>

                        <div className="table-responsive">
                            <table className="machine-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Assigned Staff</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {history.maintenance.length > 0 ? (
                                        history.maintenance.map((item) => (
                                            <tr key={item.maintenance_id}>
                                                <td>#{item.maintenance_id}</td>
                                                <td>
                                                    {new Date(
                                                        item.maintenance_date
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td>{item.description || "N/A"}</td>
                                                <td>
                                                    {item.assigned_staff || "Not Assigned"}
                                                </td>
                                                <td>{item.status}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="history-empty">
                                                No maintenance records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Breakdown History */}
                    <div className="history-section">
                        <h2>Breakdown History</h2>

                        <div className="table-responsive">
                            <table className="machine-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Description</th>
                                        <th>Priority</th>
                                        <th>Reported By</th>
                                        <th>Assigned Staff</th>
                                        <th>Status</th>
                                        <th>Reported Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {history.breakdowns.length > 0 ? (
                                        history.breakdowns.map((item) => (
                                            <tr key={item.breakdown_id}>
                                                <td>#{item.breakdown_id}</td>
                                                <td>{item.description}</td>
                                                <td>{item.priority}</td>
                                                <td>{item.reported_by}</td>
                                                <td>
                                                    {item.assigned_staff || "Not Assigned"}
                                                </td>
                                                <td>{item.status}</td>
                                                <td>
                                                    {new Date(
                                                        item.reported_at
                                                    ).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="history-empty">
                                                No breakdown records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Repair / Work Log History */}
                    <div className="history-section">
                        <h2>Repair / Work Log History</h2>

                        <div className="table-responsive">
                            <table className="machine-table">
                                <thead>
                                    <tr>
                                        <th>Log ID</th>
                                        <th>Breakdown ID</th>
                                        <th>Work Description</th>
                                        <th>Staff</th>
                                        <th>Log Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {history.workLogs.length > 0 ? (
                                        history.workLogs.map((item) => (
                                            <tr key={item.log_id}>
                                                <td>#{item.log_id}</td>
                                                <td>#{item.breakdown_id}</td>
                                                <td>{item.work_description}</td>
                                                <td>{item.staff_name}</td>
                                                <td>
                                                    {new Date(
                                                        item.log_date
                                                    ).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="history-empty">
                                                No repair logs found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </>
            )}

            {/* Initial Empty State */}
            {!selectedMachine && !loading && (
                <div className="history-section">
                    <p className="history-empty">
                        Select a machine above to view its complete history.
                    </p>
                </div>
            )}

        </div>
    );
}

export default MachineHistory;
