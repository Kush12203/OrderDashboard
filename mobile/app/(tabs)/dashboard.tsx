import {
    ActivityIndicator,
    Dimensions,
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
    Ionicons,
    MaterialIcons,
} from "@expo/vector-icons";

import {
    BarChart,
    LineChart,
    PieChart,
} from "react-native-gifted-charts";

import api from "../../services/api";

type Order = {
    _id: string;
    customerName?: string;
    weight?: number;
    rate?: number;
    amount?: number;
    paymentMode?: "Cash" | "Online";
    paymentStatus?: "Paid" | "Unpaid";
    date?: string;
    createdAt?: string;
};

type CustomerSummary = {
    name: string;
    orders: number;
    weight: number;
    amount: number;
};

type SelectedWeight = {
    month: string;
    weight: number;
};

export default function Dashboard() {
    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [
        selectedWeight,
        setSelectedWeight,
    ] =
        useState<SelectedWeight | null>(
            null
        );

    const screenWidth =
        Dimensions.get("window").width;

    // =====================================
    // LOAD ORDERS
    // =====================================

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
                "Dashboard load error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                    "Unable to load dashboard."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const onRefresh =
        useCallback(() => {
            loadOrders(true);
        }, []);

    // =====================================
    // HELPERS
    // =====================================

    const getOrderDate = (
        order: Order
    ) => {
        const value =
            order.date ||
            order.createdAt;

        if (!value) {
            return null;
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return null;
        }

        return date;
    };

    const formatCurrency = (
        value: number
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
            }
        );
    };

    // =====================================
    // MAIN STATS
    // =====================================

    const stats =
        useMemo(() => {
            let totalAmount = 0;
            let totalPaid = 0;
            let totalUnpaid = 0;
            let totalCash = 0;
            let totalOnline = 0;
            let totalWeight = 0;

            orders.forEach(
                (order) => {
                    const amount =
                        Number(
                            order.amount ||
                                0
                        );

                    const weight =
                        Number(
                            order.weight ||
                                0
                        );

                    totalAmount +=
                        amount;

                    totalWeight +=
                        weight;

                    if (
                        order.paymentStatus ===
                        "Paid"
                    ) {
                        totalPaid +=
                            amount;
                    }

                    if (
                        order.paymentStatus ===
                        "Unpaid"
                    ) {
                        totalUnpaid +=
                            amount;
                    }

                    if (
                        order.paymentMode ===
                        "Cash"
                    ) {
                        totalCash +=
                            amount;
                    }

                    if (
                        order.paymentMode ===
                        "Online"
                    ) {
                        totalOnline +=
                            amount;
                    }
                }
            );

            return {
                totalAmount,
                totalPaid,
                totalUnpaid,
                totalCash,
                totalOnline,
                totalWeight,
                totalOrders:
                    orders.length,
            };
        }, [orders]);

    // =====================================
    // MONTHLY ANALYTICS
    // =====================================

    const monthlyStats =
        useMemo(() => {
            const now =
                new Date();

            const currentMonth =
                now.getMonth();

            const currentYear =
                now.getFullYear();

            const previous =
                new Date(
                    currentYear,
                    currentMonth - 1,
                    1
                );

            const previousMonth =
                previous.getMonth();

            const previousYear =
                previous.getFullYear();

            let thisMonthRevenue =
                0;

            let lastMonthRevenue =
                0;

            let thisMonthOrders =
                0;

            let lastMonthOrders =
                0;

            orders.forEach(
                (order) => {
                    const date =
                        getOrderDate(
                            order
                        );

                    if (!date) {
                        return;
                    }

                    const amount =
                        Number(
                            order.amount ||
                                0
                        );

                    if (
                        date.getMonth() ===
                            currentMonth &&
                        date.getFullYear() ===
                            currentYear
                    ) {
                        thisMonthRevenue +=
                            amount;

                        thisMonthOrders +=
                            1;
                    }

                    if (
                        date.getMonth() ===
                            previousMonth &&
                        date.getFullYear() ===
                            previousYear
                    ) {
                        lastMonthRevenue +=
                            amount;

                        lastMonthOrders +=
                            1;
                    }
                }
            );

            let growth = 0;

            if (
                lastMonthRevenue > 0
            ) {
                growth =
                    ((thisMonthRevenue -
                        lastMonthRevenue) /
                        lastMonthRevenue) *
                    100;
            } else if (
                thisMonthRevenue > 0
            ) {
                growth = 100;
            }

            const averageOrder =
                orders.length > 0
                    ? stats.totalAmount /
                      orders.length
                    : 0;

            return {
                thisMonthRevenue,
                lastMonthRevenue,
                thisMonthOrders,
                lastMonthOrders,
                growth,
                averageOrder,
            };
        }, [
            orders,
            stats.totalAmount,
        ]);

    // =====================================
    // MONTHLY CHART DATA
    // =====================================

    const monthlyChart =
        useMemo(() => {
            const months: {
                label: string;
                revenue: number;
                weight: number;
            }[] = [];

            const now =
                new Date();

            for (
                let offset = 5;
                offset >= 0;
                offset--
            ) {
                const date =
                    new Date(
                        now.getFullYear(),
                        now.getMonth() -
                            offset,
                        1
                    );

                const month =
                    date.getMonth();

                const year =
                    date.getFullYear();

                let revenue = 0;
                let weight = 0;

                orders.forEach(
                    (order) => {
                        const orderDate =
                            getOrderDate(
                                order
                            );

                        if (
                            !orderDate
                        ) {
                            return;
                        }

                        if (
                            orderDate.getMonth() ===
                                month &&
                            orderDate.getFullYear() ===
                                year
                        ) {
                            revenue +=
                                Number(
                                    order.amount ||
                                        0
                                );

                            weight +=
                                Number(
                                    order.weight ||
                                        0
                                );
                        }
                    }
                );

                months.push({
                    label:
                        date.toLocaleDateString(
                            "en-US",
                            {
                                month:
                                    "short",
                            }
                        ),

                    revenue,
                    weight,
                });
            }

            return months;
        }, [orders]);

    // =====================================
    // REVENUE CHART
    // =====================================

    const revenueData =
        monthlyChart.map(
            (month) => ({
                value:
                    month.revenue,

                label:
                    month.label,
            })
        );

    // =====================================
    // WEIGHT CHART
    // =====================================

    const weightData =
        monthlyChart.map(
            (month) => ({
                value:
                    month.weight,

                label:
                    month.label,

                onPress: () => {
                    setSelectedWeight({
                        month:
                            month.label,

                        weight:
                            month.weight,
                    });
                },
            })
        );

    // =====================================
    // PIE CHARTS
    // =====================================

    const paymentModeData = [
        {
            value:
                stats.totalCash,

            color:
                "#f59e0b",

            text:
                "Cash",
        },

        {
            value:
                stats.totalOnline,

            color:
                "#3b82f6",

            text:
                "Online",
        },
    ];

    const paymentStatusData = [
        {
            value:
                stats.totalPaid,

            color:
                "#22c55e",

            text:
                "Paid",
        },

        {
            value:
                stats.totalUnpaid,

            color:
                "#ef4444",

            text:
                "Unpaid",
        },
    ];

    // =====================================
    // TOP CUSTOMERS
    // =====================================

    const topCustomers =
        useMemo(() => {
            const map =
                new Map<
                    string,
                    CustomerSummary
                >();

            orders.forEach(
                (order) => {
                    const name =
                        (
                            order.customerName ||
                            "Unknown"
                        ).trim();

                    const key =
                        name.toLowerCase();

                    const existing =
                        map.get(key);

                    if (existing) {
                        existing.orders +=
                            1;

                        existing.weight +=
                            Number(
                                order.weight ||
                                    0
                            );

                        existing.amount +=
                            Number(
                                order.amount ||
                                    0
                            );
                    } else {
                        map.set(
                            key,
                            {
                                name,

                                orders:
                                    1,

                                weight:
                                    Number(
                                        order.weight ||
                                            0
                                    ),

                                amount:
                                    Number(
                                        order.amount ||
                                            0
                                    ),
                            }
                        );
                    }
                }
            );

            return Array.from(
                map.values()
            )
                .sort(
                    (a, b) =>
                        b.amount -
                        a.amount
                )
                .slice(0, 5);
        }, [orders]);

    // =====================================
    // RECENT ORDERS
    // =====================================

    const recentOrders =
        useMemo(() => {
            return [...orders]
                .sort(
                    (a, b) => {
                        const first =
                            getOrderDate(
                                a
                            )?.getTime() ||
                            0;

                        const second =
                            getOrderDate(
                                b
                            )?.getTime() ||
                            0;

                        return (
                            second -
                            first
                        );
                    }
                )
                .slice(0, 5);
        }, [orders]);

    // =====================================
    // LOADING
    // =====================================

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
                    Loading dashboard...
                </Text>
            </View>
        );
    }

    // =====================================
    // UI
    // =====================================

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
            {/* HEADER */}

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
                    SHIVALIK DRAGON FARM
                </Text>

                <Text
                    style={
                        styles.title
                    }
                >
                    Dashboard
                </Text>

                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Overview of your
                    orders, payments and
                    sales.
                </Text>
            </View>

            {/* ERROR */}

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

            {/* TOTAL SALES */}

            <View
                style={
                    styles.heroCard
                }
            >
                <View
                    style={
                        styles.heroIcon
                    }
                >
                    <MaterialIcons
                        name="currency-rupee"
                        size={24}
                        color="#ffffff"
                    />
                </View>

                <Text
                    style={
                        styles.heroLabel
                    }
                >
                    Total Sales
                </Text>

                <Text
                    style={
                        styles.heroAmount
                    }
                >
                    ₹{" "}
                    {formatCurrency(
                        stats.totalAmount
                    )}
                </Text>

                <View
                    style={
                        styles.heroFooter
                    }
                >
                    <Text
                        style={
                            styles.heroFooterText
                        }
                    >
                        {
                            stats.totalOrders
                        }{" "}
                        total orders
                    </Text>

                    <Text
                        style={
                            styles.heroFooterText
                        }
                    >
                        {formatCurrency(
                            stats.totalWeight
                        )}{" "}
                        kg sold
                    </Text>
                </View>
            </View>

            {/* OVERVIEW */}

            <Text
                style={
                    styles.sectionTitle
                }
            >
                Overview
            </Text>

            <View
                style={
                    styles.statsGrid
                }
            >
                <StatCard
                    title="Paid"
                    value={`₹ ${formatCurrency(
                        stats.totalPaid
                    )}`}
                    icon="checkmark-circle"
                    background="#ecfdf3"
                    iconColor="#16a34a"
                />

                <StatCard
                    title="Unpaid"
                    value={`₹ ${formatCurrency(
                        stats.totalUnpaid
                    )}`}
                    icon="time"
                    background="#fff1f2"
                    iconColor="#dc2626"
                />

                <StatCard
                    title="Cash"
                    value={`₹ ${formatCurrency(
                        stats.totalCash
                    )}`}
                    icon="cash"
                    background="#fffbeb"
                    iconColor="#ca8a04"
                />

                <StatCard
                    title="Online"
                    value={`₹ ${formatCurrency(
                        stats.totalOnline
                    )}`}
                    icon="card"
                    background="#ecfeff"
                    iconColor="#0f766e"
                />

                <StatCard
                    title="Orders"
                    value={String(
                        stats.totalOrders
                    )}
                    icon="bag"
                    background="#f0fdf4"
                    iconColor="#15803d"
                />

                <StatCard
                    title="Weight"
                    value={`${formatCurrency(
                        stats.totalWeight
                    )} kg`}
                    icon="scale"
                    background="#f7fee7"
                    iconColor="#65a30d"
                />
            </View>

            {/* BUSINESS ANALYTICS */}

            <Text
                style={
                    styles.sectionTitle
                }
            >
                Business Analytics
            </Text>

            <View
                style={
                    styles.statsGrid
                }
            >
                <StatCard
                    title="Revenue This Month"
                    value={`₹ ${formatCurrency(
                        monthlyStats.thisMonthRevenue
                    )}`}
                    icon="wallet"
                    background="#ecfdf3"
                    iconColor="#166534"
                />

                <StatCard
                    title="Revenue Last Month"
                    value={`₹ ${formatCurrency(
                        monthlyStats.lastMonthRevenue
                    )}`}
                    icon="stats-chart"
                    background="#ecfeff"
                    iconColor="#0f766e"
                />

                <StatCard
                    title="Monthly Growth"
                    value={`${monthlyStats.growth >= 0 ? "+" : ""}${monthlyStats.growth.toFixed(
                        1
                    )}%`}
                    icon={
                        monthlyStats.growth >=
                        0
                            ? "trending-up"
                            : "trending-down"
                    }
                    background={
                        monthlyStats.growth >=
                        0
                            ? "#ecfdf3"
                            : "#fff1f2"
                    }
                    iconColor={
                        monthlyStats.growth >=
                        0
                            ? "#16a34a"
                            : "#dc2626"
                    }
                />

                <StatCard
                    title="Average Order"
                    value={`₹ ${formatCurrency(
                        monthlyStats.averageOrder
                    )}`}
                    icon="calculator"
                    background="#f7fee7"
                    iconColor="#65a30d"
                />
            </View>

            {/* REVENUE TREND */}

            <ChartCard
                title="Revenue Trend"
                subtitle="Monthly order revenue"
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                        false
                    }
                >
                    <LineChart
                        data={
                            revenueData
                        }
                        width={Math.max(
                            screenWidth -
                                75,
                            420
                        )}
                        height={190}
                        thickness={3}
                        color="#4f46e5"
                        dataPointsColor="#4f46e5"
                        curved
                        hideRules={false}
                        rulesColor="#edf2ee"
                        yAxisColor="transparent"
                        xAxisColor="#e2e8f0"
                        yAxisTextStyle={{
                            color:
                                "#94a3b8",

                            fontSize:
                                8,
                        }}
                        xAxisLabelTextStyle={{
                            color:
                                "#64748b",

                            fontSize:
                                9,
                        }}
                        noOfSections={4}
                        initialSpacing={15}
                        spacing={70}
                    />
                </ScrollView>
            </ChartCard>

            {/* WEIGHT SOLD */}

            <ChartCard
                title="Weight Sold"
                subtitle="Tap any bar to view the exact weight"
            >
                {selectedWeight ? (
                    <View
                        style={
                            styles.weightPopup
                        }
                    >
                        <View
                            style={
                                styles.weightPopupIcon
                            }
                        >
                            <Ionicons
                                name="scale-outline"
                                size={18}
                                color="#0f766e"
                            />
                        </View>

                        <View
                            style={{
                                flex: 1,
                            }}
                        >
                            <Text
                                style={
                                    styles.weightPopupMonth
                                }
                            >
                                {
                                    selectedWeight.month
                                }
                            </Text>

                            <Text
                                style={
                                    styles.weightPopupValue
                                }
                            >
                                {formatCurrency(
                                    selectedWeight.weight
                                )}{" "}
                                kg
                            </Text>

                            <Text
                                style={
                                    styles.weightPopupLabel
                                }
                            >
                                Weight sold
                            </Text>
                        </View>
                    </View>
                ) : null}

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                        false
                    }
                >
                    <BarChart
                        data={
                            weightData
                        }
                        width={Math.max(
                            screenWidth -
                                75,
                            420
                        )}
                        height={190}
                        barWidth={27}
                        spacing={43}
                        frontColor="#0f766e"
                        roundedTop
                        hideRules={false}
                        rulesColor="#edf2ee"
                        yAxisColor="transparent"
                        xAxisColor="#e2e8f0"
                        yAxisTextStyle={{
                            color:
                                "#94a3b8",

                            fontSize:
                                8,
                        }}
                        xAxisLabelTextStyle={{
                            color:
                                "#64748b",

                            fontSize:
                                9,
                        }}
                        noOfSections={4}
                        initialSpacing={18}
                    />
                </ScrollView>

                <View
                    style={
                        styles.tapHint
                    }
                >
                    <Ionicons
                        name="finger-print-outline"
                        size={13}
                        color="#94a3b8"
                    />

                    <Text
                        style={
                            styles.tapHintText
                        }
                    >
                        Tap a bar to see
                        weight sold
                    </Text>
                </View>
            </ChartCard>

            {/* PAYMENT MODE */}

            <ChartCard
                title="Payment Mode"
                subtitle="Cash and online distribution"
            >
                <View
                    style={
                        styles.pieContainer
                    }
                >
                    <PieChart
                        data={
                            paymentModeData
                        }
                        donut
                        radius={85}
                        innerRadius={55}
                        centerLabelComponent={() => (
                            <View
                                style={
                                    styles.pieCenter
                                }
                            >
                                <Text
                                    style={
                                        styles.pieCenterValue
                                    }
                                >
                                    {
                                        stats.totalOrders
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.pieCenterLabel
                                    }
                                >
                                    Orders
                                </Text>
                            </View>
                        )}
                    />

                    <View
                        style={
                            styles.legend
                        }
                    >
                        <LegendItem
                            color="#f59e0b"
                            label="Cash"
                            value={`₹ ${formatCurrency(
                                stats.totalCash
                            )}`}
                        />

                        <LegendItem
                            color="#3b82f6"
                            label="Online"
                            value={`₹ ${formatCurrency(
                                stats.totalOnline
                            )}`}
                        />
                    </View>
                </View>
            </ChartCard>

            {/* PAYMENT STATUS */}

            <ChartCard
                title="Payment Status"
                subtitle="Paid and unpaid order amounts"
            >
                <View
                    style={
                        styles.pieContainer
                    }
                >
                    <PieChart
                        data={
                            paymentStatusData
                        }
                        donut
                        radius={85}
                        innerRadius={55}
                        centerLabelComponent={() => (
                            <View
                                style={
                                    styles.pieCenter
                                }
                            >
                                <Text
                                    style={
                                        styles.pieCenterValue
                                    }
                                    numberOfLines={
                                        1
                                    }
                                >
                                    ₹
                                    {formatCurrency(
                                        stats.totalAmount
                                    )}
                                </Text>

                                <Text
                                    style={
                                        styles.pieCenterLabel
                                    }
                                >
                                    Total
                                </Text>
                            </View>
                        )}
                    />

                    <View
                        style={
                            styles.legend
                        }
                    >
                        <LegendItem
                            color="#22c55e"
                            label="Paid"
                            value={`₹ ${formatCurrency(
                                stats.totalPaid
                            )}`}
                        />

                        <LegendItem
                            color="#ef4444"
                            label="Unpaid"
                            value={`₹ ${formatCurrency(
                                stats.totalUnpaid
                            )}`}
                        />
                    </View>
                </View>
            </ChartCard>

            {/* TOP CUSTOMERS */}

            <View
                style={
                    styles.sectionHeader
                }
            >
                <Text
                    style={
                        styles.sectionTitle
                    }
                >
                    Top Customers
                </Text>

                <Text
                    style={
                        styles.sectionSubtitle
                    }
                >
                    Highest total order
                    value
                </Text>
            </View>

            <View
                style={
                    styles.customerCard
                }
            >
                {topCustomers.length ===
                0 ? (
                    <Text
                        style={
                            styles.emptyText
                        }
                    >
                        No customer data.
                    </Text>
                ) : (
                    topCustomers.map(
                        (
                            customer,
                            index
                        ) => (
                            <View
                                key={
                                    `${customer.name}-${index}`
                                }
                                style={[
                                    styles.topCustomerRow,

                                    index !==
                                        topCustomers.length -
                                            1 &&
                                        styles.rowBorder,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.rankBadge,

                                        index ===
                                            0 &&
                                            styles.firstRankBadge,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.rankText,

                                            index ===
                                                0 &&
                                                styles.firstRankText,
                                        ]}
                                    >
                                        #
                                        {index +
                                            1}
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
                                        {
                                            customer.name
                                        }
                                    </Text>

                                    <Text
                                        style={
                                            styles.customerMeta
                                        }
                                    >
                                        {
                                            customer.orders
                                        }{" "}
                                        orders •{" "}
                                        {formatCurrency(
                                            customer.weight
                                        )}{" "}
                                        kg
                                    </Text>
                                </View>

                                <Text
                                    style={
                                        styles.customerAmount
                                    }
                                    numberOfLines={
                                        1
                                    }
                                >
                                    ₹{" "}
                                    {formatCurrency(
                                        customer.amount
                                    )}
                                </Text>
                            </View>
                        )
                    )
                )}
            </View>

            {/* RECENT ORDERS */}

            <View
                style={
                    styles.sectionHeader
                }
            >
                <Text
                    style={
                        styles.sectionTitle
                    }
                >
                    Recent Orders
                </Text>

                <Text
                    style={
                        styles.sectionSubtitle
                    }
                >
                    Latest customer orders
                </Text>
            </View>

            <View
                style={
                    styles.recentCard
                }
            >
                {recentOrders.length ===
                0 ? (
                    <Text
                        style={
                            styles.emptyText
                        }
                    >
                        No orders available.
                    </Text>
                ) : (
                    recentOrders.map(
                        (
                            order,
                            index
                        ) => (
                            <View
                                key={
                                    order._id
                                }
                                style={[
                                    styles.orderRow,

                                    index !==
                                        recentOrders.length -
                                            1 &&
                                        styles.orderRowBorder,
                                ]}
                            >
                                <View
                                    style={
                                        styles.customerAvatar
                                    }
                                >
                                    <Text
                                        style={
                                            styles.customerAvatarText
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
                                        styles.orderDetails
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
                                            styles.orderMeta
                                        }
                                    >
                                        {formatDate(
                                            order.date ||
                                                order.createdAt
                                        )}{" "}
                                        •{" "}
                                        {order.weight ||
                                            0}{" "}
                                        kg
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.orderAmountSection
                                    }
                                >
                                    <Text
                                        style={
                                            styles.orderAmount
                                        }
                                    >
                                        ₹{" "}
                                        {formatCurrency(
                                            Number(
                                                order.amount ||
                                                    0
                                            )
                                        )}
                                    </Text>

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
                            </View>
                        )
                    )
                )}
            </View>
        </ScrollView>
    );
}

