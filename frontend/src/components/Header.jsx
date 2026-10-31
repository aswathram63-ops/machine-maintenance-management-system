
import { Bell, Search, UserCircle } from "lucide-react";

function Header() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <header className="dashboard-header">
            <div className="header-search">
                <Search size={19} />
                <input
                    type="text"
                    placeholder="Search machines, breakdowns..."
                    disabled={false}
                />
            </div>

            <div className="header-right">
                <button
                    className="notification-button"
                    aria-label="Notifications"
                >
                    <Bell size={21} />
                    <span className="notification-dot"></span>
                </button>

                <div className="header-divider"></div>

                <div className="header-profile">
                    <UserCircle size={36} />
                    <div>
                        <strong>{user.name || "Admin"}</strong>
                        <span>{user.role || "Administrator"}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
