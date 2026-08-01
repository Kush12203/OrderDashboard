import { useEffect, useState } from "react";

import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView
} from "react-native";

import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

import api from "../services/api";

export default function LoginScreen() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [checkingLogin, setCheckingLogin] = useState(true);

    useEffect(() => {
        checkExistingLogin();
    }, []);

    const checkExistingLogin = async () => {
        try {
            const token =
                await SecureStore.getItemAsync("token");

            if (token) {
                router.replace("/(tabs)/dashboard");
                return;
            }
        } catch (error) {
            console.error(
                "SecureStore check error:",
                error
            );
        } finally {
            setCheckingLogin(false);
        }
    };

    const handleLogin = async () => {
        if (!username.trim() || !password) {
            Alert.alert(
                "Missing Details",
                "Please enter username and password."
            );

            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/login",
                {
                    username: username.trim(),
                    password
                }
            );

            const token = response.data.token;
            const user = response.data.user;

            if (!token) {
                throw new Error(
                    "Authentication token not received."
                );
            }

            await SecureStore.setItemAsync(
                "token",
                token
            );

            await SecureStore.setItemAsync(
                "user",
                JSON.stringify(user)
            );

            router.replace("/(tabs)/dashboard");
        } catch (error: any) {
            console.error(
                "Login error:",
                error.response?.data || error
            );

            Alert.alert(
                "Login Failed",
                error.response?.data?.message ||
                    error.message ||
                    "Unable to login."
            );
        } finally {
            setLoading(false);
        }
    };

    if (checkingLogin) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator
                    size="large"
                    color="#166534"
                />

                <Text style={styles.loadingText}>
                    Checking login...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                <View style={styles.brandSection}>
                    <Text style={styles.badge}>
                        FARM MANAGEMENT SYSTEM
                    </Text>

                    <Text style={styles.brandTitle}>
                        Shivalik
                    </Text>

                    <Text style={styles.brandTitleAccent}>
                        Dragon Farm
                    </Text>

                    <Text style={styles.brandDescription}>
                        Manage orders, customers,
                        payments and farm operations
                        from one secure dashboard.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.secureText}>
                        SECURE ADMIN PORTAL
                    </Text>

                    <Text style={styles.title}>
                        Welcome back
                    </Text>

                    <Text style={styles.subtitle}>
                        Enter your account details to
                        access the dashboard.
                    </Text>

                    <Text style={styles.label}>
                        Username
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter username"
                        placeholderTextColor="#9ca3af"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        editable={!loading}
                    />

                    <Text style={styles.label}>
                        Password
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter password"
                        placeholderTextColor="#9ca3af"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!loading}
                    />

                    <Pressable
                        style={({ pressed }) => [
                            styles.loginButton,
                            pressed &&
                                styles.loginButtonPressed,
                            loading &&
                                styles.loginButtonDisabled
                        ]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator
                                color="#ffffff"
                            />
                        ) : (
                            <Text
                                style={
                                    styles.loginButtonText
                                }
                            >
                                Login to Dashboard
                            </Text>
                        )}
                    </Pressable>

                    <Text style={styles.securityNote}>
                        Your account information is
                        securely protected.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        backgroundColor: "#f1f7f3"
    },

    container: {
        flex: 1,
        paddingHorizontal: 22,
        paddingVertical: 36,
        justifyContent: "center"
    },

    brandSection: {
        marginBottom: 28
    },

    badge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: "#dcfce7",
        color: "#166534",
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.7,
        marginBottom: 18
    },

    brandTitle: {
        color: "#14532d",
        fontSize: 38,
        fontWeight: "800",
        lineHeight: 42
    },

    brandTitleAccent: {
        color: "#16a34a",
        fontSize: 38,
        fontWeight: "800",
        lineHeight: 42
    },

    brandDescription: {
        marginTop: 14,
        maxWidth: 320,
        color: "#64748b",
        fontSize: 14,
        lineHeight: 22
    },

    card: {
        width: "100%",
        padding: 24,
        borderRadius: 24,
        backgroundColor: "#ffffff",

        shadowColor: "#14532d",
        shadowOpacity: 0.12,
        shadowRadius: 20,
        shadowOffset: {
            width: 0,
            height: 10
        },

        elevation: 6
    },

    secureText: {
        color: "#15803d",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1,
        marginBottom: 8
    },

    title: {
        color: "#142019",
        fontSize: 28,
        fontWeight: "800"
    },

    subtitle: {
        marginTop: 8,
        marginBottom: 24,
        color: "#6b7280",
        fontSize: 13,
        lineHeight: 20
    },

    label: {
        marginBottom: 8,
        color: "#374151",
        fontSize: 12,
        fontWeight: "700"
    },

    input: {
        height: 54,
        marginBottom: 18,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#dbe7de",
        borderRadius: 13,
        backgroundColor: "#fbfdfb",
        color: "#111827",
        fontSize: 14
    },

    loginButton: {
        height: 54,
        marginTop: 6,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 13,
        backgroundColor: "#166534"
    },

    loginButtonPressed: {
        opacity: 0.85
    },

    loginButtonDisabled: {
        opacity: 0.7
    },

    loginButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "700"
    },

    securityNote: {
        marginTop: 18,
        color: "#94a3b8",
        textAlign: "center",
        fontSize: 10
    },

    loadingScreen: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f7f3"
    },

    loadingText: {
        marginTop: 12,
        color: "#64748b",
        fontSize: 13
    }
});