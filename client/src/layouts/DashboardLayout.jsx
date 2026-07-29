import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "../pages/Dashboard/Dashboard.css";

function DashboardLayout() {
    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-main">
                <Navbar />

                <div className="dashboard-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;