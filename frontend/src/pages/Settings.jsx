
import { useEffect, useState } from "react";
import {
    getProfile,
    updateProfile,
    changePassword
} from "../services/settingsService";

function Settings() {
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        role: "",
        is_active: 0,
        created_at: ""
    });

    const [profileForm, setProfileForm] = useState({
        name: "",
        email: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            const user = response.data.data;

            setProfile(user);
            setProfileForm({
                name: user.name,
                email: user.email
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load profile information."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleProfileChange = (e) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            await updateProfile(profileForm);
            setMessage("Profile updated successfully!");
            await fetchProfile();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update profile."
            );
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setError("New password must contain at least 8 characters.");
            return;
        }

        try {
            await changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            setMessage("Password changed successfully!");

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to change password."
            );
        }
    };

    if (loading) {
        return <div className="page-container">Loading settings...</div>;
    }

    return (
        <div className="page-container settings-page">
            <div className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your account information and security.</p>
                </div>
            </div>

            {message && <div className="settings-success">{message}</div>}
            {error && <div className="settings-error">{error}</div>}

            {/* Profile Information */}
            <section className="settings-card">
                <div className="settings-card-header">
                    <h2>Profile Information</h2>
                    <p>Your account details</p>
                </div>

                <div className="settings-profile-details">
                    <div>
                        <span>Full Name</span>
                        <strong>{profile.name}</strong>
                    </div>

                    <div>
                        <span>Email Address</span>
                        <strong>{profile.email}</strong>
                    </div>

                    <div>
                        <span>Role</span>
                        <strong>{profile.role}</strong>
                    </div>

                    <div>
                        <span>Account Status</span>
                        <strong className={profile.is_active ? "status-active" : "status-inactive"}>
                            {profile.is_active ? "Active" : "Inactive"}
                        </strong>
                    </div>

                    <div>
                        <span>Member Since</span>
                        <strong>
                            {profile.created_at
                                ? new Date(profile.created_at).toLocaleDateString()
                                : "Not available"}
                        </strong>
                    </div>
                </div>
            </section>

            {/* Edit Profile */}
            <section className="settings-card">
                <div className="settings-card-header">
                    <h2>Edit Profile</h2>
                    <p>Update your personal information.</p>
                </div>

                <form onSubmit={handleProfileSubmit}>
                    <div className="settings-form-grid">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profileForm.name}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={profileForm.email}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="settings-button">
                        Save Changes
                    </button>
                </form>
            </section>

            {/* Change Password */}
            <section className="settings-card">
                <div className="settings-card-header">
                    <h2>Change Password</h2>
                    <p>Keep your account secure with a strong password.</p>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                    <div className="settings-form-grid">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                minLength="8"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                minLength="8"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="settings-button">
                        Update Password
                    </button>
                </form>
            </section>
        </div>
    );
}

export default Settings;
