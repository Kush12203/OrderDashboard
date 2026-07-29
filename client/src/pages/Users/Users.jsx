import { useEffect, useMemo, useState } from "react";

import {
    FaPlus,
    FaSearch,
    FaTrash,
    FaKey,
    FaTimes,
    FaUserShield,
    FaUser
} from "react-icons/fa";

import {
    getUsers,
    createUser,
    updateUser,
    resetUserPassword,
    deleteUser
} from "../../services/userService";

import "./Users.css";

const emptyUserForm = {
    username: "",
    password: "",
    role: "user"
};

function Users() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [updatingId, setUpdatingId] =
        useState(null);

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [resetUser, setResetUser] =
        useState(null);

    const [deleteUserData, setDeleteUserData] =
        useState(null);

    const [userForm, setUserForm] =
        useState(emptyUserForm);

    const [newPassword, setNewPassword] =
        useState("");

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    const loggedInUser = useMemo(() => {
        try {
            return JSON.parse(
                localStorage.getItem("user")
            );
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timeout = setTimeout(() => {
            setSuccessMessage("");
        }, 2500);

        return () => clearTimeout(timeout);
    }, [successMessage]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getUsers();

            setUsers(response.data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        const searchText = search
            .trim()
            .toLowerCase();

        return users.filter((user) =>
            user.username
                ?.toLowerCase()
                .includes(searchText)
        );
    }, [users, search]);

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setUserForm((currentForm) => ({
            ...currentForm,
            [name]: value
        }));
    };

    const openAddModal = () => {
        setUserForm(emptyUserForm);
        setError("");
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        if (!saving) {
            setShowAddModal(false);
            setUserForm(emptyUserForm);
        }
    };

    const handleCreateUser = async (event) => {
        event.preventDefault();

        if (!userForm.username.trim()) {
            setError("Please enter a username.");
            return;
        }

        if (userForm.password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            await createUser({
                username:
                    userForm.username
                        .trim()
                        .toLowerCase(),

                password: userForm.password,
                role: userForm.role
            });

            setShowAddModal(false);
            setUserForm(emptyUserForm);

            setSuccessMessage(
                "User created successfully."
            );

            await loadUsers();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to create user."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleRoleChange = async (
        user,
        role
    ) => {
        try {
            setUpdatingId(user._id);
            setError("");

            const response = await updateUser(
                user._id,
                {
                    role
                }
            );

            setUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser._id === user._id
                        ? {
                              ...currentUser,
                              ...response.data
                          }
                        : currentUser
                )
            );

            setSuccessMessage(
                "User role updated successfully."
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to update user role."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleActiveChange = async (
        user,
        isActive
    ) => {
        try {
            setUpdatingId(user._id);
            setError("");

            const response = await updateUser(
                user._id,
                {
                    isActive
                }
            );

            setUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser._id === user._id
                        ? {
                              ...currentUser,
                              ...response.data
                          }
                        : currentUser
                )
            );

            setSuccessMessage(
                isActive
                    ? "User activated successfully."
                    : "User deactivated successfully."
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to update user status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const openResetModal = (user) => {
        setResetUser(user);
        setNewPassword("");
        setError("");
    };

    const closeResetModal = () => {
        if (!saving) {
            setResetUser(null);
            setNewPassword("");
        }
    };

    const handleResetPassword = async (
        event
    ) => {
        event.preventDefault();

        if (!resetUser) {
            return;
        }

        if (newPassword.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            await resetUserPassword(
                resetUser._id,
                newPassword
            );

            setResetUser(null);
            setNewPassword("");

            setSuccessMessage(
                "Password reset successfully."
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to reset password."
            );
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (user) => {
        setDeleteUserData(user);
        setError("");
    };

    const closeDeleteModal = () => {
        if (!saving) {
            setDeleteUserData(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteUserData) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            await deleteUser(deleteUserData._id);

            setUsers((currentUsers) =>
                currentUsers.filter(
                    (user) =>
                        user._id !==
                        deleteUserData._id
                )
            );

            setDeleteUserData(null);

            setSuccessMessage(
                "User deleted successfully."
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to delete user."
            );
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (value) => {
        if (!value) {
            return "-";
        }

        return new Date(value).toLocaleDateString(
            "en-GB"
        );
    };

    const isCurrentUser = (user) => {
        return (
            loggedInUser?.id === user._id ||
            loggedInUser?.username ===
                user.username
        );
    };

    return (
        <>
            <div className="users-page">
                <div className="users-header">
                    <div>
                        <h1>User Management</h1>

                        <p>
                            Add and manage dashboard
                            users.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="add-user-btn"
                        onClick={openAddModal}
                    >
                        <FaPlus />
                        Add User
                    </button>
                </div>

                {successMessage && (
                    <div className="users-success">
                        {successMessage}
                    </div>
                )}

                {error && !showAddModal &&
                    !resetUser &&
                    !deleteUserData && (
                        <div className="users-error">
                            {error}
                        </div>
                    )}

                <div className="users-search">
                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search username..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div className="users-table-card">
                    {loading ? (
                        <div className="users-loading">
                            Loading users...
                        </div>
                    ) : (
                        <div className="users-table-wrapper">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredUsers.length ===
                                    0 ? (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="users-empty"
                                            >
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map(
                                            (user) => (
                                                <tr
                                                    key={
                                                        user._id
                                                    }
                                                >
                                                    <td>
                                                        <div className="user-profile-cell">
                                                            <div
                                                                className={
                                                                    user.role ===
                                                                    "admin"
                                                                        ? "user-avatar admin-avatar"
                                                                        : "user-avatar"
                                                                }
                                                            >
                                                                {user.role ===
                                                                "admin" ? (
                                                                    <FaUserShield />
                                                                ) : (
                                                                    <FaUser />
                                                                )}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {
                                                                        user.username
                                                                    }
                                                                </strong>

                                                                {isCurrentUser(
                                                                    user
                                                                ) && (
                                                                    <span>
                                                                        Current
                                                                        account
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <select
                                                            className="user-role-select"
                                                            value={
                                                                user.role
                                                            }
                                                            disabled={
                                                                updatingId ===
                                                                    user._id ||
                                                                isCurrentUser(
                                                                    user
                                                                )
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleRoleChange(
                                                                    user,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <option value="user">
                                                                User
                                                            </option>

                                                            <option value="admin">
                                                                Admin
                                                            </option>
                                                        </select>
                                                    </td>

                                                    <td>
                                                        <label className="user-status-toggle">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    user.isActive !==
                                                                    false
                                                                }
                                                                disabled={
                                                                    updatingId ===
                                                                        user._id ||
                                                                    isCurrentUser(
                                                                        user
                                                                    )
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleActiveChange(
                                                                        user,
                                                                        event
                                                                            .target
                                                                            .checked
                                                                    )
                                                                }
                                                            />

                                                            <span className="toggle-track">
                                                                <span className="toggle-thumb" />
                                                            </span>

                                                            <span
                                                                className={
                                                                    user.isActive !==
                                                                    false
                                                                        ? "active-user-text"
                                                                        : "inactive-user-text"
                                                                }
                                                            >
                                                                {user.isActive !==
                                                                false
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </span>
                                                        </label>
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            user.createdAt
                                                        )}
                                                    </td>

                                                    <td>
                                                        <div className="user-actions">
                                                            <button
                                                                type="button"
                                                                className="user-action-btn password-btn"
                                                                title="Reset password"
                                                                onClick={() =>
                                                                    openResetModal(
                                                                        user
                                                                    )
                                                                }
                                                            >
                                                                <FaKey />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="user-action-btn user-delete-btn"
                                                                title="Delete user"
                                                                disabled={isCurrentUser(
                                                                    user
                                                                )}
                                                                onClick={() =>
                                                                    openDeleteModal(
                                                                        user
                                                                    )
                                                                }
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <div
                    className="user-modal-overlay"
                    onMouseDown={closeAddModal}
                >
                    <div
                        className="user-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="user-modal-header">
                            <div>
                                <h2>Add New User</h2>

                                <p>
                                    Create login credentials
                                    for a dashboard user.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="user-modal-close"
                                onClick={closeAddModal}
                                disabled={saving}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {error && (
                            <div className="user-modal-error">
                                {error}
                            </div>
                        )}

                        <form
                            className="user-form"
                            onSubmit={handleCreateUser}
                        >
                            <div className="user-form-group">
                                <label htmlFor="new-username">
                                    Username
                                </label>

                                <input
                                    id="new-username"
                                    type="text"
                                    name="username"
                                    placeholder="Enter username"
                                    value={
                                        userForm.username
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    autoComplete="off"
                                    required
                                />
                            </div>

                            <div className="user-form-group">
                                <label htmlFor="new-password">
                                    Password
                                </label>

                                <input
                                    id="new-password"
                                    type="password"
                                    name="password"
                                    placeholder="Minimum 6 characters"
                                    value={
                                        userForm.password
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="user-form-group">
                                <label htmlFor="new-role">
                                    Role
                                </label>

                                <select
                                    id="new-role"
                                    name="role"
                                    value={userForm.role}
                                    onChange={
                                        handleFormChange
                                    }
                                >
                                    <option value="user">
                                        User
                                    </option>

                                    <option value="admin">
                                        Admin
                                    </option>
                                </select>
                            </div>

                            <div className="user-modal-actions">
                                <button
                                    type="button"
                                    className="user-cancel-btn"
                                    onClick={closeAddModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="user-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {resetUser && (
                <div
                    className="user-modal-overlay"
                    onMouseDown={closeResetModal}
                >
                    <div
                        className="user-modal small-user-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="user-modal-header">
                            <div>
                                <h2>Reset Password</h2>

                                <p>
                                    Set a new password for{" "}
                                    <strong>
                                        {resetUser.username}
                                    </strong>
                                    .
                                </p>
                            </div>

                            <button
                                type="button"
                                className="user-modal-close"
                                onClick={closeResetModal}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {error && (
                            <div className="user-modal-error">
                                {error}
                            </div>
                        )}

                        <form
                            className="user-form"
                            onSubmit={
                                handleResetPassword
                            }
                        >
                            <div className="user-form-group">
                                <label htmlFor="reset-password">
                                    New Password
                                </label>

                                <input
                                    id="reset-password"
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(
                                            event.target
                                                .value
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="user-modal-actions">
                                <button
                                    type="button"
                                    className="user-cancel-btn"
                                    onClick={closeResetModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="user-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Updating..."
                                        : "Reset Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteUserData && (
                <div
                    className="user-modal-overlay"
                    onMouseDown={closeDeleteModal}
                >
                    <div
                        className="user-delete-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="user-delete-icon">
                            <FaTrash />
                        </div>

                        <h2>Delete User?</h2>

                        <p>
                            This will permanently delete{" "}
                            <strong>
                                {deleteUserData.username}
                            </strong>
                            .
                        </p>

                        {error && (
                            <div className="user-modal-error">
                                {error}
                            </div>
                        )}

                        <div className="user-delete-actions">
                            <button
                                type="button"
                                className="user-cancel-btn"
                                onClick={closeDeleteModal}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="confirm-user-delete-btn"
                                onClick={handleDeleteUser}
                                disabled={saving}
                            >
                                {saving
                                    ? "Deleting..."
                                    : "Delete User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Users;