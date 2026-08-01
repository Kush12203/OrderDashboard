import { Tabs } from "expo-router";

import {
    Ionicons,
    MaterialIcons,
} from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor: "#166534",
                tabBarInactiveTintColor: "#94a3b8",

                tabBarStyle: {
                    height: 68,
                    paddingTop: 7,
                    paddingBottom: 9,

                    borderTopWidth: 1,
                    borderTopColor: "#e2e8f0",

                    backgroundColor: "#ffffff",
                },

                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: "Dashboard",

                    tabBarIcon: ({
                        color,
                        size,
                    }) => (
                        <Ionicons
                            name="home"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="orders"
                options={{
                    title: "Orders",

                    tabBarIcon: ({
                        color,
                        size,
                    }) => (
                        <MaterialIcons
                            name="receipt-long"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="payments"
                options={{
                    title: "Payments",

                    tabBarIcon: ({
                        color,
                        size,
                    }) => (
                        <MaterialIcons
                            name="payments"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="customers"
                options={{
                    title: "Customers",

                    tabBarIcon: ({
                        color,
                        size,
                    }) => (
                        <Ionicons
                            name="people"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="more"
                options={{
                    title: "More",

                    tabBarIcon: ({
                        color,
                        size,
                    }) => (
                        <Ionicons
                            name="menu"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}