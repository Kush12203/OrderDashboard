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
import { Ionicons } from "@expo/vector-icons";

import api from "../../services/api";

type Customer = { 
    customerName: string;
    phone?: string;
    address?: string;

    totalOrders?: number;
    totalWeight?: number;

    totalPurchased?: number;
    paidAmount?: number;
    outstandingAmount?: number;

    lastOrderDate?: string;
};
export default function Customers() {
    const router = useRouter();

    const [customers, setCustomers] =
        useState<Customer[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const loadCustomers = async (
        refresh = false
    ) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response =
    await api.get("/customers");

const rawCustomers =
    Array.isArray(response.data)
        ? response.data
        : response.data?.customers || [];

const normalizedCustomers =
    rawCustomers.map((customer: any) => {
        const orders =
            customer.orders ||
            customer.orderHistory ||
            [];

        const totalAmount =
            customer.totalAmount ??
            customer.totalBusiness ??
            customer.businessAmount ??
            orders.reduce(
                (
                    sum: number,
                    order: any
                ) =>
                    sum +
                    Number(
                        order.amount || 0
                    ),
                0
            );

        const unpaidAmount =
            customer.unpaidAmount ??
            customer.outstanding ??
            customer.outstandingAmount ??
            orders
                .filter(
                    (order: any) =>
                        order.paymentStatus ===
                        "Unpaid"
                )
                .reduce(
                    (
                        sum: number,
                        order: any
                    ) =>
                        sum +
                        Number(
                            order.amount || 0
                        ),
                    0
                );

        const paidAmount =
            customer.paidAmount ??
            orders
                .filter(
                    (order: any) =>
                        order.paymentStatus ===
                        "Paid"
                )
                .reduce(
                    (
                        sum: number,
                        order: any
                    ) =>
                        sum +
                        Number(
                            order.amount || 0
                        ),
                    0
                );

        const totalWeight =
            customer.totalWeight ??
            orders.reduce(
                (
                    sum: number,
                    order: any
                ) =>
                    sum +
                    Number(
                        order.weight || 0
                    ),
                0
            );

        return {
            ...customer,

            totalOrders:
                customer.totalOrders ??
                orders.length,

            totalWeight,
            totalAmount,
            paidAmount,
            unpaidAmount,

            orders,
        };
    });

setCustomers(
    normalizedCustomers
);
        } catch (error: any) {
            console.error(
                "Customers load error:",
                error.response?.data ||
                    error
            );

            Alert.alert(
                "Unable to Load Customers",
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
        loadCustomers();
    }, []);

    const onRefresh = useCallback(() => {
        loadCustomers(true);
    }, []);

    const filteredCustomers =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return customers;
            }

            return customers.filter(
                (customer) =>
                    customer.customerName
                        ?.toLowerCase()
                        .includes(query) ||
                    customer.phone
                        ?.toLowerCase()
                        .includes(query) ||
                    customer.address
                        ?.toLowerCase()
                        .includes(query)
            );
        }, [customers, search]);

    const summary = useMemo(() => {
        const totalCustomers =
            customers.length;

      const totalBusiness =
    customers.reduce(
        (sum, customer) =>
            sum +
            Number(
                customer.totalPurchased || 0
            ),
        0
    );

const outstanding =
    customers.reduce(
        (sum, customer) =>
            sum +
            Number(
                customer.outstandingAmount || 0
            ),
        0
    );

        const totalOrders =
            customers.reduce(
                (sum, customer) =>
                    sum +
                    Number(
                        customer.totalOrders ||
                            0
                    ),
                0
            );

        return {
            totalCustomers,
            totalBusiness,
            outstanding,
            totalOrders,
        };
    }, [customers]);

    const money = (
        value?: number
    ) => {
        return Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2,
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
                    Loading customers...
                </Text>
            </View>
        );
    }

    return (
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
                    onRefresh={onRefresh}
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
                    Customers
                </Text>

                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Customer profiles,
                    business history and
                    outstanding payments.
                </Text>
            </View>

            <View
                style={
                    styles.summaryGrid
                }
            >
                <SummaryCard
                    title="Customers"
                    value={String(
                        summary.totalCustomers
                    )}
                    icon="people-outline"
                />

                <SummaryCard
                    title="Orders"
                    value={String(
                        summary.totalOrders
                    )}
                    icon="receipt-outline"
                />

                <SummaryCard
                    title="Business"
                    value={`₹ ${money(
                        summary.totalBusiness
                    )}`}
                    icon="trending-up-outline"
                />

                <SummaryCard
                    title="Outstanding"
                    value={`₹ ${money(
                        summary.outstanding
                    )}`}
                    icon="time-outline"
                    danger={
                        summary.outstanding >
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
                    name="search"
                    size={18}
                    color="#94a3b8"
                />

                <TextInput
                    style={
                        styles.searchInput
                    }
                    placeholder="Search customer, phone or address"
                    placeholderTextColor="#94a3b8"
                    value={search}
                    onChangeText={
                        setSearch
                    }
                />

                {search.length > 0 && (
                    <Pressable
                        onPress={() =>
                            setSearch("")
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
                    Customer List
                </Text>

                <Text
                    style={
                        styles.listCount
                    }
                >
                    {
                        filteredCustomers.length
                    }{" "}
                    {filteredCustomers.length ===
                    1
                        ? "customer"
                        : "customers"}
                </Text>
            </View>

            {filteredCustomers.length ===
            0 ? (
                <View
                    style={
                        styles.empty
                    }
                >
                    <View
                        style={
                            styles.emptyIcon
                        }
                    >
                        <Ionicons
                            name="people-outline"
                            size={30}
                            color="#166534"
                        />
                    </View>

                    <Text
                        style={
                            styles.emptyTitle
                        }
                    >
                        No customers found
                    </Text>

                    <Text
                        style={
                            styles.emptyText
                        }
                    >
                        Customer profiles are
                        created automatically from
                        order records.
                    </Text>
                </View>
            ) : (
                filteredCustomers.map(
                    (customer) => (
                        <Pressable
                            key={
                                customer.customerName
                            }
                            style={({
                                pressed,
                            }) => [
                                styles.customerCard,

                                pressed &&
                                    styles.customerCardPressed,
                            ]}
                            onPress={() =>
                                router.push(
                                    `/customer/${encodeURIComponent(
                                        customer.customerName
                                    )}`
                                )
                            }
                        >
                            <View
                                style={
                                    styles.customerTop
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
                                        styles.customerIdentity
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
                                            styles.customerContact
                                        }
                                        numberOfLines={
                                            1
                                        }
                                    >
                                        {customer.phone ||
                                            "No phone number"}
                                    </Text>
                                </View>

                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color="#94a3b8"
                                />
                            </View>

                            {customer.address ? (
                                <View
                                    style={
                                        styles.addressRow
                                    }
                                >
                                    <Ionicons
                                        name="location-outline"
                                        size={
                                            14
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
                                            customer.address
                                        }
                                    </Text>
                                </View>
                            ) : null}

                            <View
                                style={
                                    styles.divider
                                }
                            />

                            <View
                                style={
                                    styles.customerStats
                                }
                            >
                                <CustomerStat
                                    label="Orders"
                                    value={String(
                                        customer.totalOrders ||
                                            0
                                    )}
                                />

                                <CustomerStat
                                    label="Weight"
                                    value={`${money(
                                        customer.totalWeight
                                    )} kg`}
                                />

                                <CustomerStat
    label="Business"
    value={`₹ ${money(
        customer.totalPurchased
    )}`}
/>
                            </View>

                            <View
                                style={
                                    styles.bottomRow
                                }
                            >
                                <View>
                                    <Text
                                        style={
                                            styles.lastOrderLabel
                                        }
                                    >
                                        Last Order
                                    </Text>

                                    <Text
                                        style={
                                            styles.lastOrderValue
                                        }
                                    >
                                        {formatDate(
                                            customer.lastOrderDate
                                        )}
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.outstandingBadge,

                                        Number(
    customer.outstandingAmount || 0
) > 0
                                            ? styles.outstandingBadgeDanger
                                            : styles.outstandingBadgeClear,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.outstandingText,

                                            Number(
                                               customer.outstandingAmount ||
                                                    0
                                            ) > 0
                                                ? styles.outstandingTextDanger
                                                : styles.outstandingTextClear,
                                        ]}
                                    >
                                        {Number(
                                            customer.outstandingAmount ||
                                                0
                                        ) > 0
                                            ? `₹ ${money(
                                                  customer.outstandingAmount
                                              )} Due`
                                            : "All Paid"}
                                    </Text>
                                </View>
                            </View>
                        </Pressable>
                    )
                )
            )}
        </ScrollView>
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
                style={[
                    styles.summaryIcon,

                    danger
                        ? styles.summaryIconDanger
                        : styles.summaryIconGreen,
                ]}
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
                style={[
                    styles.summaryValue,

                    danger &&
                        styles.summaryValueDanger,
                ]}
                numberOfLines={1}
            >
                {value}
            </Text>
        </View>
    );
}

function CustomerStat({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <View
            style={
                styles.customerStat
            }
        >
            <Text
                style={
                    styles.customerStatLabel
                }
            >
                {label}
            </Text>

            <Text
                style={
                    styles.customerStatValue
                }
                numberOfLines={1}
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

        loadingContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent:
                "center",
            backgroundColor:
                "#f4f8f5",
        },

        loadingText: {
            marginTop: 12,
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
            maxWidth: 320,
            color: "#64748b",
            fontSize: 12,
            lineHeight: 18,
        },

        summaryGrid: {
            marginBottom: 22,

            flexDirection:
                "row",

            flexWrap: "wrap",

            justifyContent:
                "space-between",

            rowGap: 11,
        },

        summaryCard: {
            width: "48.4%",
            minHeight: 119,
            padding: 14,

            borderWidth: 1,
            borderColor:
                "#e2ebe4",

            borderRadius: 16,

            backgroundColor:
                "#ffffff",
        },

        summaryIcon: {
            width: 36,
            height: 36,

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

            fontSize: 15,
            fontWeight: "800",
        },

        summaryValueDanger: {
            color: "#dc2626",
        },

        searchContainer: {
            height: 52,

            paddingHorizontal: 14,

            flexDirection:
                "row",

            alignItems: "center",

            borderWidth: 1,
            borderColor:
                "#dce8df",

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
            marginTop: 23,
            marginBottom: 12,

            flexDirection:
                "row",

            alignItems: "center",

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
            fontWeight: "600",
        },

        customerCard: {
            marginBottom: 13,
            padding: 15,

            borderWidth: 1,
            borderColor:
                "#e2ebe4",

            borderRadius: 18,

            backgroundColor:
                "#ffffff",

            elevation: 2,
        },

        customerCardPressed: {
            opacity: 0.88,
        },

        customerTop: {
            flexDirection:
                "row",

            alignItems: "center",
        },

        avatar: {
            width: 43,
            height: 43,

            alignItems: "center",
            justifyContent:
                "center",

            borderRadius: 13,

            backgroundColor:
                "#dcfce7",
        },

        avatarText: {
            color: "#166534",

            fontSize: 15,
            fontWeight: "800",
        },

        customerIdentity: {
            flex: 1,
            minWidth: 0,

            marginLeft: 11,
        },

        customerName: {
            color: "#17231b",

            fontSize: 13,
            fontWeight: "800",
        },

        customerContact: {
            marginTop: 4,

            color: "#94a3b8",

            fontSize: 9,
        },

        addressRow: {
            marginTop: 12,

            flexDirection:
                "row",

            alignItems:
                "flex-start",
        },

        addressText: {
            flex: 1,

            marginLeft: 6,

            color: "#64748b",

            fontSize: 9,
            lineHeight: 14,
        },

        divider: {
            height: 1,

            marginVertical: 14,

            backgroundColor:
                "#edf2ee",
        },

        customerStats: {
            flexDirection:
                "row",
        },

        customerStat: {
            flex: 1,
        },

        customerStatLabel: {
            color: "#94a3b8",

            fontSize: 8,
            fontWeight: "600",
        },

        customerStatValue: {
            marginTop: 4,

            paddingRight: 7,

            color: "#17231b",

            fontSize: 11,
            fontWeight: "800",
        },

        bottomRow: {
            marginTop: 15,

            paddingTop: 13,

            flexDirection:
                "row",

            alignItems: "center",

            justifyContent:
                "space-between",

            borderTopWidth: 1,

            borderTopColor:
                "#edf2ee",
        },

        lastOrderLabel: {
            color: "#94a3b8",

            fontSize: 8,
            fontWeight: "600",
        },

        lastOrderValue: {
            marginTop: 3,

            color: "#64748b",

            fontSize: 9,
            fontWeight: "700",
        },

        outstandingBadge: {
            paddingHorizontal: 9,
            paddingVertical: 6,

            borderRadius: 20,
        },

        outstandingBadgeDanger: {
            backgroundColor:
                "#fee2e2",
        },

        outstandingBadgeClear: {
            backgroundColor:
                "#dcfce7",
        },

        outstandingText: {
            fontSize: 8,
            fontWeight: "800",
        },

        outstandingTextDanger: {
            color: "#dc2626",
        },

        outstandingTextClear: {
            color: "#15803d",
        },

        empty: {
            paddingVertical: 50,
            paddingHorizontal: 25,

            alignItems: "center",

            borderWidth: 1,
            borderColor:
                "#e2ebe4",

            borderRadius: 18,

            backgroundColor:
                "#ffffff",
        },

        emptyIcon: {
            width: 56,
            height: 56,

            alignItems: "center",
            justifyContent:
                "center",

            borderRadius: 17,

            backgroundColor:
                "#dcfce7",
        },

        emptyTitle: {
            marginTop: 14,

            color: "#17231b",

            fontSize: 14,
            fontWeight: "800",
        },

        emptyText: {
            marginTop: 6,

            maxWidth: 260,

            color: "#94a3b8",

            fontSize: 10,
            lineHeight: 15,

            textAlign: "center",
        },
    });