import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaLeaf,
    FaShieldAlt
} from "react-icons/fa";

import api from "../services/api";
import "../styles/login.css";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response = await api.post(
                "/auth/login",
                {
                    username: username.trim(),
                    password
                }
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(
                    response.data.user
                )
            );

            navigate("/dashboard");
        } catch (err) {
            console.error(
                "Login error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Invalid username or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-background-shape login-shape-one" />
            <div className="login-background-shape login-shape-two" />

            <div className="login-wrapper">
                <section className="login-brand-panel">
                    <div className="login-brand-content">
                        {/* <div className="login-brand-logo">
                            🐉
                        </div> */}

                        <div className="login-brand-badge">
                            <FaLeaf />
                            Farm Management System
                        </div>

                        <h1>
                            Shivalik
                            <span> Dragon Farm</span>
                        </h1>

                        <p>
                            Manage orders, customers,
                            payments and farm operations
                            from one secure dashboard.
                        </p>

                        <div className="login-brand-features">
                            <div>
                                <span>01</span>

                                <p>
                                    Track customer orders
                                    and payments
                                </p>
                            </div>

                            <div>
                                <span>02</span>

                                <p>
                                    Generate invoices and
                                    business reports
                                </p>
                            </div>

                            <div>
                                <span>03</span>

                                <p>
                                    Access order data securely
                                    from any device
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* <div className="login-brand-footer">
                        Shivalik Dragon Farm
                    </div> */}
                </section>

                <section className="login-form-panel">
                    <form
                        className="login-card"
                        onSubmit={handleLogin}
                    >
                        <div className="login-mobile-logo">
                            🐉
                        </div>

                        <div className="login-heading">
                            <div className="login-security-icon">
                                <FaShieldAlt />
                            </div>

                            <div>
                                <span>
                                    Secure Admin Portal
                                </span>

                                <h2>
                                    Welcome back
                                </h2>
                            </div>
                        </div>

                        <p className="login-subtitle">
                            Enter your account details to
                            access the dashboard.
                        </p>

                        {error && (
                            <div
                                className="login-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <div className="login-field">
                            <label htmlFor="username">
                                Username
                            </label>

                            <div className="login-input-wrapper">
                                <FaUser />

                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(event) =>
                                        setUsername(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="username"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="login-input-wrapper">
                                <FaLock />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="current-password"
                                    disabled={loading}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (current) =>
                                                !current
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <FaEyeSlash />
                                    ) : (
                                        <FaEye />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={loading}
                        >
                            {loading && (
                                <span className="login-spinner" />
                            )}

                            {loading
                                ? "Signing in..."
                                : "Login to Dashboard"}
                        </button>

                        <div className="login-security-note">
                            <FaLock />

                            <span>
                                Your account information is
                                securely protected.
                            </span>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default Login;