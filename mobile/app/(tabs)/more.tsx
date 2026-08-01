import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useEffect, useState } from "react";

import {
    useRouter,
} from "expo-router";

import {
    Ionicons,
} from "@expo/vector-icons";

import * as SecureStore from "expo-secure-store";

type User = {
    username?: string;
    role?: string;
};

export default function More() {
    const router = useRouter();

    const [user, setUser] =
        useState<User | null>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const storedUser =
                await SecureStore.getItemAsync(
                    "user"
                );

            if (storedUser) {
                setUser(
                    JSON.parse(
                        storedUser
                    )
                );
            }
        } catch (error) {
            console.error(
                "Unable to load user:",
                error
            );
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Logout",
                    style: "destructive",

                    onPress:
                        performLogout,
                },
            ]
        );
    };

    const performLogout =
        async () => {
            try {
                await SecureStore.deleteItemAsync(
                    "token"
                );

                await SecureStore.deleteItemAsync(
                    "user"
                );

                router.replace("/");
            } catch (error) {
                console.error(
                    "Logout error:",
                    error
                );

                Alert.alert(
                    "Logout Failed",
                    "Unable to logout. Please try again."
                );
            }
        };

    const username =
        user?.username ||
        "Admin";

    const role =
        user?.role ||
        "Administrator";

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={
                styles.content
            }
            showsVerticalScrollIndicator={
                false
            }
        >
            <View style={styles.header}>
                <Text
                    style={
                        styles.eyebrow
                    }
                >
                    SHIVALIK DRAGON FARM
                </Text>

                <Text
                    style={
                        styles.title
                    }
                >
                    More
                </Text>

                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Manage reports,
                    users and application
                    settings.
                </Text>
            </View>

            <View
                style={
                    styles.profileCard
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
                        {username
                            .charAt(0)
                            .toUpperCase()}
                    </Text>
                </View>

                <View
                    style={
                        styles.profileInfo
                    }
                >
                    <Text
                        style={
                            styles.username
                        }
                    >
                        {username}
                    </Text>

                    <Text
                        style={
                            styles.role
                        }
                    >
                        {role}
                    </Text>
                </View>

                <View
                    style={
                        styles.secureBadge
                    }
                >
                    <Ionicons
                        name="shield-checkmark"
                        size={17}
                        color="#15803d"
                    />
                </View>
            </View>

            <Text
                style={
                    styles.sectionTitle
                }
            >
                Management
            </Text>

            <View
                style={
                    styles.menuCard
                }
            >
                <MenuItem
                    icon="bar-chart-outline"
                    title="Reports"
                    description="Sales and payment reports"
                    onPress={() =>
                        router.push(
                            "/reports"
                        )
                    }
                />

                <MenuDivider />

                <MenuItem
                    icon="people-outline"
                    title="Users"
                    description="Manage system users"
                    onPress={() =>
                        router.push(
                            "/users"
                        )
                    }
                />
            </View>

            <Text
                style={
                    styles.sectionTitle
                }
            >
                Application
            </Text>

            <View
                style={
                    styles.menuCard
                }
            >
                <MenuItem
                    icon="information-circle-outline"
                    title="App Information"
                    description="Shivalik Farm Management"
                    onPress={() =>
                        Alert.alert(
                            "Shivalik Dragon Farm",
                            "Farm Management Mobile App\n\nVersion 1.0.0"
                        )
                    }
                />
            </View>

            <Pressable
                style={({
                    pressed,
                }) => [
                    styles.logoutButton,

                    pressed &&
                        styles.logoutButtonPressed,
                ]}
                onPress={
                    handleLogout
                }
            >
                <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="#dc2626"
                />

                <Text
                    style={
                        styles.logoutText
                    }
                >
                    Logout
                </Text>
            </Pressable>

            <Text
                style={
                    styles.footer
                }
            >
                Shivalik Dragon Farm
                Management System
            </Text>
        </ScrollView>
    );
}

