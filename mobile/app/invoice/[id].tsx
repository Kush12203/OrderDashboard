import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    useEffect,
    useState,
} from "react";

import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";

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
    createdAt?: string;
};

export default function InvoiceScreen() {
    const router = useRouter();

    const params =
        useLocalSearchParams();

    const orderId =
        Array.isArray(params.id)
            ? params.id[0]
            : params.id;

    const [order, setOrder] =
        useState<Order | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [printing, setPrinting] =
        useState(false);

    useEffect(() => {
        if (orderId) {
            loadOrder();
        }
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);

            const response =
                await api.get(
                    `/orders/${orderId}`
                );

            const data: Order =
                response.data;

            if (!data?._id) {
                throw new Error(
                    "Invoice data not found."
                );
            }

            setOrder(data);
        } catch (error: any) {
            console.error(
                "Invoice load error:",
                error.response?.data ||
                    error
            );

            Alert.alert(
                "Unable to Load Invoice",
                error.response?.data
                    ?.message ||
                    error.message ||
                    "Invoice could not be loaded.",
                [
                    {
                        text: "Back",
                        onPress: () =>
                            router.back(),
                    },
                ]
            );
        } finally {
            setLoading(false);
        }
    };

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

    const getInvoiceNumber =
        () => {
            if (!order) {
                return "-";
            }

            const date =
                new Date(
                    order.date ||
                        order.createdAt ||
                        new Date()
                );

            const year =
                date.getFullYear();

            const month =
                String(
                    date.getMonth() +
                        1
                ).padStart(
                    2,
                    "0"
                );

            const day =
                String(
                    date.getDate()
                ).padStart(
                    2,
                    "0"
                );

            const shortId =
                order._id
                    .slice(-5)
                    .toUpperCase();

            return `INV-${year}${month}${day}-${shortId}`;
        };

    const handlePrintInvoice =
        async () => {
            if (!order) {
                return;
            }

            if (
                order.paymentStatus !==
                "Paid"
            ) {
                Alert.alert(
                    "Invoice Locked",
                    "Invoice is available only after payment is completed."
                );

                return;
            }

            const html = `
                <!DOCTYPE html>

                <html>
                    <head>
                        <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1.0"
                        />

                        <style>
                            * {
                                box-sizing: border-box;
                            }

                            body {
                                margin: 0;
                                padding: 36px;

                                font-family:
                                    Arial,
                                    Helvetica,
                                    sans-serif;

                                color: #17231b;

                                background: #ffffff;
                            }

                            .invoice {
                                width: 100%;
                                max-width: 800px;

                                margin: 0 auto;
                            }

                            .top {
                                display: flex;

                                justify-content:
                                    space-between;

                                align-items:
                                    flex-start;
                            }

                            .brand-main {
                                margin: 0;

                                color: #14532d;

                                font-size: 28px;
                                font-weight: 700;
                            }

                            .brand-accent {
                                margin: 2px 0 0;

                                color: #16a34a;

                                font-size: 28px;
                                font-weight: 700;
                            }

                            .paid {
                                padding:
                                    8px 14px;

                                border-radius:
                                    20px;

                                background:
                                    #dcfce7;

                                color:
                                    #15803d;

                                font-size:
                                    12px;

                                font-weight:
                                    700;
                            }

                            .divider {
                                height: 3px;

                                margin:
                                    22px 0;

                                border-radius:
                                    4px;

                                background:
                                    #166534;
                            }

                            .meta {
                                display: flex;

                                gap: 14px;

                                margin-bottom:
                                    24px;
                            }

                            .meta-box {
                                flex: 1;

                                padding: 14px;

                                border-radius:
                                    10px;

                                background:
                                    #f6faf7;
                            }

                            .meta-label {
                                color:
                                    #94a3b8;

                                font-size:
                                    10px;

                                font-weight:
                                    600;
                            }

                            .meta-value {
                                margin-top:
                                    5px;

                                color:
                                    #17231b;

                                font-size:
                                    12px;

                                font-weight:
                                    700;
                            }

                            .section-label {
                                margin-bottom:
                                    7px;

                                color:
                                    #94a3b8;

                                font-size:
                                    10px;

                                font-weight:
                                    700;

                                letter-spacing:
                                    1px;
                            }

                            .customer {
                                margin: 0;

                                color:
                                    #17231b;

                                font-size:
                                    18px;

                                font-weight:
                                    700;
                            }

                            .customer-info {
                                margin:
                                    5px 0 0;

                                color:
                                    #64748b;

                                font-size:
                                    12px;

                                line-height:
                                    1.5;
                            }

                            table {
                                width: 100%;

                                margin-top:
                                    26px;

                                border-collapse:
                                    collapse;
                            }

                            th {
                                padding:
                                    12px 10px;

                                background:
                                    #14532d;

                                color:
                                    #ffffff;

                                font-size:
                                    11px;

                                text-align:
                                    left;
                            }

                            td {
                                padding:
                                    14px 10px;

                                border-bottom:
                                    1px solid
                                    #e2e8f0;

                                color:
                                    #374151;

                                font-size:
                                    12px;
                            }

                            .payment-row {
                                margin-top:
                                    24px;

                                padding:
                                    12px 0;

                                display: flex;

                                justify-content:
                                    space-between;

                                border-bottom:
                                    1px solid
                                    #e2e8f0;

                                font-size:
                                    12px;
                            }

                            .total {
                                margin-top:
                                    16px;

                                padding-top:
                                    18px;

                                display: flex;

                                justify-content:
                                    space-between;

                                border-top:
                                    2px solid
                                    #17231b;
                            }

                            .total-label {
                                font-size:
                                    16px;

                                font-weight:
                                    700;
                            }

                            .total-value {
                                color:
                                    #14532d;

                                font-size:
                                    23px;

                                font-weight:
                                    700;
                            }

                            .success {
                                margin-top:
                                    30px;

                                padding:
                                    13px;

                                border-radius:
                                    10px;

                                background:
                                    #f0fdf4;

                                color:
                                    #15803d;

                                font-size:
                                    11px;

                                font-weight:
                                    700;

                                text-align:
                                    center;
                            }

                            .footer {
                                margin-top:
                                    24px;

                                color:
                                    #94a3b8;

                                font-size:
                                    10px;

                                text-align:
                                    center;
                            }
                        </style>
                    </head>

                    <body>
                        <div class="invoice">
                            <div class="top">
                                <div>
                                    <h1 class="brand-main">
                                        Shivalik
                                    </h1>

                                    <h2 class="brand-accent">
                                        Dragon Farm
                                    </h2>
                                </div>

                                <div class="paid">
                                    PAID
                                </div>
                            </div>

                            <div class="divider"></div>

                            <div class="meta">
                                <div class="meta-box">
                                    <div class="meta-label">
                                        INVOICE NO.
                                    </div>

                                    <div class="meta-value">
                                        ${getInvoiceNumber()}
                                    </div>
                                </div>

                                <div class="meta-box">
                                    <div class="meta-label">
                                        DATE
                                    </div>

                                    <div class="meta-value">
                                        ${formatDate(
                                            order.date ||
                                                order.createdAt
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div class="section-label">
                                    BILL TO
                                </div>

                                <p class="customer">
                                    ${order.customerName || ""}
                                </p>

                                ${
                                    order.phone
                                        ? `
                                            <p class="customer-info">
                                                ${order.phone}
                                            </p>
                                        `
                                        : ""
                                }

                                ${
                                    order.address
                                        ? `
                                            <p class="customer-info">
                                                ${order.address}
                                            </p>
                                        `
                                        : ""
                                }
                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th>
                                            Item
                                        </th>

                                        <th>
                                            Weight
                                        </th>

                                        <th>
                                            Rate
                                        </th>

                                        <th>
                                            Amount
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr>
                                        <td>
                                            Fresh Dragon Fruit
                                        </td>

                                        <td>
                                            ${money(
                                                order.weight
                                            )} kg
                                        </td>

                                        <td>
                                            ₹ ${money(
                                                order.rate
                                            )}
                                        </td>

                                        <td>
                                            ₹ ${money(
                                                order.amount
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div class="payment-row">
                                <span>
                                    Payment Mode
                                </span>

                                <strong>
                                    ${order.paymentMode || "-"}
                                </strong>
                            </div>

                            <div class="total">
                                <span class="total-label">
                                    Total Amount
                                </span>

                                <span class="total-value">
                                    ₹ ${money(
                                        order.amount
                                    )}
                                </span>
                            </div>

                            <div class="success">
                                Payment completed successfully.
                            </div>

                            <div class="footer">
                                Thank you for choosing
                                Shivalik Dragon Farm.
                            </div>
                        </div>
                    </body>
                </html>
            `;

            try {
                setPrinting(true);

                await Print.printAsync({
                    html,
                });
            } catch (error) {
                console.error(
                    "Print invoice error:",
                    error
                );

                Alert.alert(
                    "Print Failed",
                    "Unable to print the invoice."
                );
            } finally {
                setPrinting(false);
            }
        };

    if (!orderId) {
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
                    Invalid invoice.
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
                    Loading invoice...
                </Text>
            </View>
        );
    }

    if (!order) {
        return null;
    }

    if (
        order.paymentStatus !==
        "Paid"
    ) {
        return (
            <View
                style={
                    styles.center
                }
            >
                <Ionicons
                    name="lock-closed-outline"
                    size={38}
                    color="#dc2626"
                />

                <Text
                    style={
                        styles.unpaidTitle
                    }
                >
                    Invoice Locked
                </Text>

                <Text
                    style={
                        styles.unpaidMessage
                    }
                >
                    Invoice is available
                    only after payment is
                    completed.
                </Text>

                <Pressable
                    style={
                        styles.backMainButton
                    }
                    onPress={() =>
                        router.back()
                    }
                >
                    <Text
                        style={
                            styles.backMainButtonText
                        }
                    >
                        Back
                    </Text>
                </Pressable>
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
                        Invoice
                    </Text>

                    <Text
                        style={
                            styles.pageSubtitle
                        }
                    >
                        Payment receipt
                    </Text>
                </View>

                <Pressable
                    style={[
                        styles.printIconButton,

                        printing &&
                            styles.disabledButton,
                    ]}
                    onPress={
                        handlePrintInvoice
                    }
                    disabled={
                        printing
                    }
                >
                    {printing ? (
                        <ActivityIndicator
                            size="small"
                            color="#ffffff"
                        />
                    ) : (
                        <Ionicons
                            name="print-outline"
                            size={19}
                            color="#ffffff"
                        />
                    )}
                </Pressable>
            </View>

            <Pressable
                style={[
                    styles.printButton,

                    printing &&
                        styles.disabledButton,
                ]}
                onPress={
                    handlePrintInvoice
                }
                disabled={
                    printing
                }
            >
                {printing ? (
                    <ActivityIndicator
                        size="small"
                        color="#ffffff"
                    />
                ) : (
                    <Ionicons
                        name="print-outline"
                        size={18}
                        color="#ffffff"
                    />
                )}

                <Text
                    style={
                        styles.printButtonText
                    }
                >
                    {printing
                        ? "Opening Print..."
                        : "Print / Save PDF"}
                </Text>
            </Pressable>

            <View
                style={
                    styles.invoiceCard
                }
            >
                <View
                    style={
                        styles.brandHeader
                    }
                >
                    <View>
                        <Text
                            style={
                                styles.brandName
                            }
                        >
                            Shivalik
                        </Text>

                        <Text
                            style={
                                styles.brandAccent
                            }
                        >
                            Dragon Farm
                        </Text>
                    </View>

                    <View
                        style={
                            styles.invoiceBadge
                        }
                    >
                        <Text
                            style={
                                styles.invoiceBadgeText
                            }
                        >
                            PAID
                        </Text>
                    </View>
                </View>

                <View
                    style={
                        styles.divider
                    }
                />

                <View
                    style={
                        styles.metaGrid
                    }
                >
                    <MetaItem
                        label="Invoice No."
                        value={
                            getInvoiceNumber()
                        }
                    />

                    <MetaItem
                        label="Date"
                        value={formatDate(
                            order.date ||
                                order.createdAt
                        )}
                    />
                </View>

                <View
                    style={
                        styles.section
                    }
                >
                    <Text
                        style={
                            styles.sectionLabel
                        }
                    >
                        BILL TO
                    </Text>

                    <Text
                        style={
                            styles.customerName
                        }
                    >
                        {
                            order.customerName
                        }
                    </Text>

                    {order.phone ? (
                        <Text
                            style={
                                styles.customerInfo
                            }
                        >
                            {
                                order.phone
                            }
                        </Text>
                    ) : null}

                    {order.address ? (
                        <Text
                            style={
                                styles.customerInfo
                            }
                        >
                            {
                                order.address
                            }
                        </Text>
                    ) : null}
                </View>

                <View
                    style={
                        styles.tableHeader
                    }
                >
                    <Text
                        style={[
                            styles.tableHeaderText,
                            styles.descriptionColumn,
                        ]}
                    >
                        ITEM
                    </Text>

                    <Text
                        style={
                            styles.tableHeaderText
                        }
                    >
                        WT
                    </Text>

                    <Text
                        style={
                            styles.tableHeaderText
                        }
                    >
                        RATE
                    </Text>
                </View>

                <View
                    style={
                        styles.tableRow
                    }
                >
                    <Text
                        style={[
                            styles.tableCell,
                            styles.descriptionColumn,
                        ]}
                    >
                        Fresh Dragon Fruit
                    </Text>

                    <Text
                        style={
                            styles.tableCell
                        }
                    >
                        {money(
                            order.weight
                        )}{" "}
                        kg
                    </Text>

                    <Text
                        style={
                            styles.tableCell
                        }
                    >
                        ₹
                        {money(
                            order.rate
                        )}
                    </Text>
                </View>

                <View
                    style={
                        styles.totalSection
                    }
                >
                    <View
                        style={
                            styles.totalRow
                        }
                    >
                        <Text
                            style={
                                styles.totalLabel
                            }
                        >
                            Payment Mode
                        </Text>

                        <Text
                            style={
                                styles.totalText
                            }
                        >
                            {
                                order.paymentMode
                            }
                        </Text>
                    </View>

                    <View
                        style={
                            styles.grandTotalRow
                        }
                    >
                        <Text
                            style={
                                styles.grandTotalLabel
                            }
                        >
                            Total Amount
                        </Text>

                        <Text
                            style={
                                styles.grandTotalValue
                            }
                        >
                            ₹{" "}
                            {money(
                                order.amount
                            )}
                        </Text>
                    </View>
                </View>

                <View
                    style={
                        styles.footer
                    }
                >
                    <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#16a34a"
                    />

                    <Text
                        style={
                            styles.footerText
                        }
                    >
                        Payment completed
                        successfully.
                    </Text>
                </View>

                <Text
                    style={
                        styles.thanks
                    }
                >
                    Thank you for choosing
                    Shivalik Dragon Farm.
                </Text>
            </View>
        </ScrollView>
    );
}

function MetaItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <View
            style={
                styles.metaItem
            }
        >
            <Text
                style={
                    styles.metaLabel
                }
            >
                {label}
            </Text>

            <Text
                style={
                    styles.metaValue
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

        center: {
            flex: 1,
            paddingHorizontal: 30,
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

        errorText: {
            color: "#dc2626",
            fontSize: 14,
            fontWeight: "700",
        },

        unpaidTitle: {
            marginTop: 13,
            color: "#17231b",
            fontSize: 20,
            fontWeight: "800",
        },

        unpaidMessage: {
            marginTop: 7,
            maxWidth: 270,
            color: "#64748b",
            fontSize: 12,
            lineHeight: 18,
            textAlign: "center",
        },

        backMainButton: {
            marginTop: 20,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor:
                "#166534",
        },

        backMainButtonText: {
            color: "#ffffff",
            fontSize: 11,
            fontWeight: "800",
        },

        header: {
            marginBottom: 16,

            flexDirection:
                "row",

            alignItems: "center",
        },

        headerText: {
            flex: 1,
            marginLeft: 12,
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

        printIconButton: {
            width: 43,
            height: 43,

            alignItems: "center",
            justifyContent:
                "center",

            borderRadius: 13,

            backgroundColor:
                "#166534",
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

        printButton: {
            height: 48,
            marginBottom: 15,

            flexDirection:
                "row",

            alignItems: "center",
            justifyContent:
                "center",

            gap: 8,

            borderRadius: 13,

            backgroundColor:
                "#166534",

            shadowColor:
                "#166534",

            shadowOpacity: 0.16,
            shadowRadius: 10,

            shadowOffset: {
                width: 0,
                height: 5,
            },

            elevation: 4,
        },

        printButtonText: {
            color: "#ffffff",
            fontSize: 11,
            fontWeight: "800",
        },

        disabledButton: {
            opacity: 0.65,
        },

        invoiceCard: {
            padding: 19,

            borderRadius: 21,

            borderWidth: 1,
            borderColor:
                "#e2ebe4",

            backgroundColor:
                "#ffffff",

            shadowColor:
                "#14532d",
            shadowOpacity: 0.06,
            shadowRadius: 13,

            shadowOffset: {
                width: 0,
                height: 6,
            },

            elevation: 3,
        },

        brandHeader: {
            flexDirection:
                "row",

            alignItems: "center",
            justifyContent:
                "space-between",
        },

        brandName: {
            color: "#14532d",
            fontSize: 24,
            fontWeight: "800",
            lineHeight: 27,
        },

        brandAccent: {
            color: "#16a34a",
            fontSize: 24,
            fontWeight: "800",
            lineHeight: 27,
        },

        invoiceBadge: {
            paddingHorizontal: 11,
            paddingVertical: 7,

            borderRadius: 20,

            backgroundColor:
                "#dcfce7",
        },

        invoiceBadgeText: {
            color: "#15803d",
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 0.6,
        },

        divider: {
            height: 2,
            marginVertical: 18,

            borderRadius: 2,

            backgroundColor:
                "#166534",
        },

        metaGrid: {
            flexDirection:
                "row",

            gap: 10,
        },

        metaItem: {
            flex: 1,

            padding: 12,

            borderRadius: 12,

            backgroundColor:
                "#f8faf9",
        },

        metaLabel: {
            color: "#94a3b8",
            fontSize: 8,
            fontWeight: "600",
        },

        metaValue: {
            marginTop: 4,

            color: "#17231b",

            fontSize: 10,
            fontWeight: "800",
        },

        section: {
            marginTop: 22,
        },

        sectionLabel: {
            color: "#94a3b8",

            fontSize: 8,
            fontWeight: "800",

            letterSpacing: 0.8,
        },

        customerName: {
            marginTop: 7,

            color: "#17231b",

            fontSize: 16,
            fontWeight: "800",
        },

        customerInfo: {
            marginTop: 4,

            color: "#64748b",

            fontSize: 10,
            lineHeight: 15,
        },

        tableHeader: {
            marginTop: 22,

            paddingHorizontal: 10,
            paddingVertical: 11,

            flexDirection:
                "row",

            borderTopLeftRadius:
                10,

            borderTopRightRadius:
                10,

            backgroundColor:
                "#14532d",
        },

        tableHeaderText: {
            width: "24%",

            color: "#ffffff",

            fontSize: 8,
            fontWeight: "800",
        },

        descriptionColumn: {
            width: "52%",
        },

        tableRow: {
            paddingHorizontal: 10,
            paddingVertical: 15,

            flexDirection:
                "row",

            borderWidth: 1,
            borderTopWidth: 0,

            borderColor:
                "#e2ebe4",

            borderBottomLeftRadius:
                10,

            borderBottomRightRadius:
                10,
        },

        tableCell: {
            width: "24%",

            color: "#374151",

            fontSize: 9,
            fontWeight: "600",
        },

        totalSection: {
            marginTop: 22,
        },

        totalRow: {
            paddingVertical: 11,

            flexDirection:
                "row",

            justifyContent:
                "space-between",
        },

        totalLabel: {
            color: "#64748b",
            fontSize: 10,
            fontWeight: "600",
        },

        totalText: {
            color: "#17231b",
            fontSize: 10,
            fontWeight: "800",
        },

        grandTotalRow: {
            marginTop: 5,
            paddingTop: 15,

            flexDirection:
                "row",

            alignItems: "center",
            justifyContent:
                "space-between",

            borderTopWidth: 2,

            borderTopColor:
                "#17231b",
        },

        grandTotalLabel: {
            color: "#17231b",
            fontSize: 13,
            fontWeight: "800",
        },

        grandTotalValue: {
            color: "#14532d",
            fontSize: 21,
            fontWeight: "800",
        },

        footer: {
            marginTop: 25,
            padding: 13,

            flexDirection:
                "row",

            alignItems: "center",
            justifyContent:
                "center",

            gap: 7,

            borderRadius: 12,

            backgroundColor:
                "#f0fdf4",
        },

        footerText: {
            color: "#15803d",
            fontSize: 10,
            fontWeight: "700",
        },

        thanks: {
            marginTop: 18,

            color: "#94a3b8",

            fontSize: 9,
            lineHeight: 14,

            textAlign: "center",
        },
    });