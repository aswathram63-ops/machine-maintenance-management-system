
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../services/signupService";
import {
    Factory,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck
} from "lucide-react";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const data = await signupUser({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            setSuccess(data.message || "Registration successful!");

            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: ""
            });

            setTimeout(() => navigate("/login"), 1500);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to register. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-left">
                <div className="brand">
                    <div className="brand-icon">
                        <Factory size={27} />
                    </div>
                    <div>
                        <h2>MMBMS</h2>
                        <span>Industrial Care Platform</span>
                    </div>
                </div>

                <div className="hero-content">
                    <span className="hero-tag">
                        MACHINE MANAGEMENT SYSTEM
                    </span>

                    <h1>
                        Join Our Team.
                        <br />
                        <span>Keep Machines Running.</span>
                    </h1>

                    <p>
                        Register as a maintenance staff member and access
                        machine maintenance, breakdown tracking and repair
                        management features.
                    </p>

                    <div className="feature-list">
                        <div>
                            <ShieldCheck size={19} />
                            Secure Account Registration
                        </div>
                        <div>
                            <Factory size={19} />
                            Centralized Maintenance Platform
                        </div>
                    </div>
                </div>

                <div className="left-footer">
                    Machine Maintenance & Breakdown Management System
                </div>
            </div>

            <div className="login-right">
                <div className="login-card signup-card">

                    <div className="mobile-brand">
                        <Factory size={28} />
                        <span>MMBMS</span>
                    </div>

                    <div className="login-heading">
                        <span>CREATE ACCOUNT</span>
                        <h2>Sign up as Maintenance Staff</h2>
                        <p>
                            Enter your details to create your account.
                        </p>
                    </div>

                    <form onSubmit={handleSignup}>

                        <label>Full Name</label>
                        <div className="input-box">
                            <User size={19} />
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <label>Email Address</label>
                        <div className="input-box">
                            <Mail size={19} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <label>Password</label>
                        <div className="input-box">
                            <Lock size={19} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Minimum 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                                minLength="8"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ?
                                    <EyeOff size={19} /> :
                                    <Eye size={19} />
                                }
                            </button>
                        </div>

                        <label>Confirm Password</label>
                        <div className="input-box">
                            <Lock size={19} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                minLength="8"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ?
                                    <EyeOff size={19} /> :
                                    <Eye size={19} />
                                }
                            </button>
                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="settings-success">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                            {!loading && <ArrowRight size={19} />}
                        </button>

                    </form>

                    <p className="signup-login-link">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                    </p>

                    <div className="login-security">
                        <ShieldCheck size={17} />
                        Secure registration with encrypted passwords
                    </div>

                </div>

                <div className="right-footer">
                    © 2026 MMBMS. All rights reserved.
                </div>
            </div>

        </div>
    );
}

export default Signup;
