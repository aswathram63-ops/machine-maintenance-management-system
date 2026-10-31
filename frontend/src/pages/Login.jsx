
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

import {
    Factory,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck
} from "lucide-react";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await loginUser(email, password);

            // Get logged-in user's role
            const role = data.user?.role;

            // Decide dashboard based on role
            let dashboard;

            switch (role) {
                case "Admin":
                    dashboard = "/dashboard";
                    break;

                case "Maintenance Staff":
                    dashboard = "/staff-dashboard";
                    break;

                case "Operator":
                    dashboard = "/operator-dashboard";
                    break;

                default:
                    throw new Error("Invalid user role. Contact administrator.");
            }

            // Store authentication details
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect based on role
            navigate(dashboard, { replace: true });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to connect to the server."
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
                        Smarter Maintenance.
                        <br />
                        <span>Better Performance.</span>
                    </h1>

                    <p>
                        Monitor machines, schedule preventive maintenance,
                        manage breakdowns and keep your operations running
                        smoothly — all in one place.
                    </p>

                    <div className="feature-list">

                        <div>
                            <ShieldCheck size={19} />
                            Secure Role-Based Access
                        </div>

                        <div>
                            <Factory size={19} />
                            Centralized Machine Management
                        </div>

                    </div>

                </div>

                <div className="left-footer">
                    Machine Maintenance & Breakdown Management System
                </div>

            </div>

            <div className="login-right">

                <div className="login-card">

                    <div className="mobile-brand">
                        <Factory size={28} />
                        <span>MMBMS</span>
                    </div>

                    <div className="login-heading">
                        <span>WELCOME BACK</span>
                        <h2>Sign in to your account</h2>

                        <p>
                            Enter your credentials to access the platform.
                        </p>
                    </div>

                    <form onSubmit={handleLogin}>

                        <label>Email Address</label>

                        <div className="input-box">
                            <Mail size={19} />

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <label>Password</label>

                        <div className="input-box">
                            <Lock size={19} />

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword
                                    ? <EyeOff size={19} />
                                    : <Eye size={19} />
                                }
                            </button>
                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}

                            {!loading && <ArrowRight size={19} />}
                        </button>

                    </form>

                    <div className="login-security">
                        <ShieldCheck size={17} />
                        Protected with secure authentication
                    </div>

                </div>

                <div className="right-footer">
                    © 2026 MMBMS. All rights reserved.
                </div>

            </div>

        </div>
    );
}

export default Login;
