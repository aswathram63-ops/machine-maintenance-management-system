
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StaffDashboard from "./pages/StaffDashboard";

import Machines from "./pages/Machines.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import Breakdowns from "./pages/Breakdowns.jsx";
import WorkLogs from "./pages/WorkLogs.jsx";
import Users from "./pages/Users.jsx";
import MachineHistory from "./pages/MachineHistory.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings";
import Welcome from "./pages/Welcome";
import Signup from "./pages/Signup";
import StaffMaintenance from "./pages/StaffMaintenance";
import StaffBreakdowns from "./pages/StaffBreakdowns";
import StaffWorkLogs from "./pages/StaffWorkLogs";
import OperatorDashboard from "./pages/OperatorDashboard";
import OperatorMachines from "./pages/OperatorMachines";
import OperatorMaintenance from "./pages/OperatorMaintenance";
import OperatorBreakdowns from "./pages/OperatorBreakdowns";

import "./App.css";

// Get dashboard according to role
function getDashboard(role) {
    switch (role) {
        case "Admin":
            return "/dashboard";

        case "Maintenance Staff":
            return "/staff-dashboard";

        case "Operator":
            return "/operator-dashboard";

        default:
            return "/";
    }
}

// Role-based protected route
function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch {
        user = null;
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return (
            <Navigate
                to={getDashboard(user.role)}
                replace
            />
        );
    }

    return children;
}

// Temporary dashboard placeholder
function PlaceholderPage({ title, description }) {
    return (
        <div className="placeholder-page">
            <h1>{title}</h1>
            <p>{description}</p>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* PUBLIC ROUTES */}

                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />


                {/* ADMIN ROUTES */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/machines"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <Machines />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/maintenance"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <Maintenance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/breakdowns"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <Breakdowns />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/repairs"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <WorkLogs />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/history"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <MachineHistory />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <Reports />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <Users />
                        </ProtectedRoute>
                    }
                />


                {/* MAINTENANCE STAFF ROUTES */}

                <Route
                    path="/staff-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["Maintenance Staff"]}>
                            <StaffDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/staff-maintenance"
                    element={
                        <ProtectedRoute allowedRoles={["Maintenance Staff"]}>
                            <StaffMaintenance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/staff-breakdowns"
                    element={
                        <ProtectedRoute allowedRoles={["Maintenance Staff"]}>
                            <StaffBreakdowns />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/staff-work-logs"
                    element={
                        <ProtectedRoute allowedRoles={["Maintenance Staff"]}>
                            <StaffWorkLogs />
                        </ProtectedRoute>
                    }
                />

                {/* OPERATOR DASHBOARD */}

                <Route
                    path="/operator-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["Operator"]}>
                                <OperatorDashboard/>
                        </ProtectedRoute>
                    }
                />

                <Route
    path="/operator-machines"
    element={
        <ProtectedRoute allowedRoles={["Operator"]}>
            <OperatorMachines />
        </ProtectedRoute>
    }
/>

<Route
    path="/operator-breakdowns"
    element={
        <ProtectedRoute allowedRoles={["Operator"]}>
            <OperatorBreakdowns />
        </ProtectedRoute>
    }
/>

<Route
    path="/operator-maintenance"
    element={
        <ProtectedRoute allowedRoles={["Operator"]}>
            <OperatorMaintenance />
        </ProtectedRoute>
    }
/>


                {/* SETTINGS */}

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "Admin",
                                "Maintenance Staff",
                                "Operator"
                            ]}
                        >
                            <Settings />
                        </ProtectedRoute>
                    }
                />


                {/* UNKNOWN ROUTES */}

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
