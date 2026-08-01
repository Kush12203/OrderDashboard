import {
    ActivityIndicator,
    Alert,
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

import {
    Ionicons,
    MaterialIcons,
} from "@expo/vector-icons";

import api from "../../services/api";

type Order = {
    _id: string;
    date?: string;
    customerName?: string;
    weight?: number;
    rate?: number;
    amount?: number;
    paymentMode?: "Cash" | "Online";
    paymentStatus?: "Paid" | "Unpaid";
    phone?: string;
    address?: string;
    notes?: string;
    createdAt?: string;
};

type FilterType =
    | "All"
    | "Paid"
    | "Unpaid";

export default function Orders() {
    const router = useRouter();

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [filter, setFilter] =
        useState<FilterType>("All");

    const [error, setError] =
        useState("");

    // ============================
    // Load Orders
    // ============================

    const loadOrders = async (
        isRefresh = false
    ) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response =
                await api.get("/orders");

            setOrders(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err: any) {
            console.error(
                "Orders load error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                    "Unable to load orders."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const onRefresh = useCallback(() => {
        loadOrders(true);
    }, []);

    // ============================
    // Filter Orders
    // ============================

    const filteredOrders =
        useMemo(() => {
            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return orders.filter(
                (order) => {
                    const matchesSearch =
                        !searchValue ||
                        order.customerName
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            ) ||
                        order.phone
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            );

                    const matchesFilter =
                        filter === "All" ||
                        order.paymentStatus ===
                            filter;

                    return (
                        matchesSearch &&
                        matchesFilter
                    );
                }
            );
        }, [orders, search, filter]);

    // ============================
    // Delete Order
    // ============================

    const confirmDelete = (
        order: Order
    ) => {
        Alert.alert(
            "Delete Order",
            `Are you sure you want to delete ${
                order.customerName ||
                "this order"
            }?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",

                    onPress: () =>
                        deleteOrder(
                            order._id
                        ),
                },
            ]
        );
    };

    const deleteOrder = async (
        id: string
    ) => {
        try {
            await api.delete(
                `/orders/${id}`
            );

            setOrders(
                (currentOrders) =>
                    currentOrders.filter(
                        (order) =>
                            order._id !== id
                    )
            );
        } catch (err: any) {
            console.error(
                "Delete error:",
                err.response?.data || err
            );

            Alert.alert(
                "Delete Failed",
                err.response?.data
                    ?.message ||
                    "Unable to delete order."
            );
        }
    };

    // ============================
    // Formatting
    // ============================

    const formatCurrency = (
        value?: number
    ) => {
        return Number(
            value || 0
        ).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        });
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

    // ============================
    // Loading
    // ============================

    if (loading) {
        return (
            <View
                style={
                    styles.loadingContainer
                }
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
                    Loading orders...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <ScrollView
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
                {/* Header */}

                <View
                    style={
                        styles.header
                    }
                >
                    <View
                        style={
                            styles.headerText
                        }
                    >
                        <Text
                            style={
                                styles.eyebrow
                            }
                        >
                            FARM MANAGEMENT
                        </Text>

                        <Text
                            style={
                                styles.title
                            }
                        >
                            Orders
                        </Text>

                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Manage customer
                            orders and payments.
                        </Text>
                    </View>

                    <Pressable
                        style={
                            styles.addButton
                        }
                        onPress={() =>
                            router.push(
                                "/order/add"
                            )
                        }
                    >
                        <Ionicons
                            name="add"
                            size={22}
                            color="#ffffff"
                        />
                    </Pressable>
                </View>

                {/* Search */}

                <View
                    style={
                        styles.searchContainer
                    }
                >
                    <Ionicons
                        name="search"
                        size={19}
                        color="#94a3b8"
                    />

                    <TextInput
                        style={
                            styles.searchInput
                        }
                        placeholder="Search customer or phone"
                        placeholderTextColor="#94a3b8"
                        value={search}
                        onChangeText={
                            setSearch
                        }
                    />

                    {search.length > 0 && (
                        <Pressable
                            onPress={() =>
                                setSearch(
                                    ""
                                )
                            }
                        >
                            <Ionicons
                                name="close-circle"
                                size={19}
                                color="#94a3b8"
                            />
                        </Pressable>
                    )}
                </View>

                {/* Filters */}

                <View
                    style={
                        styles.filters
                    }
                >
                    <FilterButton
                        title="All"
                        active={
                            filter ===
                            "All"
                        }
                        onPress={() =>
                            setFilter(
                                "All"
                            )
                        }
                    />

                    <FilterButton
                        title="Paid"
                        active={
                            filter ===
                            "Paid"
                        }
                        onPress={() =>
                            setFilter(
                                "Paid"
                            )
                        }
                    />

                    <FilterButton
                        title="Unpaid"
                        active={
                            filter ===
                            "Unpaid"
                        }
                        onPress={() =>
                            setFilter(
                                "Unpaid"
                            )
                        }
                    />
                </View>

                {/* Result Count */}

                <View
                    style={
                        styles.resultHeader
                    }
                >
                    <Text
                        style={
                            styles.resultTitle
                        }
                    >
                        {filter === "All"
                            ? "All Orders"
                            : `${filter} Orders`}
                    </Text>

                    <Text
                        style={
                            styles.resultCount
                        }
                    >
                        {
                            filteredOrders.length
                        }{" "}
                        {filteredOrders.length ===
                        1
                            ? "order"
                            : "orders"}
                    </Text>
                </View>

                {error ? (
                    <View
                        style={
                            styles.errorBox
                        }
                    >
                        <Text
                            style={
                                styles.errorText
                            }
                        >
                            {error}
                        </Text>
                    </View>
                ) : null}

                {/* Orders */}

                {filteredOrders.length ===
                0 ? (
                    <View
                        style={
                            styles.emptyContainer
                        }
                    >
                        <View
                            style={
                                styles.emptyIcon
                            }
                        >
                            <MaterialIcons
                                name="receipt-long"
                                size={28}
                                color="#166534"
                            />
                        </View>

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No orders found
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            {search
                                ? "Try another search."
                                : "Add your first order to get started."}
                        </Text>
                    </View>
                ) : (
                    filteredOrders.map(
                        (order) => (
                            <View
                                key={
                                    order._id
                                }
                                style={
                                    styles.orderCard
                                }
                            >
                                {/* Card Header */}

                                <View
                                    style={
                                        styles.orderHeader
                                    }
                                >
                                    <View
                                        style={
                                            styles.customerSection
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
                                                {order.customerName
                                                    ?.charAt(
                                                        0
                                                    )
                                                    .toUpperCase() ||
                                                    "C"}
                                            </Text>
                                        </View>

                                        <View
                                            style={
                                                styles.customerInfo
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.customerName
                                                }
                                                numberOfLines={
                                                    1
                                                }
                                            >
                                                {order.customerName ||
                                                    "Customer"}
                                            </Text>

                                            <Text
                                                style={
                                                    styles.orderDate
                                                }
                                            >
                                                {formatDate(
                                                    order.date ||
                                                        order.createdAt
                                                )}
                                            </Text>
                                        </View>
                                    </View>

                                    <View
                                        style={[
                                            styles.statusBadge,

                                            order.paymentStatus ===
                                            "Paid"
                                                ? styles.paidBadge
                                                : styles.unpaidBadge,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.statusDot,

                                                order.paymentStatus ===
                                                "Paid"
                                                    ? styles.paidDot
                                                    : styles.unpaidDot,
                                            ]}
                                        />

                                        <Text
                                            style={[
                                                styles.statusText,

                                                order.paymentStatus ===
                                                "Paid"
                                                    ? styles.paidText
                                                    : styles.unpaidText,
                                            ]}
                                        >
                                            {order.paymentStatus ||
                                                "-"}
                                        </Text>
                                    </View>
                                </View>

                                {/* Amount */}

                                <View
                                    style={
                                        styles.amountSection
                                    }
                                >
                                    <Text
                                        style={
                                            styles.amountLabel
                                        }
                                    >
                                        Order Amount
                                    </Text>

                                    <Text
                                        style={
                                            styles.amount
                                        }
                                    >
                                        ₹{" "}
                                        {formatCurrency(
                                            order.amount
                                        )}
                                    </Text>
                                </View>

                                {/* Details */}

                                <View
                                    style={
                                        styles.detailsGrid
                                    }
                                >
                                    <OrderDetail
                                        label="Weight"
                                        value={`${formatCurrency(
                                            order.weight
                                        )} kg`}
                                    />

                                    <OrderDetail
                                        label="Rate"
                                        value={`₹ ${formatCurrency(
                                            order.rate
                                        )}/kg`}
                                    />

                                    <OrderDetail
                                        label="Payment"
                                        value={
                                            order.paymentMode ||
                                            "-"
                                        }
                                    />

                                    <OrderDetail
                                        label="Phone"
                                        value={
                                            order.phone ||
                                            "-"
                                        }
                                    />
                                </View>

                                {order.address ? (
                                    <View
                                        style={
                                            styles.addressBox
                                        }
                                    >
                                        <Ionicons
                                            name="location-outline"
                                            size={
                                                16
                                            }
                                            color="#64748b"
                                        />

                                        <Text
                                            style={
                                                styles.addressText
                                            }
                                            numberOfLines={
                                                2
                                            }
                                        >
                                            {
                                                order.address
                                            }
                                        </Text>
                                    </View>
                                ) : null}

                                {/* Actions */}

                                <View
                                    style={
                                        styles.actions
                                    }
                                >
                                    <Pressable
                                        style={
                                            styles.editButton
                                        }
                                        onPress={() =>
                                            router.push(
                                                `/order/${order._id}`
                                            )
                                        }
                                    >
                                        <Ionicons
                                            name="create-outline"
                                            size={
                                                17
                                            }
                                            color="#166534"
                                        />

                                        <Text
                                            style={
                                                styles.editButtonText
                                            }
                                        >
                                            Edit
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        style={
                                            styles.deleteButton
                                        }
                                        onPress={() =>
                                            confirmDelete(
                                                order
                                            )
                                        }
                                    >
                                        <Ionicons
                                            name="trash-outline"
                                            size={
                                                17
                                            }
                                            color="#dc2626"
                                        />

                                        <Text
                                            style={
                                                styles.deleteButtonText
                                            }
                                        >
                                            Delete
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )
                    )
                )}
            </ScrollView>
        </View>
    );
}

// ============================
// Filter Button
// ============================

type FilterButtonProps = {
    title: FilterType;
    active: boolean;
    onPress: () => void;
};

function FilterButton({
    title,
    active,
    onPress,
}: FilterButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.filterButton,

                active &&
                    styles.filterButtonActive,
            ]}
        >
            <Text
                style={[
                    styles.filterButtonText,

                    active &&
                        styles.filterButtonTextActive,
                ]}
            >
                {title}
            </Text>
        </Pressable>
    );
}

// ============================
// Detail
// ============================

function OrderDetail({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <View
            style={
                styles.detailItem
            }
        >
            <Text
                style={
                    styles.detailLabel
                }
            >
                {label}
            </Text>

            <Text
                style={
                    styles.detailValue
                }
                numberOfLines={1}
            >
                {value}
            </Text>
        </View>
    );
}

// ============================
// Styles
// ============================

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f4f8f5",
    },

    content: {
        paddingTop: 55,
        paddingHorizontal: 17,
        paddingBottom: 35,
    },

    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f8f5",
    },

    loadingText: {
        marginTop: 12,
        color: "#64748b",
        fontSize: 12,
    },

    header: {
        marginBottom: 22,
        flexDirection: "row",
        alignItems: "center",
        justifyContent:
            "space-between",
    },

    headerText: {
        flex: 1,
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
    },

    addButton: {
        width: 48,
        height: 48,
        marginLeft: 15,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        backgroundColor: "#166534",

        shadowColor: "#166534",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 5,
        },

        elevation: 5,
    },

    searchContainer: {
        height: 53,
        paddingHorizontal: 15,

        flexDirection: "row",
        alignItems: "center",

        borderWidth: 1,
        borderColor: "#dce8df",
        borderRadius: 14,

        backgroundColor: "#ffffff",
    },

    searchInput: {
        flex: 1,
        height: "100%",
        marginLeft: 10,
        color: "#17231b",
        fontSize: 13,
    },

    filters: {
        marginTop: 14,
        marginBottom: 25,

        flexDirection: "row",
        gap: 9,
    },

    filterButton: {
        paddingHorizontal: 18,
        paddingVertical: 10,

        borderWidth: 1,
        borderColor: "#dce8df",
        borderRadius: 30,

        backgroundColor: "#ffffff",
    },

    filterButtonActive: {
        borderColor: "#166534",
        backgroundColor: "#166534",
    },

    filterButtonText: {
        color: "#64748b",
        fontSize: 11,
        fontWeight: "700",
    },

    filterButtonTextActive: {
        color: "#ffffff",
    },

    resultHeader: {
        marginBottom: 13,

        flexDirection: "row",
        alignItems: "center",
        justifyContent:
            "space-between",
    },

    resultTitle: {
        color: "#17231b",
        fontSize: 17,
        fontWeight: "800",
    },

    resultCount: {
        color: "#94a3b8",
        fontSize: 10,
        fontWeight: "600",
    },

    errorBox: {
        marginBottom: 15,
        padding: 13,
        borderRadius: 12,
        backgroundColor: "#fef2f2",
    },

    errorText: {
        color: "#b91c1c",
        fontSize: 11,
        fontWeight: "600",
    },

    orderCard: {
        marginBottom: 14,
        padding: 16,

        borderWidth: 1,
        borderColor: "#e2ebe4",
        borderRadius: 19,

        backgroundColor: "#ffffff",

        shadowColor: "#14532d",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 5,
        },

        elevation: 2,
    },

    orderHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent:
            "space-between",
    },

    customerSection: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        minWidth: 0,
    },

    avatar: {
        width: 43,
        height: 43,

        alignItems: "center",
        justifyContent: "center",

        borderRadius: 13,
        backgroundColor: "#dcfce7",
    },

    avatarText: {
        color: "#166534",
        fontSize: 15,
        fontWeight: "800",
    },

    customerInfo: {
        flex: 1,
        minWidth: 0,
        marginLeft: 11,
    },

    customerName: {
        color: "#17231b",
        fontSize: 14,
        fontWeight: "800",
    },

    orderDate: {
        marginTop: 4,
        color: "#94a3b8",
        fontSize: 9,
        fontWeight: "600",
    },

    statusBadge: {
        marginLeft: 8,
        paddingHorizontal: 9,
        paddingVertical: 6,

        flexDirection: "row",
        alignItems: "center",

        borderRadius: 30,
    },

    paidBadge: {
        backgroundColor: "#dcfce7",
    },

    unpaidBadge: {
        backgroundColor: "#fee2e2",
    },

    statusDot: {
        width: 5,
        height: 5,
        marginRight: 5,
        borderRadius: 10,
    },

    paidDot: {
        backgroundColor: "#16a34a",
    },

    unpaidDot: {
        backgroundColor: "#dc2626",
    },

    statusText: {
        fontSize: 8,
        fontWeight: "800",
    },

    paidText: {
        color: "#15803d",
    },

    unpaidText: {
        color: "#dc2626",
    },

    amountSection: {
        marginTop: 17,
        paddingBottom: 15,

        borderBottomWidth: 1,
        borderBottomColor: "#edf2ee",
    },

    amountLabel: {
        color: "#94a3b8",
        fontSize: 9,
        fontWeight: "600",
    },

    amount: {
        marginTop: 4,
        color: "#17231b",
        fontSize: 22,
        fontWeight: "800",
    },

    detailsGrid: {
        paddingTop: 14,

        flexDirection: "row",
        flexWrap: "wrap",

        rowGap: 15,
    },

    detailItem: {
        width: "50%",
    },

    detailLabel: {
        color: "#94a3b8",
        fontSize: 9,
        fontWeight: "600",
    },

    detailValue: {
        marginTop: 4,
        paddingRight: 8,

        color: "#374151",
        fontSize: 11,
        fontWeight: "700",
    },

    addressBox: {
        marginTop: 15,
        padding: 11,

        flexDirection: "row",
        alignItems: "flex-start",

        borderRadius: 11,
        backgroundColor: "#f8faf9",
    },

    addressText: {
        flex: 1,
        marginLeft: 7,

        color: "#64748b",
        fontSize: 10,
        lineHeight: 15,
    },

    actions: {
        marginTop: 17,

        flexDirection: "row",
        gap: 9,
    },

    editButton: {
        flex: 1,
        height: 42,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        gap: 6,

        borderRadius: 11,
        backgroundColor: "#ecfdf3",
    },

    editButtonText: {
        color: "#166534",
        fontSize: 11,
        fontWeight: "800",
    },

    deleteButton: {
        flex: 1,
        height: 42,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        gap: 6,

        borderRadius: 11,
        backgroundColor: "#fef2f2",
    },

    deleteButtonText: {
        color: "#dc2626",
        fontSize: 11,
        fontWeight: "800",
    },

    emptyContainer: {
        paddingVertical: 55,
        paddingHorizontal: 25,

        alignItems: "center",

        borderWidth: 1,
        borderColor: "#e2ebe4",
        borderRadius: 19,

        backgroundColor: "#ffffff",
    },

    emptyIcon: {
        width: 55,
        height: 55,

        alignItems: "center",
        justifyContent: "center",

        borderRadius: 17,
        backgroundColor: "#dcfce7",
    },

    emptyTitle: {
        marginTop: 15,

        color: "#17231b",
        fontSize: 15,
        fontWeight: "800",
    },

    emptyText: {
        marginTop: 6,

        color: "#94a3b8",
        fontSize: 11,
        textAlign: "center",
    },
});