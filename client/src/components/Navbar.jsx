import {
    FaChevronDown,
    FaSignOutAlt,
    FaUser
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    let user = null;

    try {
        user = JSON.parse(
            localStorage.getItem("user")
        );
    } catch (error) {
        console.error(
            "Unable to read logged-in user:",
            error
        );
    }

    const username =
        user?.username || "Admin";

    const firstLetter =
        username.charAt(0).toUpperCase();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/", {
            replace: true
        });
    };

    return (
        <header className="navbar">
            <div className="navbar-welcome">
                {/* <span className="navbar-eyebrow">
                    Farm Management Portal
                </span> */}

                <h3>
                    Welcome back,{" "}
                    <strong>{username}</strong>
                </h3>
            </div>

            <div className="navbar-actions">
                <div className="navbar-profile">
                    <div className="navbar-avatar">
                        {firstLetter || <FaUser />}
                    </div>

                    <div className="navbar-user-details">
                        <strong>{username}</strong>
                        <span>Administrator</span>
                    </div>

                    <FaChevronDown className="navbar-chevron" />
                </div>

                <button
                    type="button"
                    className="navbar-logout-btn"
                    onClick={logout}
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
}

export default Navbar;