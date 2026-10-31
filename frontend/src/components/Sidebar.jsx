
import {
    LayoutDashboard,
    Factory,
    CalendarDays,
    AlertTriangle,
    Wrench,
    History,
    FileBarChart,
    Users,
    Settings,
    LogOut,
    ClipboardList
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role;

    const adminItems = [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Machines", path: "/machines", icon: Factory },
        { name: "Maintenance", path: "/maintenance", icon: CalendarDays },
        { name: "Breakdowns", path: "/breakdowns", icon: AlertTriangle },
        { name: "Repair Tracking", path: "/repairs", icon: Wrench },
        { name: "Machine History", path: "/history", icon: History },
        { name: "Reports", path: "/reports", icon: FileBarChart },
        { name: "Users", path: "/users", icon: Users }
    ];

    const staffItems = [
        { name: "Dashboard", path: "/staff-dashboard", icon: LayoutDashboard },
        { name: "My Maintenance", path: "/staff-maintenance", icon: CalendarDays },
        { name: "My Breakdowns", path: "/staff-breakdowns", icon: AlertTriangle },
        { name: "Work Logs", path: "/staff-work-logs", icon: ClipboardList }
    ];

    const operatorItems = [
        { name: "Dashboard", path: "/operator-dashboard", icon: LayoutDashboard },
        { name: "Machines", path: "/operator-machines", icon: Factory },
        { name: "Maintenance Status", path: "/operator-maintenance", icon: CalendarDays },
        { name: "Report Breakdown", path: "/operator-breakdowns", icon: AlertTriangle }
    ];

    const menuItems =
        role === "Admin"
            ? adminItems
            : role === "Maintenance Staff"
                ? staffItems
                : role === "Operator"
                    ? operatorItems
                    : [];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <Factory size={25} />
                </div>

                <div>
                    <h2>MMBMS</h2>
                    <span>Maintenance System</span>
                </div>
            </div>

            <div className="sidebar-label">MAIN MENU</div>

            <nav className="sidebar-menu">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end
                            className={({ isActive }) =>
                                isActive ? "menu-item active" : "menu-item"
                            }
                        >
                            <Icon size={19} />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-bottom">
                <div className="sidebar-label">PREFERENCES</div>

                <button
                    className="menu-item settings-item"
                    onClick={() => navigate("/settings")}
                >
                    <Settings size={19} />
                    <span>Settings</span>
                </button>

                <button
                    className="menu-item logout-item"
                    onClick={handleLogout}
                >
                    <LogOut size={19} />
                    <span>Logout</span>
                </button>

                <div className="sidebar-version">
                    MMBMS · Version 1.0
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
