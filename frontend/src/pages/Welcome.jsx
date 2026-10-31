
import { useNavigate } from "react-router-dom";
import {
    Factory,
    ShieldCheck,
    Wrench,
    ArrowRight
} from "lucide-react";

function Welcome() {
    const navigate = useNavigate();

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
                            <Wrench size={19} />
                            Efficient Maintenance Management
                        </div>
                    </div>
                </div>

                <div className="left-footer">
                    Machine Maintenance & Breakdown Management System
                </div>
            </div>

            <div className="login-right">
                <div className="login-card welcome-card">
                    <div className="mobile-brand">
                        <Factory size={28} />
                        <span>MMBMS</span>
                    </div>

                    <div className="login-heading">
                        <span>WELCOME TO MMBMS</span>
                        <h2>Get Started</h2>
                        <p>
                            Choose an option to access the platform.
                        </p>
                    </div>

                    <button
                        className="login-button"
                        onClick={() => navigate("/login")}
                    >
                        Login
                        <ArrowRight size={19} />
                    </button>

                    <button
                        className="welcome-signup-button"
                        onClick={() => navigate("/signup")}
                    >
                        Sign Up
                        <ArrowRight size={19} />
                    </button>

                    <div className="login-security">
                        <ShieldCheck size={17} />
                        Secure access to your industrial platform
                    </div>
                </div>

                <div className="right-footer">
                    © 2026 MMBMS. All rights reserved.
                </div>
            </div>
        </div>
    );
}

export default Welcome;
