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

import api from "../../services/api";

type PaymentMode = "Cash" | "Online";
type PaymentStatus = "Paid" | "Unpaid";
type FilterType = "All" | "Paid" | "Unpaid";

type Order = {
    _id: string;
    date?: string;
    customerName?: string;
    weight?: number;
    rate?: number;
    amount?: number;
    paymentMode?: PaymentMode;
    paymentStatus?: PaymentStatus;
    phone?: string;
    address?: string;
    createdAt?: string;
};

export default function Payments() {
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [filter, setFilter] =
        useState<FilterType>("All");

    const [selectedOrder, setSelectedOrder] =
        useState<Order | null>(null);

    const [selectedMode, setSelectedMode] =
        useState<PaymentMode>("Cash");

    const [updating, setUpdating] =
        useState(false);

    const loadOrders = async (
        refresh = false
    ) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response =
                await api.get("/orders");

            setOrders(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error: any) {
            console.error(
                "Payments load error:",
                error.response?.data ||
                    error
            );

            Alert.alert(
                "Unable to Load Payments",
                error.response?.data
                    ?.message ||
                    "Please try again."
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

    const totals = useMemo(() => {
        let collected = 0;
        let pending = 0;
        let cash = 0;
        let online = 0;

        orders.forEach((order) => {
            const amount =
                Number(order.amount || 0);

            if (
                order.paymentStatus === "Paid"
            ) {
                collected += amount;

                if (
                    order.paymentMode === "Cash"
                ) {
                    cash += amount;
                }

                if (
                    order.paymentMode ===
                    "Online"
                ) {
                    online += amount;
                }
            } else {
                pending += amount;
            }
        });

        return {
            collected,
            pending,
            cash,
            online,
        };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesSearch =
                !query ||
                order.customerName
                    ?.toLowerCase()
                    .includes(query) ||
                order.phone
                    ?.toLowerCase()
                    .includes(query);

            const matchesStatus =
                filter === "All" ||
                order.paymentStatus ===
                    filter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [orders, search, filter]);

    const openPaymentModal = (
        order: Order
    ) => {
        setSelectedOrder(order);

        setSelectedMode(
            order.paymentMode || "Cash"
        );
    };

    const closePaymentModal = () => {
        if (updating) {
            return;
        }

        setSelectedOrder(null);
        setSelectedMode("Cash");
    };

    const markAsPaid = async () => {
        if (!selectedOrder) {
            return;
        }

        try {
            setUpdating(true);

            await api.put(
                `/orders/${selectedOrder._id}`,
                {
                    paymentStatus: "Paid",
                    paymentMode:
                        selectedMode,
                }
            );

            setOrders((current) =>
                current.map((order) =>
                    order._id ===
                    selectedOrder._id
                        ? {
                              ...order,
                              paymentStatus:
                                  "Paid",
                              paymentMode:
                                  selectedMode,
                          }
                        : order
                )
            );

            setSelectedOrder(null);

            Alert.alert(
                "Payment Updated",
                "Order marked as paid successfully."
            );
        } catch (error: any) {
            console.error(
                "Payment update error:",
                error.response?.data ||
                    error
            );

            Alert.alert(
                "Update Failed",
                error.response?.data
                    ?.message ||
                    "Unable to update payment."
            );
        } finally {
            setUpdating(false);
        }
    };

    const money = (value?: number) =>
        Number(value || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2,
            }
        );

    const formatDate = (
        value?: string
    ) => {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

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
            <View style={styles.loading}>
                <ActivityIndicator
                    size="large"
                    color="#166534"
                />

                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Loading payments...
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
                        Payments
                    </Text>

                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        Track collected and
                        pending payments.
                    </Text>
                </View>

                <View style={styles.hero}>
                    <View
                        style={
                            styles.heroIcon
                        }
                    >
                        <Ionicons
                            name="wallet"
                            size={22}
                            color="#ffffff"
                        />
                    </View>

                    <Text
                        style={
                            styles.heroLabel
                        }
                    >
                        Total Collected
                    </Text>

                    <Text
                        style={
                            styles.heroValue
                        }
                    >
                        ₹{" "}
                        {money(
                            totals.collected
                        )}
                    </Text>

                    <Text
                        style={
                            styles.heroBottom
                        }
                    >
                        From paid orders
                    </Text>
                </View>

                <View style={styles.grid}>
                    <SummaryCard
                        title="Pending"
                        amount={
                            totals.pending
                        }
                        icon="time-outline"
                    />

                    <SummaryCard
                        title="Cash"
                        amount={
                            totals.cash
                        }
                        icon="cash-outline"
                    />

                    <SummaryCard
                        title="Online"
                        amount={
                            totals.online
                        }
                        icon="card-outline"
                    />

                    <SummaryCard
                        title="Paid Orders"
                        amount={
                            orders.filter(
                                (order) =>
                                    order.paymentStatus ===
                                    "Paid"
                            ).length
                        }
                        icon="checkmark-circle-outline"
                        count
                    />
                </View>

                <View
                    style={
                        styles.searchContainer
                    }
                >
                    <Ionicons
                        name="search"
                        size={18}
                        color="#94a3b8"
                    />

                    <TextInput
                        style={
                            styles.search
                        }
                        placeholder="Search customer or phone"
                        placeholderTextColor="#94a3b8"
                        value={search}
                        onChangeText={
                            setSearch
                        }
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
                        styles.filters
                    }
                >
                    {(
                        [
                            "All",
                            "Paid",
                            "Unpaid",
                        ] as FilterType[]
                    ).map((item) => (
                        <Pressable
                            key={item}
                            onPress={() =>
                                setFilter(
                                    item
                                )
                            }
                            style={[
                                styles.filter,

                                filter ===
                                    item &&
                                    styles.filterActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.filterText,

                                    filter ===
                                        item &&
                                        styles.filterTextActive,
                                ]}
                            >
                                {item}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <View
                    style={
                        styles.listHeader
                    }
                >
                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        {filter === "All"
                            ? "Transactions"
                            : `${filter} Payments`}
                    </Text>

                    <Text
                        style={
                            styles.orderCount
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

                {filteredOrders.length ===
                0 ? (
                    <View
                        style={
                            styles.empty
                        }
                    >
                        <Ionicons
                            name="wallet-outline"
                            size={30}
                            color="#166534"
                        />

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No payments found
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
                                    styles.paymentCard
                                }
                            >
                                <View
                                    style={
                                        styles.paymentTop
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
                                            styles.customer
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
                                                styles.date
                                            }
                                        >
                                            {formatDate(
                                                order.date ||
                                                    order.createdAt
                                            )}
                                        </Text>
                                    </View>

                                    <Text
                                        style={
                                            styles.amount
                                        }
                                    >
                                        ₹
                                        {money(
                                            order.amount
                                        )}
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.paymentBottom
                                    }
                                >
                                    <View
                                        style={
                                            styles.mode
                                        }
                                    >
                                        <Ionicons
                                            name={
                                                order.paymentMode ===
                                                "Online"
                                                    ? "card-outline"
                                                    : "cash-outline"
                                            }
                                            size={15}
                                            color="#64748b"
                                        />

                                        <Text
                                            style={
                                                styles.modeText
                                            }
                                        >
                                            {order.paymentMode ||
                                                "-"}
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.status,

                                            order.paymentStatus ===
                                            "Paid"
                                                ? styles.paid
                                                : styles.unpaid,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,

                                                order.paymentStatus ===
                                                "Paid"
                                                    ? styles.paidText
                                                    : styles.unpaidText,
                                            ]}
                                        >
                                            {
                                                order.paymentStatus
                                            }
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={
                                        styles.actionRow
                                    }
                                >
                                    {order.paymentStatus ===
                                    "Unpaid" ? (
                                        <Pressable
                                            style={
                                                styles.markPaidButton
                                            }
                                            onPress={() =>
                                                openPaymentModal(
                                                    order
                                                )
                                            }
                                        >
                                            <Ionicons
                                                name="checkmark-circle-outline"
                                                size={
                                                    17
                                                }
                                                color="#ffffff"
                                            />

                                            <Text
                                                style={
                                                    styles.markPaidText
                                                }
                                            >
                                                Mark Paid
                                            </Text>
                                        </Pressable>
                                    ) : (
                                        <Pressable
                                            style={
                                                styles.invoiceButton
                                            }
                                            onPress={() =>
                                                router.push(
                                                    `/invoice/${order._id}`
                                                )
                                            }
                                        >
                                            <Ionicons
                                                name="document-text-outline"
                                                size={
                                                    17
                                                }
                                                color="#166534"
                                            />

                                            <Text
                                                style={
                                                    styles.invoiceText
                                                }
                                            >
                                                Invoice
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        )
                    )
                )}
            </ScrollView>

            <Modal
                visible={
                    Boolean(
                        selectedOrder
                    )
                }
                transparent
                animationType="fade"
                onRequestClose={
                    closePaymentModal
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
                                    Mark Payment
                                </Text>

                                <Text
                                    style={
                                        styles.modalSubtitle
                                    }
                                >
                                    {selectedOrder
                                        ?.customerName ||
                                        "Customer"}
                                </Text>
                            </View>

                            <Pressable
                                onPress={
                                    closePaymentModal
                                }
                                disabled={
                                    updating
                                }
                            >
                                <Ionicons
                                    name="close"
                                    size={23}
                                    color="#64748b"
                                />
                            </Pressable>
                        </View>

                        <Text
                            style={
                                styles.modalAmountLabel
                            }
                        >
                            Amount
                        </Text>

                        <Text
                            style={
                                styles.modalAmount
                            }
                        >
                            ₹{" "}
                            {money(
                                selectedOrder
                                    ?.amount
                            )}
                        </Text>

                        <Text
                            style={
                                styles.paymentModeLabel
                            }
                        >
                            Payment Mode
                        </Text>

                        <View
                            style={
                                styles.modeOptions
                            }
                        >
                            <ModeButton
                                title="Cash"
                                icon="cash-outline"
                                active={
                                    selectedMode ===
                                    "Cash"
                                }
                                onPress={() =>
                                    setSelectedMode(
                                        "Cash"
                                    )
                                }
                            />

                            <ModeButton
                                title="Online"
                                icon="card-outline"
                                active={
                                    selectedMode ===
                                    "Online"
                                }
                                onPress={() =>
                                    setSelectedMode(
                                        "Online"
                                    )
                                }
                            />
                        </View>

                        <Pressable
                            style={[
                                styles.confirmButton,

                                updating &&
                                    styles.disabledButton,
                            ]}
                            onPress={
                                markAsPaid
                            }
                            disabled={
                                updating
                            }
                        >
                            {updating ? (
                                <ActivityIndicator
                                    color="#ffffff"
                                />
                            ) : (
                                <>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={
                                            18
                                        }
                                        color="#ffffff"
                                    />

                                    <Text
                                        style={
                                            styles.confirmButtonText
                                        }
                                    >
                                        Confirm Payment
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    );
}

function SummaryCard({
    title,
    amount,
    icon,
    count = false,
}: {
    title: string;
    amount: number;
    icon: keyof typeof Ionicons.glyphMap;
    count?: boolean;
}) {
    return (
        <View style={styles.summary}>
            <View
                style={
                    styles.summaryIcon
                }
            >
                <Ionicons
                    name={icon}
                    size={19}
                    color="#166534"
                />
            </View>

            <Text
                style={
                    styles.summaryTitle
                }
            >
                {title}
            </Text>

            <Text
                style={
                    styles.summaryAmount
                }
                numberOfLines={1}
            >
                {count
                    ? amount
                    : `₹ ${Number(
                          amount || 0
                      ).toLocaleString(
                          "en-IN"
                      )}`}
            </Text>
        </View>
    );
}

function ModeButton({
    title,
    icon,
    active,
    onPress,
}: {
    title: PaymentMode;
    icon: keyof typeof Ionicons.glyphMap;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            style={[
                styles.modeOption,

                active &&
                    styles.modeOptionActive,
            ]}
            onPress={onPress}
        >
            <Ionicons
                name={icon}
                size={19}
                color={
                    active
                        ? "#ffffff"
                        : "#166534"
                }
            />

            <Text
                style={[
                    styles.modeOptionText,

                    active &&
                        styles.modeOptionTextActive,
                ]}
            >
                {title}
            </Text>
        </Pressable>
    );
}

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

    loading: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f8f5",
    },

    loadingText: {
        marginTop: 10,
        color: "#64748b",
        fontSize: 12,
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
    },

    hero: {
        padding: 21,
        marginBottom: 14,
        borderRadius: 21,
        backgroundColor: "#166534",
        elevation: 5,
    },

    heroIcon: {
        width: 43,
        height: 43,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 13,
        backgroundColor:
            "rgba(255,255,255,.15)",
    },

    heroLabel: {
        marginTop: 15,
        color:
            "rgba(255,255,255,.72)",
        fontSize: 11,
        fontWeight: "600",
    },

    heroValue: {
        marginTop: 4,
        color: "#ffffff",
        fontSize: 29,
        fontWeight: "800",
    },

    heroBottom: {
        marginTop: 10,
        color:
            "rgba(255,255,255,.6)",
        fontSize: 9,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent:
            "space-between",
        rowGap: 11,
        marginBottom: 22,
    },

    summary: {
        width: "48.4%",
        minHeight: 118,
        padding: 14,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e2ebe4",
    },

    summaryIcon: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 11,
        backgroundColor: "#ecfdf3",
    },

    summaryTitle: {
        marginTop: 10,
        color: "#64748b",
        fontSize: 9,
        fontWeight: "600",
    },

    summaryAmount: {
        marginTop: 4,
        color: "#17231b",
        fontSize: 15,
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
        backgroundColor: "#ffffff",
    },

    search: {
        flex: 1,
        marginLeft: 9,
        height: "100%",
        color: "#17231b",
        fontSize: 12,
    },

    filters: {
        flexDirection: "row",
        gap: 8,
        marginTop: 13,
        marginBottom: 23,
    },

    filter: {
        paddingHorizontal: 17,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: "#dce8df",
        borderRadius: 30,
        backgroundColor: "#ffffff",
    },

    filterActive: {
        borderColor: "#166534",
        backgroundColor: "#166534",
    },

    filterText: {
        color: "#64748b",
        fontSize: 10,
        fontWeight: "700",
    },

    filterTextActive: {
        color: "#ffffff",
    },

    listHeader: {
        marginBottom: 12,
        flexDirection: "row",
        justifyContent:
            "space-between",
    },

    sectionTitle: {
        color: "#17231b",
        fontSize: 17,
        fontWeight: "800",
    },

    orderCount: {
        color: "#94a3b8",
        fontSize: 9,
    },

    paymentCard: {
        marginBottom: 11,
        padding: 15,
        borderWidth: 1,
        borderColor: "#e2ebe4",
        borderRadius: 17,
        backgroundColor: "#ffffff",
    },

    paymentTop: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: "#dcfce7",
    },

    avatarText: {
        color: "#166534",
        fontSize: 13,
        fontWeight: "800",
    },

    customer: {
        flex: 1,
        minWidth: 0,
        marginLeft: 10,
    },

    customerName: {
        color: "#17231b",
        fontSize: 12,
        fontWeight: "800",
    },

    date: {
        marginTop: 4,
        color: "#94a3b8",
        fontSize: 9,
    },

    amount: {
        marginLeft: 8,
        color: "#17231b",
        fontSize: 14,
        fontWeight: "800",
    },

    paymentBottom: {
        marginTop: 13,
        paddingTop: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent:
            "space-between",
        borderTopWidth: 1,
        borderTopColor: "#edf2ee",
    },

    mode: {
        flexDirection: "row",
        alignItems: "center",
    },

    modeText: {
        marginLeft: 6,
        color: "#64748b",
        fontSize: 10,
        fontWeight: "600",
    },

    status: {
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 20,
    },

    paid: {
        backgroundColor: "#dcfce7",
    },

    unpaid: {
        backgroundColor: "#fee2e2",
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

    actionRow: {
        marginTop: 12,
    },

    markPaidButton: {
        height: 42,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        borderRadius: 11,
        backgroundColor: "#166534",
    },

    markPaidText: {
        color: "#ffffff",
        fontSize: 11,
        fontWeight: "800",
    },

    invoiceButton: {
        height: 42,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        borderRadius: 11,
        backgroundColor: "#ecfdf3",
    },

    invoiceText: {
        color: "#166534",
        fontSize: 11,
        fontWeight: "800",
    },

    empty: {
        paddingVertical: 45,
        alignItems: "center",
        borderRadius: 18,
        backgroundColor: "#ffffff",
    },

    emptyTitle: {
        marginTop: 10,
        color: "#17231b",
        fontSize: 13,
        fontWeight: "800",
    },

    modalOverlay: {
        flex: 1,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor:
            "rgba(15,23,42,0.45)",
    },

    modalCard: {
        width: "100%",
        maxWidth: 420,
        padding: 20,
        borderRadius: 21,
        backgroundColor: "#ffffff",
    },

    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
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
        fontSize: 11,
    },

    modalAmountLabel: {
        marginTop: 23,
        color: "#94a3b8",
        fontSize: 10,
        fontWeight: "600",
    },

    modalAmount: {
        marginTop: 4,
        color: "#166534",
        fontSize: 27,
        fontWeight: "800",
    },

    paymentModeLabel: {
        marginTop: 22,
        marginBottom: 9,
        color: "#374151",
        fontSize: 11,
        fontWeight: "700",
    },

    modeOptions: {
        flexDirection: "row",
        gap: 10,
    },

    modeOption: {
        flex: 1,
        minHeight: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        borderWidth: 1,
        borderColor: "#dce8df",
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },

    modeOptionActive: {
        borderColor: "#166534",
        backgroundColor: "#166534",
    },

    modeOptionText: {
        color: "#166534",
        fontSize: 11,
        fontWeight: "800",
    },

    modeOptionTextActive: {
        color: "#ffffff",
    },

    confirmButton: {
        height: 53,
        marginTop: 22,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        borderRadius: 13,
        backgroundColor: "#166534",
    },

    confirmButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "800",
    },

    disabledButton: {
        opacity: 0.65,
    },
});