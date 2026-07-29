import {
    FaHome,
    FaTable,
    FaMoneyBillWave,
    FaUsers,
    FaFileAlt,
    FaSeedling
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

function Sidebar() {
    const navigationItems = [
        {
            path: "/dashboard",
            label: "Dashboard",
            icon: <FaHome />
        },
        {
            path: "/orders",
            label: "Orders",
            icon: <FaTable />
        },
        {
            path: "/payments",
            label: "Payments",
            icon: <FaMoneyBillWave />
        },
        {
            path: "/customers",
            label: "Customers",
            icon: <FaUsers />
        },
        {
            path: "/reports",
            label: "Reports",
            icon: <FaFileAlt />
        },
        {
            path: "/users",
            label: "Users",
            icon: <FaUsers />
        }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <FaSeedling />
                </div>

                <div className="sidebar-brand-text">
                    <strong>Shivalik</strong>
                    <span>Dragon Farm</span>
                </div>
            </div>

            <div className="sidebar-label">
                Farm Management
            </div>

            <nav className="sidebar-navigation">
                {navigationItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive
                                ? "sidebar-link active"
                                : "sidebar-link"
                        }
                    >
                        <span className="sidebar-link-icon">
                            {item.icon}
                        </span>

                        <span className="sidebar-link-text">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            {/* <div className="sidebar-footer">
                <div className="sidebar-footer-icon">
                    <FaSeedling />
                </div>

                <div>
                    <strong>Farm Portal</strong>
                    <span>Secure management system</span>
                </div>
            </div> */}
        </aside>
    );
}

export default Sidebar;