// =====================================
// STAT CARD
// =====================================

type StatCardProps = {
    title: string;
    value: string;
    icon:
        keyof typeof Ionicons.glyphMap;
    background: string;
    iconColor: string;
};

function StatCard({
    title,
    value,
    icon,
    background,
    iconColor,
}: StatCardProps) {
    return (
        <View
            style={
                styles.statCard
            }
        >
            <View
                style={[
                    styles.statIcon,

                    {
                        backgroundColor:
                            background,
                    },
                ]}
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color={
                        iconColor
                    }
                />
            </View>

            <Text
                style={
                    styles.statLabel
                }
                numberOfLines={
                    2
                }
            >
                {title}
            </Text>

            <Text
                style={
                    styles.statValue
                }
                numberOfLines={
                    1
                }
            >
                {value}
            </Text>
        </View>
    );
}

// =====================================
// CHART CARD
// =====================================

function ChartCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <View
            style={
                styles.chartCard
            }
        >
            <Text
                style={
                    styles.chartTitle
                }
            >
                {title}
            </Text>

            <Text
                style={
                    styles.chartSubtitle
                }
            >
                {subtitle}
            </Text>

            <View
                style={
                    styles.chartContent
                }
            >
                {children}
            </View>
        </View>
    );
}

// =====================================
// LEGEND
// =====================================

