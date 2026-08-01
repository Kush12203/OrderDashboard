import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import api from "../../services/api";

type CustomerOrder = {
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
    createdAt?: string;
};

type CustomerDetails = {
    customerName: string;
    phone?: string;
    address?: string;
    totalOrders?: number;
    totalWeight?: number;
    totalAmount?: number;
    paidAmount?: number;
    unpaidAmount?: number;
    orders?: CustomerOrder[];
};

export default function CustomerDetailsScreen() {
    const router = useRouter();

    const params =
        useLocalSearchParams();

    const customerName =
        Array.isArray(
            params.customerName
        )
            ? params.customerName[0]
            : params.customerName;

    const decodedCustomerName =
        customerName
            ? decodeURIComponent(
                  customerName
              )
            : "";

    const [
        customer,
        setCustomer,
    ] =
        useState<CustomerDetails | null>(
            null
        );

    const [loading, setLoading] =
        useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const loadCustomer =
        async (
            refresh = false
        ) => {
            try {
                if (refresh) {
                    setRefreshing(
                        true
                    );
                } else {
                    setLoading(
                        true
                    );
                }

                const response =
    await api.get(
        `/customers/${encodeURIComponent(
            decodedCustomerName
        )}`
    );

console.log(
    "CUSTOMER DETAILS RESPONSE:",
    response.data
);

const responseData =
    response.data;

const profile =
    responseData.customer ||
    responseData.customerDetails ||
    responseData.data ||
    responseData;

const orders =
    responseData.orders ||
    responseData.orderHistory ||
    profile.orders ||
    [];

setCustomer({
    ...profile,

    totalOrders:
        profile.totalOrders ??
        orders.length,

    totalWeight:
        profile.totalWeight ??
        orders.reduce(
            (sum: number, order: any) =>
                sum + Number(order.weight || 0),
            0
        ),

    totalAmount:
        profile.totalAmount ??
        profile.totalBusiness ??
        profile.businessAmount ??
        orders.reduce(
            (sum: number, order: any) =>
                sum + Number(order.amount || 0),
            0
        ),

    paidAmount:
        profile.paidAmount ??
        orders
            .filter(
                (order: any) =>
                    order.paymentStatus === "Paid"
            )
            .reduce(
                (sum: number, order: any) =>
                    sum +
                    Number(order.amount || 0),
                0
            ),

    unpaidAmount:
        profile.unpaidAmount ??
        profile.outstanding ??
        profile.outstandingAmount ??
        orders
            .filter(
                (order: any) =>
                    order.paymentStatus === "Unpaid"
            )
            .reduce(
                (sum: number, order: any) =>
                    sum +
                    Number(order.amount || 0),
                0
            ),

    orders,
});
            } catch (
                error: any
            ) {
                console.error(
                    "Customer details error:",
                    error.response
                        ?.data ||
                        error
                );

                Alert.alert(
                    "Unable to Load Customer",
                    error.response?.data
                        ?.message ||
                        "Customer details could not be loaded."
                );
            } finally {
                setLoading(
                    false
                );

                setRefreshing(
                    false
                );
            }
        };

    useEffect(() => {
        if (
            decodedCustomerName
        ) {
            loadCustomer();
        }
    }, [
        decodedCustomerName,
    ]);

    const onRefresh =
        useCallback(() => {
            loadCustomer(
                true
            );
        }, [
            decodedCustomerName,
        ]);

    const money = (
        value?: number
    ) => {
        return Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits:
                    2,
            }
        );
    };

    const formatDate = (
        value?: string
    ) => {
        if (!value) {
            return "-";
        }

        const date =
            new Date(
                value
            );

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

    const sortedOrders =
        useMemo(() => {
            if (
                !customer?.orders
            ) {
                return [];
            }

            return [
                ...customer.orders,
            ].sort(
                (
                    first,
                    second
                ) => {
                    const firstTime =
                        new Date(
                            first.date ||
                                first.createdAt ||
                                0
                        ).getTime();

                    const secondTime =
                        new Date(
                            second.date ||
                                second.createdAt ||
                                0
                        ).getTime();

                    return (
                        secondTime -
                        firstTime
                    );
                }
            );
        }, [customer]);

    if (
        !decodedCustomerName
    ) {
        return (
            <View
                style={
                    styles.center
                }
            >
                <Text
                    style={
                        styles.errorText
                    }
                >
                    Invalid customer.
                </Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View
                style={
                    styles.center
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
                    Loading customer...
                </Text>
            </View>
        );
    }

    if (!customer) {
        return (
            <View
                style={
                    styles.center
                }
            >
                <Text
                    style={
                        styles.errorText
                    }
                >
                    Customer not found.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={
                styles.screen
            }
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
                        Customer Profile
                    </Text>

                    <Text
                        style={
                            styles.pageSubtitle
                        }
                    >
                        Complete business
                        history
                    </Text>
                </View>
            </View>

            <View
                style={
                    styles.profileCard
                }
            >
                <View
                    style={
                        styles.profileTop
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
                            {customer.customerName
                                ?.charAt(
                                    0
                                )
                                .toUpperCase() ||
                                "C"}
                        </Text>
                    </View>

                    <View
                        style={
                            styles.identity
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
                            {
                                customer.customerName
                            }
                        </Text>

                        <Text
                            style={
                                styles.customerType
                            }
                        >
                            Shivalik Customer
                        </Text>
                    </View>
                </View>

                <View
                    style={
                        styles.contactSection
                    }
                >
                    <ContactRow
                        icon="call-outline"
                        label="Phone"
                        value={
                            customer.phone ||
                            "Not available"
                        }
                    />

                    <ContactRow
                        icon="location-outline"
                        label="Address"
                        value={
                            customer.address ||
                            "Not available"
                        }
                    />
                </View>
            </View>

            <Text
                style={
                    styles.sectionTitle
                }
            >
                Business Summary
            </Text>

            <View
                style={
                    styles.summaryGrid
                }
            >
                <SummaryCard
                    label="Orders"
                    value={String(
                        customer.totalOrders ||
                            0
                    )}
                    icon="receipt-outline"
                />

                <SummaryCard
                    label="Weight"
                    value={`${money(
                        customer.totalWeight
                    )} kg`}
                    icon="scale-outline"
                />

                <SummaryCard
                    label="Business"
                    value={`₹ ${money(
                        customer.totalAmount
                    )}`}
                    icon="trending-up-outline"
                />

                <SummaryCard
                    label="Paid"
                    value={`₹ ${money(
                        customer.paidAmount
                    )}`}
                    icon="checkmark-circle-outline"
                />

                <SummaryCard
                    label="Outstanding"
                    value={`₹ ${money(
                        customer.unpaidAmount
                    )}`}
                    icon="time-outline"
                    danger={
                        Number(
                            customer.unpaidAmount ||
                                0
                        ) > 0
                    }
                />
            </View>

            <View
                style={
                    styles.historyHeader
                }
            >
                <View>
                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Order History
                    </Text>

                    <Text
                        style={
                            styles.sectionSubtitle
                        }
                    >
                        All orders from
                        this customer
                    </Text>
                </View>

                <Text
                    style={
                        styles.orderCount
                    }
                >
                    {
                        sortedOrders.length
                    }{" "}
                    {sortedOrders.length ===
                    1
                        ? "order"
                        : "orders"}
                </Text>
            </View>

            {sortedOrders.length ===
            0 ? (
                <View
                    style={
                        styles.empty
                    }
                >
                    <Ionicons
                        name="receipt-outline"
                        size={30}
                        color="#166534"
                    />

                    <Text
                        style={
                            styles.emptyTitle
                        }
                    >
                        No order history
                    </Text>
                </View>
            ) : (
                sortedOrders.map(
                    (order) => (
                        <View
                            key={
                                order._id
                            }
                            style={
                                styles.orderCard
                            }
                        >
                            <View
                                style={
                                    styles.orderTop
                                }
                            >
                                <View>
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

                                    <Text
                                        style={
                                            styles.orderMeta
                                        }
                                    >
                                        {money(
                                            order.weight
                                        )}{" "}
                                        kg @ ₹
                                        {money(
                                            order.rate
                                        )}
                                        /kg
                                    </Text>
                                </View>

                                <Text
                                    style={
                                        styles.orderAmount
                                    }
                                >
                                    ₹{" "}
                                    {money(
                                        order.amount
                                    )}
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.orderBottom
                                }
                            >
                                <View
                                    style={
                                        styles.paymentMode
                                    }
                                >
                                    <Ionicons
                                        name={
                                            order.paymentMode ===
                                            "Online"
                                                ? "card-outline"
                                                : "cash-outline"
                                        }
                                        size={
                                            14
                                        }
                                        color="#64748b"
                                    />

                                    <Text
                                        style={
                                            styles.paymentModeText
                                        }
                                    >
                                        {order.paymentMode ||
                                            "-"}
                                    </Text>
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

                            {order.paymentStatus ===
                                "Paid" && (
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
                                            16
                                        }
                                        color="#166534"
                                    />

                                    <Text
                                        style={
                                            styles.invoiceText
                                        }
                                    >
                                        View Invoice
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    )
                )
            )}
        </ScrollView>
    );
}

function ContactRow({
    icon,
    label,
    value,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
}) {
    return (
        <View
            style={
                styles.contactRow
            }
        >
            <View
                style={
                    styles.contactIcon
                }
            >
                <Ionicons
                    name={icon}
                    size={16}
                    color="#166534"
                />
            </View>

            <View
                style={
                    styles.contactText
                }
            >
                <Text
                    style={
                        styles.contactLabel
                    }
                >
                    {label}
                </Text>

                <Text
                    style={
                        styles.contactValue
                    }
                    numberOfLines={
                        2
                    }
                >
                    {value}
                </Text>
            </View>
        </View>
    );
}

function SummaryCard({
    label,
    value,
    icon,
    danger = false,
}: {
    label: string;
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
                style={[
                    styles.summaryIcon,

                    danger
                        ? styles.summaryIconDanger
                        : styles.summaryIconGreen,
                ]}
            >
                <Ionicons
                    name={icon}
                    size={18}
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
                {label}
            </Text>

            <Text
                style={[
                    styles.summaryValue,

                    danger &&
                        styles.summaryValueDanger,
                ]}
                numberOfLines={
                    1
                }
            >
                {value}
            </Text>
        </View>
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

        center: {
            flex: 1,
            alignItems: "center",
            justifyContent:
                "center",
            paddingHorizontal: 25,
            backgroundColor:
                "#f4f8f5",
        },

        loadingText: {
            marginTop: 12,
            color: "#64748b",
            fontSize: 12,
        },

        errorText: {
            color: "#dc2626",
            fontSize: 13,
            fontWeight: "700",
        },

        header: {
            marginBottom: 20,
            flexDirection:
                "row",
            alignItems: "center",
        },

        backButton: {
            width: 43,
            height: 43,
            alignItems: "center",
            justifyContent:
                "center",
            borderWidth: 1,
            borderColor:
                "#dce8df",
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

        profileCard: {
            padding: 18,
            borderWidth: 1,
            borderColor:
                "#e2ebe4",
            borderRadius: 20,
            backgroundColor:
                "#ffffff",
            elevation: 3,
        },

        profileTop: {
            flexDirection:
                "row",
            alignItems: "center",
        },

        avatar: {
            width: 58,
            height: 58,
            alignItems: "center",
            justifyContent:
                "center",
            borderRadius: 18,
            backgroundColor:
                "#dcfce7",
        },

        avatarText: {
            color: "#166534",
            fontSize: 21,
            fontWeight: "800",
        },

        identity: {
            flex: 1,
            marginLeft: 14,
        },

        customerName: {
            color: "#17231b",
            fontSize: 19,
            fontWeight: "800",
        },

        customerType: {
            marginTop: 4,
            color: "#94a3b8",
            fontSize: 9,
            fontWeight: "600",
        },

        contactSection: {
            marginTop: 19,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor:
                "#edf2ee",
            gap: 13,
        },

        contactRow: {
            flexDirection:
                "row",
            alignItems:
                "flex-start",
        },

        contactIcon: {
            width: 34,
            height: 34,
            alignItems: "center",
            justifyContent:
                "center",
            borderRadius: 10,
            backgroundColor:
                "#ecfdf3",
        },

        contactText: {
            flex: 1,
            marginLeft: 10,
        },

        contactLabel: {
            color: "#94a3b8",
            fontSize: 8,
            fontWeight: "600",
        },

        contactValue: {
            marginTop: 3,
            color: "#374151",
            fontSize: 10,
            lineHeight: 15,
            fontWeight: "700",
        },

        sectionTitle: {
            marginTop: 24,
            marginBottom: 12,
            color: "#17231b",
            fontSize: 17,
            fontWeight: "800",
        },

        sectionSubtitle: {
            marginTop: -7,
            color: "#94a3b8",
            fontSize: 9,
        },

        summaryGrid: {
            flexDirection:
                "row",
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
            borderColor:
                "#e2ebe4",
            borderRadius: 16,
            backgroundColor:
                "#ffffff",
        },

        summaryIcon: {
            width: 35,
            height: 35,
            alignItems: "center",
            justifyContent:
                "center",
            borderRadius: 11,
        },

        summaryIconGreen: {
            backgroundColor:
                "#ecfdf3",
        },

        summaryIconDanger: {
            backgroundColor:
                "#fef2f2",
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
            fontSize: 14,
            fontWeight: "800",
        },

        summaryValueDanger: {
            color: "#dc2626",
        },

        historyHeader: {
            marginTop: 2,
            marginBottom: 12,
            flexDirection:
                "row",
            alignItems:
                "flex-end",
            justifyContent:
                "space-between",
        },

        orderCount: {
            marginBottom: 12,
            color: "#94a3b8",
            fontSize: 9,
            fontWeight: "600",
        },

        orderCard: {
            marginBottom: 12,
            padding: 15,
            borderWidth: 1,
            borderColor:
                "#e2ebe4",
            borderRadius: 17,
            backgroundColor:
                "#ffffff",
        },

        orderTop: {
            flexDirection:
                "row",
            justifyContent:
                "space-between",
            gap: 12,
        },

        orderDate: {
            color: "#17231b",
            fontSize: 11,
            fontWeight: "800",
        },

        orderMeta: {
            marginTop: 4,
            color: "#94a3b8",
            fontSize: 9,
        },

        orderAmount: {
            color: "#14532d",
            fontSize: 14,
            fontWeight: "800",
        },

        orderBottom: {
            marginTop: 13,
            paddingTop: 12,
            flexDirection:
                "row",
            alignItems: "center",
            justifyContent:
                "space-between",
            borderTopWidth: 1,
            borderTopColor:
                "#edf2ee",
        },

        paymentMode: {
            flexDirection:
                "row",
            alignItems: "center",
        },

        paymentModeText: {
            marginLeft: 6,
            color: "#64748b",
            fontSize: 9,
            fontWeight: "600",
        },

        statusBadge: {
            paddingHorizontal: 9,
            paddingVertical: 5,
            borderRadius: 20,
        },

        paidBadge: {
            backgroundColor:
                "#dcfce7",
        },

        unpaidBadge: {
            backgroundColor:
                "#fee2e2",
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

        invoiceButton: {
            height: 40,
            marginTop: 12,
            flexDirection:
                "row",
            alignItems: "center",
            justifyContent:
                "center",
            gap: 7,
            borderRadius: 11,
            backgroundColor:
                "#ecfdf3",
        },

        invoiceText: {
            color: "#166534",
            fontSize: 10,
            fontWeight: "800",
        },

        empty: {
            paddingVertical: 45,
            alignItems: "center",
            borderWidth: 1,
            borderColor:
                "#e2ebe4",
            borderRadius: 17,
            backgroundColor:
                "#ffffff",
        },

        emptyTitle: {
            marginTop: 10,
            color: "#17231b",
            fontSize: 13,
            fontWeight: "800",
        },
    });