function MenuItem({
    icon,
    title,
    description,
    onPress,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    onPress: () => void;
}) {
    return (
        <Pressable
            style={({
                pressed,
            }) => [
                styles.menuItem,

                pressed &&
                    styles.menuItemPressed,
            ]}
            onPress={onPress}
        >
            <View
                style={
                    styles.menuIcon
                }
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color="#166534"
                />
            </View>

            <View
                style={
                    styles.menuText
                }
            >
                <Text
                    style={
                        styles.menuTitle
                    }
                >
                    {title}
                </Text>

                <Text
                    style={
                        styles.menuDescription
                    }
                >
                    {description}
                </Text>
            </View>

            <Ionicons
                name="chevron-forward"
                size={18}
                color="#94a3b8"
            />
        </Pressable>
    );
}

function MenuDivider() {
    return (
        <View
            style={
                styles.menuDivider
            }
        />
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

        header: {
            marginBottom: 22,
        },

        eyebrow: {
            color: "#15803d",

            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 1,
        },

        title: {
            marginTop: 5,

            color: "#142019",

            fontSize: 31,
            fontWeight: "800",
        },

        subtitle: {
            marginTop: 5,

            color: "#64748b",

            fontSize: 12,
            lineHeight: 18,
        },

        profileCard: {
            padding: 17,

            flexDirection:
                "row",

            alignItems: "center",

            borderWidth: 1,
            borderColor:
                "#e2ebe4",

            borderRadius: 18,

            backgroundColor:
                "#ffffff",

            elevation: 3,
        },

        avatar: {
            width: 50,
            height: 50,

            alignItems: "center",
            justifyContent:
                "center",

            borderRadius: 15,

            backgroundColor:
                "#dcfce7",
        },

        avatarText: {
            color: "#166534",

            fontSize: 18,
            fontWeight: "800",
        },

        profileInfo: {
            flex: 1,
            marginLeft: 12,
        },

        username: {
            color: "#17231b",

            fontSize: 15,
            fontWeight: "800",
        },

        role: {
            marginTop: 3,

            color: "#94a3b8",

            fontSize: 9,
            fontWeight: "600",
        },

        secureBadge: {
            width: 36,
            height: 36,

            alignItems: "center",
            justifyContent:
                "center",

            borderRadius: 11,

            backgroundColor:
                "#ecfdf3",
        },

        sectionTitle: {
            marginTop: 24,
            marginBottom: 10,

            color: "#17231b",

            fontSize: 14,
            fontWeight: "800",
        },

        menuCard: {
            overflow: "hidden",

            borderWidth: 1,
            borderColor:
                "#e2ebe4",

            borderRadius: 18,

            backgroundColor:
                "#ffffff",
        },

        menuItem: {
            minHeight: 74,
            paddingHorizontal: 15,

            flexDirection:
                "row",

            alignItems: "center",
        },

        menuItemPressed: {
            backgroundColor:
                "#f8faf9",
        },

        menuIcon: {
            width: 40,
            height: 40,

            alignItems: "center",
            justifyContent:
                "center",

            borderRadius: 12,

            backgroundColor:
                "#ecfdf3",
        },

        menuText: {
            flex: 1,
            marginLeft: 12,
        },

        menuTitle: {
            color: "#17231b",

            fontSize: 12,
            fontWeight: "800",
        },

        menuDescription: {
            marginTop: 4,

            color: "#94a3b8",

            fontSize: 9,
        },

        menuDivider: {
            height: 1,

            marginLeft: 67,

            backgroundColor:
                "#edf2ee",
        },

        logoutButton: {
            height: 52,
            marginTop: 28,

            flexDirection:
                "row",

            alignItems: "center",
            justifyContent:
                "center",

            gap: 8,

            borderWidth: 1,
            borderColor:
                "#fecaca",

            borderRadius: 13,

            backgroundColor:
                "#fff7f7",
        },

        logoutButtonPressed: {
            opacity: 0.8,
        },

        logoutText: {
            color: "#dc2626",

            fontSize: 12,
            fontWeight: "800",
        },

        footer: {
            marginTop: 24,

            color: "#94a3b8",

            fontSize: 9,

            textAlign: "center",
        },
    });