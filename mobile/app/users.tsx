import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

import api from "../services/api";

type UserRole = "admin" | "user";

type User = {
    _id: string;
    username: string;
    role: UserRole;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
};

type CurrentUser = {
    _id?: string;
    id?: string;
    username?: string;
    role?: string;
};

type EditType =
    | "role"
    | "status"
    | "password"
    | null;

export default function Users() {
    const router = useRouter();

    const [users, setUsers] =
        useState<User[]>([]);

    const [currentUser, setCurrentUser] =
        useState<CurrentUser | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [
        createModalOpen,
        setCreateModalOpen,
    ] = useState(false);

    const [
        selectedUser,
        setSelectedUser,
    ] = useState<User | null>(null);

    const [editType, setEditType] =
        useState<EditType>(null);

    const [saving, setSaving] =
        useState(false);

    // Add user
    const [newUsername, setNewUsername] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [newRole, setNewRole] =
        useState<UserRole>("user");

    // Reset password
    const [
        resetPassword,
        setResetPassword,
    ] = useState("");

    // =========================
    // CURRENT USER
    // =========================

    const loadCurrentUser = async () => {
        try {
            const storedUser =
                await SecureStore.getItemAsync(
                    "user"
                );

            if (storedUser) {
                setCurrentUser(
                    JSON.parse(storedUser)
                );
            }
        } catch (error) {
            console.error(
                "Current user error:",
                error
            );
        }
    };

    // =========================
    // GET USERS
    // =========================

    const loadUsers = async (
        refresh = false
    ) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response =
                await api.get("/users");

            setUsers(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error: any) {
            console.error(
                "Users load error:",
                error.response?.data ||
                    error
            );

            if (
                error.response?.status === 403
            ) {
                Alert.alert(
                    "Access Denied",
                    "Only administrators can manage users.",
                    [
                        {
                            text: "Back",
                            onPress: () =>
                                router.back(),
                        },
                    ]
                );

                return;
            }

            Alert.alert(
                "Unable to Load Users",
                error.response?.data?.message ||
                    "Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadCurrentUser();
        loadUsers();
    }, []);

    const onRefresh =
        useCallback(() => {
            loadUsers(true);
        }, []);

    // =========================
    // SEARCH
    // =========================

    const filteredUsers =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return users;
            }

            return users.filter(
                (user) =>
                    user.username
                        .toLowerCase()
                        .includes(query) ||
                    user.role
                        .toLowerCase()
                        .includes(query)
            );
        }, [users, search]);

    // =========================
    // SUMMARY
    // =========================

    const stats =
        useMemo(() => {
            const admins =
                users.filter(
                    (user) =>
                        user.role === "admin"
                ).length;

            const active =
                users.filter(
                    (user) =>
                        user.isActive
                ).length;

            return {
                admins,
                active,
                inactive:
                    users.length - active,
            };
        }, [users]);

    // =========================
    // SELF CHECK
    // =========================

    const isSelf = (
        user: User
    ) => {
        const currentId =
            currentUser?._id ||
            currentUser?.id;

        if (
            currentId &&
            currentId === user._id
        ) {
            return true;
        }

        if (
            currentUser?.username &&
            currentUser.username.toLowerCase() ===
                user.username.toLowerCase()
        ) {
            return true;
        }

        return false;
    };

    // =========================
    // CREATE USER
    // =========================

    const openCreateModal = () => {
        setNewUsername("");
        setNewPassword("");
        setNewRole("user");

        setCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        if (!saving) {
            setCreateModalOpen(false);
        }
    };

    const createUser = async () => {
        const username =
            newUsername
                .trim()
                .toLowerCase();

        if (!username) {
            Alert.alert(
                "Missing Username",
                "Please enter a username."
            );
            return;
        }

        if (
            !newPassword ||
            newPassword.length < 6
        ) {
            Alert.alert(
                "Invalid Password",
                "Password must contain at least 6 characters."
            );
            return;
        }

        try {
            setSaving(true);

            const response =
                await api.post(
                    "/users",
                    {
                        username,
                        password:
                            newPassword,
                        role: newRole,
                    }
                );

            setUsers(
                (current) => [
                    response.data,
                    ...current,
                ]
            );

            setCreateModalOpen(false);

            Alert.alert(
                "User Created",
                "User created successfully."
            );
        } catch (error: any) {
            console.error(
                "Create user error:",
                error.response?.data ||
                    error
            );

            Alert.alert(
                "Create Failed",
                error.response?.data?.message ||
                    "Unable to create user."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // ROLE
    // =========================

    const openRoleModal = (
        user: User
    ) => {
        setSelectedUser(user);
        setEditType("role");
    };

    const updateRole = async (
        role: UserRole
    ) => {
        if (!selectedUser) {
            return;
        }

        try {
            setSaving(true);

            const response =
                await api.put(
                    `/users/${selectedUser._id}`,
                    {
                        role,
                    }
                );

            setUsers(
                (current) =>
                    current.map(
                        (user) =>
                            user._id ===
                            selectedUser._id
                                ? response.data
                                : user
                    )
            );

            setSelectedUser(null);
            setEditType(null);

            Alert.alert(
                "Role Updated",
                "User role updated successfully."
            );
        } catch (error: any) {
            Alert.alert(
                "Update Failed",
                error.response?.data?.message ||
                    "Unable to update role."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // STATUS
    // =========================

    const openStatusModal = (
        user: User
    ) => {
        setSelectedUser(user);
        setEditType("status");
    };

    const updateStatus = async (
        isActive: boolean
    ) => {
        if (!selectedUser) {
            return;
        }

        try {
            setSaving(true);

            const response =
                await api.put(
                    `/users/${selectedUser._id}`,
                    {
                        isActive,
                    }
                );

            setUsers(
                (current) =>
                    current.map(
                        (user) =>
                            user._id ===
                            selectedUser._id
                                ? response.data
                                : user
                    )
            );

            setSelectedUser(null);
            setEditType(null);

            Alert.alert(
                "Status Updated",
                isActive
                    ? "User activated successfully."
                    : "User deactivated successfully."
            );
        } catch (error: any) {
            Alert.alert(
                "Update Failed",
                error.response?.data?.message ||
                    "Unable to update status."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // RESET PASSWORD
    // =========================

    const openPasswordModal = (
        user: User
    ) => {
        setSelectedUser(user);
        setResetPassword("");
        setEditType("password");
    };

    const submitPasswordReset =
        async () => {
            if (!selectedUser) {
                return;
            }

            if (
                !resetPassword ||
                resetPassword.length < 6
            ) {
                Alert.alert(
                    "Invalid Password",
                    "Password must contain at least 6 characters."
                );

                return;
            }

            try {
                setSaving(true);

                const response =
                    await api.put(
                        `/users/${selectedUser._id}/password`,
                        {
                            password:
                                resetPassword,
                        }
                    );

                setSelectedUser(null);
                setEditType(null);
                setResetPassword("");

                Alert.alert(
                    "Password Reset",
                    response.data?.message ||
                        "Password reset successfully."
                );
            } catch (error: any) {
                Alert.alert(
                    "Reset Failed",
                    error.response?.data?.message ||
                        "Unable to reset password."
                );
            } finally {
                setSaving(false);
            }
        };

    // =========================
    // DELETE USER
    // =========================

    const confirmDelete = (
        user: User
    ) => {
        Alert.alert(
            "Delete User",
            `Delete "${user.username}"?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",

                    onPress: () =>
                        deleteUser(user),
                },
            ]
        );
    };

    const deleteUser = async (
        user: User
    ) => {
        try {
            await api.delete(
                `/users/${user._id}`
            );

            setUsers(
                (current) =>
                    current.filter(
                        (item) =>
                            item._id !==
                            user._id
                    )
            );

            Alert.alert(
                "User Deleted",
                "User deleted successfully."
            );
        } catch (error: any) {
            Alert.alert(
                "Delete Failed",
                error.response?.data?.message ||
                    "Unable to delete user."
            );
        }
    };

    const formatDate = (
        value?: string
    ) => {
        if (!value) {
            return "-";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    if (loading) {
        return (
            <View
                style={styles.loading}
            >
                <ActivityIndicator
                    size="large"
                    color="#166534"
                />

                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Loading users...
                </Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView
                style={styles.screen}
                contentContainerStyle={
                    styles.content
                }
                showsVerticalScrollIndicator={
                    false
                }
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl
                        refreshing={
                            refreshing
                        }
                        onRefresh={
                            onRefresh
                        }
                        colors={[
                            "#166534",
                        ]}
                        tintColor="#166534"
                    />
                }
            >
                <View
                    style={
                        styles.header
                    }
                >
                    <Pressable
                        style={
                            styles.backButton
                        }
                        onPress={() =>
                            router.back()
                        }
                    >
                        <Ionicons
                            name="arrow-back"
                            size={20}
                            color="#166534"
                        />
                    </Pressable>

                    <View
                        style={
                            styles.headerText
                        }
                    >
                        <Text
                            style={
                                styles.pageTitle
                            }
                        >
                            Users
                        </Text>

                        <Text
                            style={
                                styles.pageSubtitle
                            }
                        >
                            Manage system
                            access and roles.
                        </Text>
                    </View>

                    <Pressable
                        style={
                            styles.addButton
                        }
                        onPress={
                            openCreateModal
                        }
                    >
                        <Ionicons
                            name="person-add-outline"
                            size={19}
                            color="#ffffff"
                        />
                    </Pressable>
                </View>

                <View
                    style={
                        styles.summaryGrid
                    }
                >
                    <SummaryCard
                        title="Users"
                        value={String(
                            users.length
                        )}
                        icon="people-outline"
                    />

                    <SummaryCard
                        title="Admins"
                        value={String(
                            stats.admins
                        )}
                        icon="shield-checkmark-outline"
                    />

                    <SummaryCard
                        title="Active"
                        value={String(
                            stats.active
                        )}
                        icon="checkmark-circle-outline"
                    />

                    <SummaryCard
                        title="Inactive"
                        value={String(
                            stats.inactive
                        )}
                        icon="pause-circle-outline"
                        danger={
                            stats.inactive >
                            0
                        }
                    />
                </View>

                <View
                    style={
                        styles.searchContainer
                    }
                >
                    <Ionicons
                        name="search-outline"
                        size={18}
                        color="#94a3b8"
                    />

                    <TextInput
                        style={
                            styles.searchInput
                        }
                        value={search}
                        onChangeText={
                            setSearch
                        }
                        placeholder="Search username or role"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="none"
                    />

                    {search.length >
                        0 && (
                        <Pressable
                            onPress={() =>
                                setSearch(
                                    ""
                                )
                            }
                        >
                            <Ionicons
                                name="close-circle"
                                size={18}
                                color="#94a3b8"
                            />
                        </Pressable>
                    )}
                </View>

                <View
                    style={
                        styles.listHeader
                    }
                >
                    <Text
                        style={
                            styles.listTitle
                        }
                    >
                        System Users
                    </Text>

                    <Text
                        style={
                            styles.listCount
                        }
                    >
                        {
                            filteredUsers.length
                        }{" "}
                        users
                    </Text>
                </View>

                {filteredUsers.map(
                    (user) => {
                        const self =
                            isSelf(
                                user
                            );

                        return (
                            <View
                                key={
                                    user._id
                                }
                                style={
                                    styles.userCard
                                }
                            >
                                <View
                                    style={
                                        styles.userTop
                                    }
                                >
                                    <View
                                        style={
                                            styles.avatar
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.avatarText
                                            }
                                        >
                                            {user.username
                                                .charAt(
                                                    0
                                                )
                                                .toUpperCase()}
                                        </Text>
                                    </View>

                                    <View
                                        style={
                                            styles.userIdentity
                                        }
                                    >
                                        <View
                                            style={
                                                styles.nameRow
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.username
                                                }
                                                numberOfLines={
                                                    1
                                                }
                                            >
                                                {
                                                    user.username
                                                }
                                            </Text>

                                            {self && (
                                                <View
                                                    style={
                                                        styles.youBadge
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.youBadgeText
                                                        }
                                                    >
                                                        YOU
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        <Text
                                            style={
                                                styles.createdAt
                                            }
                                        >
                                            Added{" "}
                                            {formatDate(
                                                user.createdAt
                                            )}
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.statusBadge,

                                            user.isActive
                                                ? styles.activeBadge
                                                : styles.inactiveBadge,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusBadgeText,

                                                user.isActive
                                                    ? styles.activeText
                                                    : styles.inactiveText,
                                            ]}
                                        >
                                            {user.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={
                                        styles.roleRow
                                    }
                                >
                                    <Text
                                        style={
                                            styles.roleLabel
                                        }
                                    >
                                        Role
                                    </Text>

                                    <View
                                        style={
                                            styles.roleBadge
                                        }
                                    >
                                        <Ionicons
                                            name={
                                                user.role ===
                                                "admin"
                                                    ? "shield-checkmark-outline"
                                                    : "person-outline"
                                            }
                                            size={13}
                                            color="#166534"
                                        />

                                        <Text
                                            style={
                                                styles.roleText
                                            }
                                        >
                                            {user.role ===
                                            "admin"
                                                ? "Administrator"
                                                : "User"}
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={
                                        styles.actionGrid
                                    }
                                >
                                    <UserAction
                                        icon="shield-outline"
                                        title="Role"
                                        onPress={() =>
                                            openRoleModal(
                                                user
                                            )
                                        }
                                    />

                                    <UserAction
                                        icon={
                                            user.isActive
                                                ? "pause-circle-outline"
                                                : "play-circle-outline"
                                        }
                                        title={
                                            user.isActive
                                                ? "Deactivate"
                                                : "Activate"
                                        }
                                        disabled={
                                            self &&
                                            user.isActive
                                        }
                                        onPress={() =>
                                            openStatusModal(
                                                user
                                            )
                                        }
                                    />

                                    <UserAction
                                        icon="key-outline"
                                        title="Password"
                                        onPress={() =>
                                            openPasswordModal(
                                                user
                                            )
                                        }
                                    />

                                    <UserAction
                                        icon="trash-outline"
                                        title="Delete"
                                        danger
                                        disabled={
                                            self
                                        }
                                        onPress={() =>
                                            confirmDelete(
                                                user
                                            )
                                        }
                                    />
                                </View>
                            </View>
                        );
                    }
                )}
            </ScrollView>

            <Modal
                visible={
                    createModalOpen
                }
                transparent
                animationType="fade"
                onRequestClose={
                    closeCreateModal
                }
            >
                <View
                    style={
                        styles.modalOverlay
                    }
                >
                    <View
                        style={
                            styles.modalCard
                        }
                    >
                        <ModalHeader
                            title="Add User"
                            subtitle="Create a new account."
                            onClose={
                                closeCreateModal
                            }
                        />

                        <Text
                            style={
                                styles.label
                            }
                        >
                            Username
                        </Text>

                        <TextInput
                            style={
                                styles.input
                            }
                            value={
                                newUsername
                            }
                            onChangeText={
                                setNewUsername
                            }
                            autoCapitalize="none"
                            placeholder="Enter username"
                            placeholderTextColor="#94a3b8"
                        />

                        <Text
                            style={
                                styles.label
                            }
                        >
                            Password
                        </Text>

                        <TextInput
                            style={
                                styles.input
                            }
                            value={
                                newPassword
                            }
                            onChangeText={
                                setNewPassword
                            }
                            placeholder="Minimum 6 characters"
                            placeholderTextColor="#94a3b8"
                            secureTextEntry
                        />

                        <Text
                            style={
                                styles.label
                            }
                        >
                            Role
                        </Text>

                        <View
                            style={
                                styles.optionRow
                            }
                        >
                            <ModalOption
                                title="User"
                                active={
                                    newRole ===
                                    "user"
                                }
                                onPress={() =>
                                    setNewRole(
                                        "user"
                                    )
                                }
                            />

                            <ModalOption
                                title="Admin"
                                active={
                                    newRole ===
                                    "admin"
                                }
                                onPress={() =>
                                    setNewRole(
                                        "admin"
                                    )
                                }
                            />
                        </View>

                        <PrimaryButton
                            title={
                                saving
                                    ? "Creating..."
                                    : "Create User"
                            }
                            loading={
                                saving
                            }
                            onPress={
                                createUser
                            }
                        />
                    </View>
                </View>
            </Modal>

            <Modal
                visible={
                    editType ===
                        "role" &&
                    !!selectedUser
                }
                transparent
                animationType="fade"
            >
                <View
                    style={
                        styles.modalOverlay
                    }
                >
                    <View
                        style={
                            styles.modalCard
                        }
                    >
                        <ModalHeader
                            title="Change Role"
                            subtitle={
                                selectedUser?.username ||
                                ""
                            }
                            onClose={() => {
                                if (
                                    !saving
                                ) {
                                    setEditType(
                                        null
                                    );

                                    setSelectedUser(
                                        null
                                    );
                                }
                            }}
                        />

                        <View
                            style={
                                styles.optionRow
                            }
                        >
                            <ModalOption
                                title="User"
                                active={
                                    selectedUser?.role ===
                                    "user"
                                }
                                onPress={() =>
                                    updateRole(
                                        "user"
                                    )
                                }
                            />

                            <ModalOption
                                title="Admin"
                                active={
                                    selectedUser?.role ===
                                    "admin"
                                }
                                onPress={() =>
                                    updateRole(
                                        "admin"
                                    )
                                }
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={
                    editType ===
                        "status" &&
                    !!selectedUser
                }
                transparent
                animationType="fade"
            >
                <View
                    style={
                        styles.modalOverlay
                    }
                >
                    <View
                        style={
                            styles.modalCard
                        }
                    >
                        <ModalHeader
                            title="Account Status"
                            subtitle={
                                selectedUser?.username ||
                                ""
                            }
                            onClose={() => {
                                if (
                                    !saving
                                ) {
                                    setEditType(
                                        null
                                    );

                                    setSelectedUser(
                                        null
                                    );
                                }
                            }}
                        />

                        <View
                            style={
                                styles.optionRow
                            }
                        >
                            <ModalOption
                                title="Active"
                                active={
                                    selectedUser?.isActive ===
                                    true
                                }
                                onPress={() =>
                                    updateStatus(
                                        true
                                    )
                                }
                            />

                            <ModalOption
                                title="Inactive"
                                active={
                                    selectedUser?.isActive ===
                                    false
                                }
                                danger
                                onPress={() =>
                                    updateStatus(
                                        false
                                    )
                                }
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={
                    editType ===
                        "password" &&
                    !!selectedUser
                }
                transparent
                animationType="fade"
            >
                <View
                    style={
                        styles.modalOverlay
                    }
                >
                    <View
                        style={
                            styles.modalCard
                        }
                    >
                        <ModalHeader
                            title="Reset Password"
                            subtitle={
                                selectedUser?.username ||
                                ""
                            }
                            onClose={() => {
                                if (
                                    !saving
                                ) {
                                    setEditType(
                                        null
                                    );

                                    setSelectedUser(
                                        null
                                    );
                                }
                            }}
                        />

                        <Text
                            style={
                                styles.label
                            }
                        >
                            New Password
                        </Text>

                        <TextInput
                            style={
                                styles.input
                            }
                            value={
                                resetPassword
                            }
                            onChangeText={
                                setResetPassword
                            }
                            placeholder="Minimum 6 characters"
                            placeholderTextColor="#94a3b8"
                            secureTextEntry
                        />

                        <PrimaryButton
                            title={
                                saving
                                    ? "Resetting..."
                                    : "Reset Password"
                            }
                            loading={
                                saving
                            }
                            onPress={
                                submitPasswordReset
                            }
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
}

function SummaryCard({
    title,
    value,
    icon,
    danger = false,
}: {
    title: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    danger?: boolean;
}) {
    return (
        <View
            style={
                styles.summaryCard
            }
        >
            <View
                style={
                    styles.summaryIcon
                }
            >
                <Ionicons
                    name={icon}
                    size={19}
                    color={
                        danger
                            ? "#dc2626"
                            : "#166534"
                    }
                />
            </View>

            <Text
                style={
                    styles.summaryLabel
                }
            >
                {title}
            </Text>

            <Text
                style={
                    styles.summaryValue
                }
            >
                {value}
            </Text>
        </View>
    );
}

function UserAction({
    icon,
    title,
    onPress,
    danger = false,
    disabled = false,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
    danger?: boolean;
    disabled?: boolean;
}) {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={[
                styles.userAction,
                danger &&
                    styles.userActionDanger,
                disabled &&
                    styles.userActionDisabled,
            ]}
        >
            <Ionicons
                name={icon}
                size={16}
                color={
                    danger
                        ? "#dc2626"
                        : "#166534"
                }
            />

            <Text
                style={[
                    styles.userActionText,
                    danger &&
                        styles.userActionDangerText,
                ]}
            >
                {title}
            </Text>
        </Pressable>
    );
}

function ModalHeader({
    title,
    subtitle,
    onClose,
}: {
    title: string;
    subtitle: string;
    onClose: () => void;
}) {
    return (
        <View
            style={
                styles.modalHeader
            }
        >
            <View>
                <Text
                    style={
                        styles.modalTitle
                    }
                >
                    {title}
                </Text>

                <Text
                    style={
                        styles.modalSubtitle
                    }
                >
                    {subtitle}
                </Text>
            </View>

            <Pressable
                onPress={
                    onClose
                }
            >
                <Ionicons
                    name="close"
                    size={22}
                    color="#64748b"
                />
            </Pressable>
        </View>
    );
}

function ModalOption({
    title,
    active,
    onPress,
    danger = false,
}: {
    title: string;
    active: boolean;
    onPress: () => void;
    danger?: boolean;
}) {
    return (
        <Pressable
            style={[
                styles.modalOption,
                active &&
                    (danger
                        ? styles.modalOptionDangerActive
                        : styles.modalOptionActive),
            ]}
            onPress={
                onPress
            }
        >
            <Text
                style={[
                    styles.modalOptionText,
                    active &&
                        styles.modalOptionTextActive,
                ]}
            >
                {title}
            </Text>
        </Pressable>
    );
}

function PrimaryButton({
    title,
    loading,
    onPress,
}: {
    title: string;
    loading: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            style={[
                styles.primaryButton,
                loading &&
                    styles.primaryButtonDisabled,
            ]}
            disabled={loading}
            onPress={onPress}
        >
            {loading && (
                <ActivityIndicator
                    size="small"
                    color="#ffffff"
                />
            )}

            <Text
                style={
                    styles.primaryButtonText
                }
            >
                {title}
            </Text>
        </Pressable>
    );
}

const styles =
    StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor:
                "#f4f8f5",
        },

        content: {
            paddingTop: 55,
            paddingHorizontal: 17,
            paddingBottom: 35,
        },

        loading: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
                "#f4f8f5",
        },

        loadingText: {
            marginTop: 12,
            color: "#64748b",
            fontSize: 12,
        },

        header: {
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
        },

        backButton: {
            width: 43,
            height: 43,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#dce8df",
            borderRadius: 13,
            backgroundColor:
                "#ffffff",
        },

        headerText: {
            flex: 1,
            marginLeft: 12,
        },

        pageTitle: {
            color: "#142019",
            fontSize: 26,
            fontWeight: "800",
        },

        pageSubtitle: {
            marginTop: 2,
            color: "#64748b",
            fontSize: 10,
        },

        addButton: {
            width: 43,
            height: 43,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 13,
            backgroundColor:
                "#166534",
        },

        summaryGrid: {
            marginBottom: 20,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent:
                "space-between",
            rowGap: 11,
        },

        summaryCard: {
            width: "48.4%",
            minHeight: 115,
            padding: 14,
            borderWidth: 1,
            borderColor: "#e2ebe4",
            borderRadius: 16,
            backgroundColor:
                "#ffffff",
        },

        summaryIcon: {
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 11,
            backgroundColor:
                "#ecfdf3",
        },

        summaryLabel: {
            marginTop: 10,
            color: "#64748b",
            fontSize: 9,
            fontWeight: "600",
        },

        summaryValue: {
            marginTop: 4,
            color: "#17231b",
            fontSize: 16,
            fontWeight: "800",
        },

        searchContainer: {
            height: 52,
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#dce8df",
            borderRadius: 14,
            backgroundColor:
                "#ffffff",
        },

        searchInput: {
            flex: 1,
            height: "100%",
            marginLeft: 9,
            color: "#17231b",
            fontSize: 12,
        },

        listHeader: {
            marginTop: 22,
            marginBottom: 12,
            flexDirection: "row",
            justifyContent:
                "space-between",
        },

        listTitle: {
            color: "#17231b",
            fontSize: 17,
            fontWeight: "800",
        },

        listCount: {
            color: "#94a3b8",
            fontSize: 9,
        },

        userCard: {
            marginBottom: 13,
            padding: 15,
            borderWidth: 1,
            borderColor: "#e2ebe4",
            borderRadius: 18,
            backgroundColor:
                "#ffffff",
        },

        userTop: {
            flexDirection: "row",
            alignItems: "center",
        },

        avatar: {
            width: 43,
            height: 43,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 13,
            backgroundColor:
                "#dcfce7",
        },

        avatarText: {
            color: "#166534",
            fontSize: 15,
            fontWeight: "800",
        },

        userIdentity: {
            flex: 1,
            marginLeft: 11,
        },

        nameRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
        },

        username: {
            color: "#17231b",
            fontSize: 13,
            fontWeight: "800",
        },

        youBadge: {
            paddingHorizontal: 6,
            paddingVertical: 3,
            borderRadius: 10,
            backgroundColor:
                "#ecfdf3",
        },

        youBadgeText: {
            color: "#166534",
            fontSize: 7,
            fontWeight: "800",
        },

        createdAt: {
            marginTop: 4,
            color: "#94a3b8",
            fontSize: 8,
        },

        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 5,
            borderRadius: 20,
        },

        activeBadge: {
            backgroundColor:
                "#dcfce7",
        },

        inactiveBadge: {
            backgroundColor:
                "#fee2e2",
        },

        statusBadgeText: {
            fontSize: 8,
            fontWeight: "800",
        },

        activeText: {
            color: "#15803d",
        },

        inactiveText: {
            color: "#dc2626",
        },

        roleRow: {
            marginTop: 14,
            paddingTop: 13,
            flexDirection: "row",
            justifyContent:
                "space-between",
            borderTopWidth: 1,
            borderTopColor:
                "#edf2ee",
        },

        roleLabel: {
            color: "#94a3b8",
            fontSize: 9,
        },

        roleBadge: {
            paddingHorizontal: 9,
            paddingVertical: 6,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            borderRadius: 20,
            backgroundColor:
                "#ecfdf3",
        },

        roleText: {
            color: "#166534",
            fontSize: 8,
            fontWeight: "800",
        },

        actionGrid: {
            marginTop: 14,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
        },

        userAction: {
            width: "48.6%",
            minHeight: 42,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            borderRadius: 11,
            backgroundColor:
                "#ecfdf3",
        },

        userActionDanger: {
            backgroundColor:
                "#fef2f2",
        },

        userActionDisabled: {
            opacity: 0.35,
        },

        userActionText: {
            color: "#166534",
            fontSize: 9,
            fontWeight: "800",
        },

        userActionDangerText: {
            color: "#dc2626",
        },

        modalOverlay: {
            flex: 1,
            padding: 20,
            justifyContent: "center",
            backgroundColor:
                "rgba(15,23,42,.48)",
        },

        modalCard: {
            width: "100%",
            padding: 20,
            borderRadius: 21,
            backgroundColor:
                "#ffffff",
        },

        modalHeader: {
            marginBottom: 10,
            flexDirection: "row",
            justifyContent:
                "space-between",
        },

        modalTitle: {
            color: "#17231b",
            fontSize: 20,
            fontWeight: "800",
        },

        modalSubtitle: {
            marginTop: 4,
            color: "#64748b",
            fontSize: 10,
        },

        label: {
            marginTop: 15,
            marginBottom: 7,
            color: "#374151",
            fontSize: 10,
            fontWeight: "700",
        },

        input: {
            height: 51,
            paddingHorizontal: 13,
            borderWidth: 1,
            borderColor: "#dce8df",
            borderRadius: 12,
            backgroundColor:
                "#fbfdfb",
            color: "#17231b",
            fontSize: 11,
        },

        optionRow: {
            flexDirection: "row",
            gap: 9,
            marginTop: 8,
        },

        modalOption: {
            flex: 1,
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#dce8df",
            borderRadius: 12,
            backgroundColor:
                "#ffffff",
        },

        modalOptionActive: {
            borderColor: "#166534",
            backgroundColor:
                "#166534",
        },

        modalOptionDangerActive: {
            borderColor: "#dc2626",
            backgroundColor:
                "#dc2626",
        },

        modalOptionText: {
            color: "#64748b",
            fontSize: 10,
            fontWeight: "800",
        },

        modalOptionTextActive: {
            color: "#ffffff",
        },

        primaryButton: {
            minHeight: 52,
            marginTop: 22,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            borderRadius: 13,
            backgroundColor:
                "#166534",
        },

        primaryButtonDisabled: {
            opacity: 0.65,
        },

        primaryButtonText: {
            color: "#ffffff",
            fontSize: 11,
            fontWeight: "800",
        },
    });