function LegendItem({
    color,
    label,
    value,
}: {
    color: string;
    label: string;
    value: string;
}) {
    return (
        <View
            style={
                styles.legendItem
            }
        >
            <View
                style={[
                    styles.legendDot,

                    {
                        backgroundColor:
                            color,
                    },
                ]}
            />

            <View
                style={{
                    flex: 1,
                }}
            >
                <Text
                    style={
                        styles.legendLabel
                    }
                >
                    {label}
                </Text>

                <Text
                    style={
                        styles.legendValue
                    }
                    numberOfLines={
                        1
                    }
                >
                    {value}
                </Text>
            </View>
        </View>
    );
}

// =====================================
// STYLES
// =====================================

const styles =
    StyleSheet.create({
        screen: {
            flex: 1,

            backgroundColor:
                "#f4f8f5",
        },

        content: {
            paddingTop: 55,

            paddingHorizontal:
                17,

            paddingBottom:
                35,
        },

        header: {
            marginBottom:
                22,
        },

        eyebrow: {
            color:
                "#15803d",

            fontSize:
                10,

            fontWeight:
                "800",

            letterSpacing:
                1,
        },

        title: {
            marginTop:
                6,

            color:
                "#142019",

            fontSize:
                31,

            fontWeight:
                "800",
        },

        subtitle: {
            marginTop:
                6,

            color:
                "#64748b",

            fontSize:
                13,

            lineHeight:
                20,
        },

        errorBox: {
            marginBottom:
                16,

            padding:
                13,

            borderRadius:
                12,

            backgroundColor:
                "#fef2f2",

            borderWidth:
                1,

            borderColor:
                "#fecaca",
        },

        errorText: {
            color:
                "#b91c1c",

            fontSize:
                12,

            fontWeight:
                "600",
        },

        heroCard: {
            marginBottom:
                27,

            padding:
                22,

            borderRadius:
                22,

            backgroundColor:
                "#166534",

            shadowColor:
                "#14532d",

            shadowOpacity:
                0.2,

            shadowRadius:
                18,

            shadowOffset: {
                width:
                    0,

                height:
                    9,
            },

            elevation:
                7,
        },

        heroIcon: {
            width:
                46,

            height:
                46,

            marginBottom:
                17,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                14,

            backgroundColor:
                "rgba(255,255,255,0.15)",
        },

        heroLabel: {
            color:
                "rgba(255,255,255,0.72)",

            fontSize:
                12,

            fontWeight:
                "600",
        },

        heroAmount: {
            marginTop:
                5,

            color:
                "#ffffff",

            fontSize:
                31,

            fontWeight:
                "800",
        },

        heroFooter: {
            marginTop:
                18,

            flexDirection:
                "row",

            justifyContent:
                "space-between",
        },

        heroFooterText: {
            color:
                "rgba(255,255,255,0.68)",

            fontSize:
                10,

            fontWeight:
                "600",
        },

        sectionHeader: {
            marginTop:
                8,

            marginBottom:
                12,
        },

        sectionTitle: {
            marginBottom:
                12,

            color:
                "#17231b",

            fontSize:
                18,

            fontWeight:
                "800",
        },

        sectionSubtitle: {
            marginTop:
                -7,

            color:
                "#94a3b8",

            fontSize:
                11,
        },

        statsGrid: {
            marginBottom:
                27,

            flexDirection:
                "row",

            flexWrap:
                "wrap",

            justifyContent:
                "space-between",

            rowGap:
                12,
        },

        statCard: {
            width:
                "48.4%",

            minHeight:
                126,

            padding:
                15,

            borderRadius:
                17,

            backgroundColor:
                "#ffffff",

            borderWidth:
                1,

            borderColor:
                "#e4ece6",

            shadowColor:
                "#14532d",

            shadowOpacity:
                0.045,

            shadowRadius:
                10,

            elevation:
                2,
        },

        statIcon: {
            width:
                38,

            height:
                38,

            marginBottom:
                13,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                11,
        },

        statLabel: {
            minHeight:
                25,

            color:
                "#718077",

            fontSize:
                10,

            fontWeight:
                "600",
        },

        statValue: {
            marginTop:
                5,

            color:
                "#17231b",

            fontSize:
                15,

            fontWeight:
                "800",
        },

        chartCard: {
            marginBottom:
                18,

            padding:
                16,

            overflow:
                "hidden",

            borderRadius:
                18,

            borderWidth:
                1,

            borderColor:
                "#e4ece6",

            backgroundColor:
                "#ffffff",

            shadowColor:
                "#14532d",

            shadowOpacity:
                0.04,

            shadowRadius:
                10,

            elevation:
                2,
        },

        chartTitle: {
            color:
                "#17231b",

            fontSize:
                15,

            fontWeight:
                "800",
        },

        chartSubtitle: {
            marginTop:
                3,

            color:
                "#94a3b8",

            fontSize:
                9,
        },

        chartContent: {
            marginTop:
                22,
        },

        // =========================
        // WEIGHT POPUP
        // =========================

        weightPopup: {
            width:
                "100%",

            marginBottom:
                18,

            padding:
                13,

            flexDirection:
                "row",

            alignItems:
                "center",

            borderWidth:
                1,

            borderColor:
                "#ccfbf1",

            borderRadius:
                14,

            backgroundColor:
                "#f0fdfa",
        },

        weightPopupIcon: {
            width:
                40,

            height:
                40,

            marginRight:
                11,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                12,

            backgroundColor:
                "#ccfbf1",
        },

        weightPopupMonth: {
            color:
                "#64748b",

            fontSize:
                9,

            fontWeight:
                "700",
        },

        weightPopupValue: {
            marginTop:
                2,

            color:
                "#0f766e",

            fontSize:
                18,

            fontWeight:
                "800",
        },

        weightPopupLabel: {
            marginTop:
                2,

            color:
                "#94a3b8",

            fontSize:
                8,
        },

        tapHint: {
            marginTop:
                12,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "center",

            gap:
                5,
        },

        tapHintText: {
            color:
                "#94a3b8",

            fontSize:
                8,

            fontWeight:
                "600",
        },

        // =========================
        // PIE
        // =========================

        pieContainer: {
            alignItems:
                "center",
        },

        pieCenter: {
            maxWidth:
                100,

            alignItems:
                "center",
        },

        pieCenterValue: {
            color:
                "#17231b",

            fontSize:
                11,

            fontWeight:
                "800",
        },

        pieCenterLabel: {
            marginTop:
                2,

            color:
                "#94a3b8",

            fontSize:
                8,
        },

        legend: {
            width:
                "100%",

            marginTop:
                22,

            flexDirection:
                "row",

            gap:
                12,
        },

        legendItem: {
            flex:
                1,

            padding:
                11,

            flexDirection:
                "row",

            alignItems:
                "center",

            borderRadius:
                11,

            backgroundColor:
                "#f8faf9",
        },

        legendDot: {
            width:
                9,

            height:
                9,

            marginRight:
                8,

            borderRadius:
                10,
        },

        legendLabel: {
            color:
                "#64748b",

            fontSize:
                8,
        },

        legendValue: {
            marginTop:
                2,

            color:
                "#17231b",

            fontSize:
                10,

            fontWeight:
                "800",
        },

        // =========================
        // TOP CUSTOMERS
        // =========================

        customerCard: {
            marginBottom:
                27,

            overflow:
                "hidden",

            borderRadius:
                18,

            backgroundColor:
                "#ffffff",

            borderWidth:
                1,

            borderColor:
                "#e4ece6",
        },

        topCustomerRow: {
            minHeight:
                72,

            padding:
                13,

            flexDirection:
                "row",

            alignItems:
                "center",
        },

        rowBorder: {
            borderBottomWidth:
                1,

            borderBottomColor:
                "#edf2ee",
        },

        rankBadge: {
            width:
                35,

            height:
                35,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                11,

            backgroundColor:
                "#ecfdf3",
        },

        firstRankBadge: {
            backgroundColor:
                "#fef3c7",
        },

        rankText: {
            color:
                "#166534",

            fontSize:
                10,

            fontWeight:
                "800",
        },

        firstRankText: {
            color:
                "#b45309",
        },

        customerInfo: {
            flex:
                1,

            minWidth:
                0,

            marginLeft:
                11,
        },

        customerMeta: {
            marginTop:
                4,

            color:
                "#94a3b8",

            fontSize:
                9,
        },

        customerAmount: {
            marginLeft:
                8,

            color:
                "#15803d",

            fontSize:
                11,

            fontWeight:
                "800",
        },

        // =========================
        // RECENT ORDERS
        // =========================

        recentCard: {
            overflow:
                "hidden",

            borderRadius:
                18,

            backgroundColor:
                "#ffffff",

            borderWidth:
                1,

            borderColor:
                "#e4ece6",
        },

        orderRow: {
            minHeight:
                82,

            paddingHorizontal:
                14,

            paddingVertical:
                13,

            flexDirection:
                "row",

            alignItems:
                "center",
        },

        orderRowBorder: {
            borderBottomWidth:
                1,

            borderBottomColor:
                "#edf2ee",
        },

        customerAvatar: {
            width:
                42,

            height:
                42,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                13,

            backgroundColor:
                "#dcfce7",
        },

        customerAvatarText: {
            color:
                "#166534",

            fontSize:
                14,

            fontWeight:
                "800",
        },

        orderDetails: {
            flex:
                1,

            minWidth:
                0,

            marginLeft:
                12,
        },

        customerName: {
            color:
                "#17231b",

            fontSize:
                13,

            fontWeight:
                "700",
        },

        orderMeta: {
            marginTop:
                5,

            color:
                "#94a3b8",

            fontSize:
                10,
        },

        orderAmountSection: {
            marginLeft:
                8,

            alignItems:
                "flex-end",
        },

        orderAmount: {
            color:
                "#17231b",

            fontSize:
                12,

            fontWeight:
                "800",
        },

        statusBadge: {
            marginTop:
                7,

            paddingHorizontal:
                8,

            paddingVertical:
                4,

            borderRadius:
                20,
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
            fontSize:
                8,

            fontWeight:
                "800",
        },

        paidText: {
            color:
                "#15803d",
        },

        unpaidText: {
            color:
                "#dc2626",
        },

        emptyText: {
            padding:
                30,

            color:
                "#94a3b8",

            textAlign:
                "center",

            fontSize:
                12,
        },

        loadingContainer: {
            flex:
                1,

            alignItems:
                "center",

            justifyContent:
                "center",

            backgroundColor:
                "#f4f8f5",
        },

        loadingText: {
            marginTop:
                12,

            color:
                "#64748b",

            fontSize:
                12,
        },
    });