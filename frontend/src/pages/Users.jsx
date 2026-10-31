import { useEffect, useState } from "react";
import {
    getUsers,
    createUser,
    updateUser,
    updateUserStatus
} from "../services/userService";

function Users() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const initialForm = {
        name: "",
        email: "",
        password: "",
        role: "Operator"
    };

    const [formData, setFormData] = useState(initialForm);

    // Fetch users
   const fetchUsers = async () => {
    try {
        const response = await getUsers({
            search,
            role: roleFilter
        });

        console.log("USER API RESPONSE:", response.data);

        setUsers(
            Array.isArray(response.data.data)
                ? response.data.data
                : []
        );
    } catch (err) {
        console.error("USER API ERROR:", err);
        setError(
            err.response?.data?.message || "Failed to load users"
        );
    }
};

    useEffect(() => {
        fetchUsers();
    }, [search, roleFilter]);

    // Form input handling
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Open Add User modal
    const handleAdd = () => {
        setEditId(null);
        setFormData(initialForm);
        setError("");
        setShowModal(true);
    };

    // Open Edit User modal
    const handleEdit = (user) => {
        setEditId(user.user_id);

        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role
        });

        setError("");
        setShowModal(true);
    };

    // Submit Add / Edit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (editId) {
                const { password, ...updateData } = formData;
                await updateUser(editId, updateData);
            } else {
                await createUser(formData);
            }

            setShowModal(false);
            setFormData(initialForm);
            fetchUsers();
        } catch (err) {
            setError(
                err.response?.data?.message || "Operation failed"
            );
        } finally {
            setLoading(false);
        }
    };

    // Activate / Deactivate user
    const handleStatus = async (user) => {
        const newStatus = !Boolean(user.is_active);

        const confirmAction = window.confirm(
            `Are you sure you want to ${newStatus ? "activate" : "deactivate"} this user?`
        );

        if (!confirmAction) return;

        try {
            await updateUserStatus(user.user_id, newStatus);
            fetchUsers();
        } catch (err) {
            alert(
                err.response?.data?.message || "Status update failed"
            );
        }
    };

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage system users, roles and account access.</p>
                </div>

                <button className="primary-btn" onClick={handleAdd}>
                    + Add User
                </button>
            </div>

            {/* User Statistics */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <h2>{users.length}</h2>
                </div>

                <div className="stat-card">
                    <h3>Active Users</h3>
                    <h2>
                        {users.filter(user => Boolean(user.is_active)).length}
                    </h2>
                </div>

                <div className="stat-card">
                    <h3>Inactive Users</h3>
                    <h2>
                        {users.filter(user => !Boolean(user.is_active)).length}
                    </h2>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="table-card">

                <div className="table-toolbar">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Maintenance Staff">
                            Maintenance Staff
                        </option>
                        <option value="Operator">Operator</option>
                    </select>
                </div>

                {error && !showModal && (
                    <p className="error-message">{error}</p>
                )}

                <div className="table-responsive">
                    <table className="machine-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.length > 0 ? (
                                users.map(user => (
                                    <tr key={user.user_id}>
                                        <td>#{user.user_id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>

                                        <td>
                                            <span className={`status-badge ${
                                                Boolean(user.is_active)
                                                    ? "status-operational"
                                                    : "status-breakdown"
                                            }`}>
                                                {Boolean(user.is_active)
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleStatus(user)}
                                                >
                                                    {Boolean(user.is_active)
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit User Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">

                        <h2>
                            {editId ? "Edit User" : "Add New User"}
                        </h2>

                        <form onSubmit={handleSubmit}>

                            <div className="machine-form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="machine-form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {!editId && (
                                <div className="machine-form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        minLength="8"
                                        required
                                    />
                                </div>
                            )}

                            <div className="machine-form-group">
                                <label>Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Maintenance Staff">
                                        Maintenance Staff
                                    </option>
                                    <option value="Operator">Operator</option>
                                </select>
                            </div>

                            {error && (
                                <p className="error-message">{error}</p>
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
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Saving..."
                                        : editId
                                            ? "Update User"
                                            : "Create User"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Users;