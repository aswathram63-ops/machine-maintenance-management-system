
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function AdminLayout({ children }) {
    return (
        <div className="admin-layout">
            <Sidebar />

            <div className="main-section">
                <Header />

                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
