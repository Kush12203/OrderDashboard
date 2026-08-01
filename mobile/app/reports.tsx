import {
    ActivityIndicator,
    Alert,
    Platform,
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

import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// IMPORTANT:
// Legacy API is more reliable for writeAsStringAsync
// with our Expo setup.
import * as FileSystem from "expo-file-system/legacy";

import api from "../services/api";

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

type StatusFilter =
    | "All"
    | "Paid"
    | "Unpaid";

type ModeFilter =
    | "All"
    | "Cash"
    | "Online";

export default function Reports() {
    const router = useRouter();

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [exporting, setExporting] =
        useState(false);

    const [
        filtersOpen,
        setFiltersOpen,
    ] = useState(true);

    // =========================
    // DATE FILTERS
    // =========================

    const [
        startDate,
        setStartDate,
    ] = useState<Date | null>(
        null
    );

    const [
        endDate,
        setEndDate,
    ] = useState<Date | null>(
        null
    );

    const [
        showStartPicker,
        setShowStartPicker,
    ] = useState(false);

    const [
        showEndPicker,
        setShowEndPicker,
    ] = useState(false);

    const [
        customerSearch,
        setCustomerSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] =
        useState<StatusFilter>(
            "All"
        );

    const [
        modeFilter,
        setModeFilter,
    ] =
        useState<ModeFilter>(
            "All"
        );

    // =========================
    // LOAD ORDERS
    // =========================

    const loadOrders = async (
        refresh = false
    ) => {
        try {
            if (refresh) {
                setRefreshing(
                    true
                );
            } else {
                setLoading(true);
            }

            const response =
                await api.get(
                    "/orders"
                );

            setOrders(
                Array.isArray(
                    response.data
                )
                    ? response.data
                    : []
            );
        } catch (
            error: any
        ) {
            console.error(
                "Reports load error:",
                error.response
                    ?.data ||
                    error
            );

            Alert.alert(
                "Unable to Load Reports",
                error.response?.data
                    ?.message ||
                    "Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(
                false
            );
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const onRefresh =
        useCallback(() => {
            loadOrders(true);
        }, []);

    // =========================
    // DATE PICKERS
    // =========================

    const handleStartDateChange = (
        event: DateTimePickerEvent,
        selectedDate?: Date
    ) => {
        if (
            Platform.OS ===
            "android"
        ) {
            setShowStartPicker(
                false
            );
        }

        if (
            event.type ===
            "dismissed"
        ) {
            return;
        }

        if (selectedDate) {
            const cleanDate =
                new Date(
                    selectedDate
                );

            cleanDate.setHours(
                0,
                0,
                0,
                0
            );

            setStartDate(
                cleanDate
            );

            if (
                endDate &&
                cleanDate >
                    endDate
            ) {
                setEndDate(null);
            }
        }
    };

    const handleEndDateChange = (
        event: DateTimePickerEvent,
        selectedDate?: Date
    ) => {
        if (
            Platform.OS ===
            "android"
        ) {
            setShowEndPicker(
                false
            );
        }

        if (
            event.type ===
            "dismissed"
        ) {
            return;
        }

        if (selectedDate) {
            const cleanDate =
                new Date(
                    selectedDate
                );

            cleanDate.setHours(
                23,
                59,
                59,
                999
            );

            if (
                startDate &&
                cleanDate <
                    startDate
            ) {
                Alert.alert(
                    "Invalid Date Range",
                    "End date cannot be before start date."
                );

                return;
            }

            setEndDate(
                cleanDate
            );
        }
    };

    // =========================
    // FILTER ORDERS
    // =========================

    const filteredOrders =
        useMemo(() => {
            const search =
                customerSearch
                    .trim()
                    .toLowerCase();

            return orders.filter(
                (order) => {
                    const rawDate =
                        order.date ||
                        order.createdAt;

                    const orderDate =
                        rawDate
                            ? new Date(
                                  rawDate
                              )
                            : null;

                    const matchesCustomer =
                        !search ||
                        order.customerName
                            ?.toLowerCase()
                            .includes(
                                search
                            );

                    const matchesStatus =
                        statusFilter ===
                            "All" ||
                        order.paymentStatus ===
                            statusFilter;

                    const matchesMode =
                        modeFilter ===
                            "All" ||
                        order.paymentMode ===
                            modeFilter;

                    let matchesStart =
                        true;

                    let matchesEnd =
                        true;

                    if (
                        startDate &&
                        orderDate
                    ) {
                        matchesStart =
                            orderDate.getTime() >=
                            startDate.getTime();
                    }

                    if (
                        endDate &&
                        orderDate
                    ) {
                        matchesEnd =
                            orderDate.getTime() <=
                            endDate.getTime();
                    }

                    return (
                        matchesCustomer &&
                        matchesStatus &&
                        matchesMode &&
                        matchesStart &&
                        matchesEnd
                    );
                }
            );
        }, [
            orders,
            customerSearch,
            statusFilter,
            modeFilter,
            startDate,
            endDate,
        ]);

    // =========================
    // SUMMARY
    // =========================

    const stats =
        useMemo(() => {
            let totalAmount =
                0;

            let totalWeight =
                0;

            let paidAmount =
                0;

            let unpaidAmount =
                0;

            let paidOrders =
                0;

            let unpaidOrders =
                0;

            filteredOrders.forEach(
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
                        paidAmount +=
                            amount;

                        paidOrders +=
                            1;
                    } else {
                        unpaidAmount +=
                            amount;

                        unpaidOrders +=
                            1;
                    }
                }
            );

            return {
                totalAmount,
                totalWeight,
                paidAmount,
                unpaidAmount,

                totalOrders:
                    filteredOrders.length,

                paidOrders,
                unpaidOrders,
            };
        }, [filteredOrders]);

    // =========================
    // FORMATTERS
    // =========================

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

    const displayPickerDate = (
        value: Date | null
    ) => {
        if (!value) {
            return "";
        }

        return value.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =========================
    // RESET FILTERS
    // =========================

    const resetFilters =
        () => {
            setStartDate(
                null
            );

            setEndDate(null);

            setCustomerSearch(
                ""
            );

            setStatusFilter(
                "All"
            );

            setModeFilter(
                "All"
            );
        };

    // =========================
    // HTML HELPERS
    // =========================

    const escapeHtml = (
        value: string
    ) => {
        return String(
            value || ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    };

    const buildReportHtml =
        () => {
            const rows =
                filteredOrders
                    .map(
                        (
                            order
                        ) => `
                    <tr>

                        <td>
                            ${escapeHtml(
                                order.customerName ||
                                    "-"
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                order.date ||
                                    order.createdAt
                            )}
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

                        <td>
                            ${escapeHtml(
                                order.paymentMode ||
                                    "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                order.paymentStatus ||
                                    "-"
                            )}
                        </td>

                    </tr>
                `
                    )
                    .join("");

            return `
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

    font-family:
        Arial,
        Helvetica,
        sans-serif;

    margin: 0;

    padding: 30px;

    color: #17231b;

}

h1 {

    margin: 0;

    color: #14532d;

}

h2 {

    margin: 2px 0 0;

    color: #16a34a;

}

.subtitle {

    margin-top: 7px;

    color: #64748b;

    font-size: 12px;

}

.line {

    height: 3px;

    background: #166534;

    margin: 20px 0;

}

.filters {

    margin-bottom: 20px;

    padding: 12px;

    background: #f8faf9;

    border-radius: 8px;

    font-size: 10px;

}

.summary {

    display: grid;

    grid-template-columns:
        repeat(5, 1fr);

    gap: 8px;

    margin-bottom: 24px;

}

.card {

    padding: 11px;

    background: #f6faf7;

    border-radius: 8px;

}

.label {

    color: #94a3b8;

    font-size: 8px;

    font-weight: bold;

}

.value {

    margin-top: 5px;

    color: #17231b;

    font-size: 12px;

    font-weight: bold;

}

table {

    width: 100%;

    border-collapse:
        collapse;

}

th {

    background:
        #14532d;

    color: white;

    padding: 9px;

    font-size: 9px;

    text-align: left;

}

td {

    padding: 9px;

    border-bottom:
        1px solid #e2e8f0;

    font-size: 9px;

}

.footer {

    margin-top: 25px;

    color: #94a3b8;

    text-align: center;

    font-size: 9px;

}

</style>

</head>

<body>

<h1>
    Shivalik
</h1>

<h2>
    Dragon Farm
</h2>

<div class="subtitle">
    Business Report
</div>

<div class="line"></div>

<div class="filters">

    Date Range:

    ${
        startDate
            ? displayPickerDate(
                  startDate
              )
            : "All"
    }

    -

    ${
        endDate
            ? displayPickerDate(
                  endDate
              )
            : "All"
    }

    <br><br>

    Customer:
    ${
        customerSearch ||
        "All"
    }

    &nbsp;&nbsp;

    Status:
    ${statusFilter}

    &nbsp;&nbsp;

    Mode:
    ${modeFilter}

</div>

<div class="summary">

    <div class="card">

        <div class="label">
            TOTAL AMOUNT
        </div>

        <div class="value">
            ₹ ${money(
                stats.totalAmount
            )}
        </div>

    </div>

    <div class="card">

        <div class="label">
            ORDERS
        </div>

        <div class="value">
            ${
                stats.totalOrders
            }
        </div>

    </div>

    <div class="card">

        <div class="label">
            WEIGHT
        </div>

        <div class="value">
            ${money(
                stats.totalWeight
            )} kg
        </div>

    </div>

    <div class="card">

        <div class="label">
            PAID
        </div>

        <div class="value">
            ₹ ${money(
                stats.paidAmount
            )}
        </div>

    </div>

    <div class="card">

        <div class="label">
            UNPAID
        </div>

        <div class="value">
            ₹ ${money(
                stats.unpaidAmount
            )}
        </div>

    </div>

</div>

<table>

<thead>

<tr>

<th>
    Customer
</th>

<th>
    Date
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

<th>
    Mode
</th>

<th>
    Status
</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>

<div class="footer">

Generated from
Shivalik Dragon Farm
Management System

</div>

</body>

</html>
`;
        };

    // =========================
    // PRINT
    // =========================

    const handlePrint =
        async () => {
            if (
                filteredOrders.length ===
                0
            ) {
                Alert.alert(
                    "No Data",
                    "There are no filtered records to print."
                );

                return;
            }

            try {
                setExporting(
                    true
                );

                await Print.printAsync(
                    {
                        html: buildReportHtml(),
                    }
                );
            } catch (error) {
                console.error(
                    "Report print error:",
                    error
                );

                Alert.alert(
                    "Print Failed",
                    "Unable to print report."
                );
            } finally {
                setExporting(
                    false
                );
            }
        };

    // =========================
    // PDF
    // =========================

    const handleExportPdf =
        async () => {
            if (
                filteredOrders.length ===
                0
            ) {
                Alert.alert(
                    "No Data",
                    "There are no filtered records to export."
                );

                return;
            }

            try {
                setExporting(
                    true
                );

                const result =
                    await Print.printToFileAsync(
                        {
                            html: buildReportHtml(),
                        }
                    );

                const canShare =
                    await Sharing.isAvailableAsync();

                if (
                    !canShare
                ) {
                    Alert.alert(
                        "PDF Created",
                        `PDF saved at:\n${result.uri}`
                    );

                    return;
                }

                await Sharing.shareAsync(
                    result.uri,
                    {
                        mimeType:
                            "application/pdf",

                        dialogTitle:
                            "Share Report PDF",

                        UTI:
                            "com.adobe.pdf",
                    }
                );
            } catch (error) {
                console.error(
                    "PDF export error:",
                    error
                );

                Alert.alert(
                    "Export Failed",
                    "Unable to export PDF."
                );
            } finally {
                setExporting(
                    false
                );
            }
        };

    // =========================
    // CSV HELPERS
    // =========================

    const csvValue = (
        value:
            | string
            | number
            | undefined
    ) => {
        const text =
            String(
                value ?? ""
            );

        return `"${text.replace(
            /"/g,
            '""'
        )}"`;
    };

    // =========================
    // EXPORT CSV
    // =========================

    const handleExportCsv =
        async () => {
            if (
                filteredOrders.length ===
                0
            ) {
                Alert.alert(
                    "No Data",
                    "There are no filtered records to export."
                );

                return;
            }

            try {
                setExporting(
                    true
                );

                const headers = [
                    "Date",
                    "Customer",
                    "Weight (kg)",
                    "Rate",
                    "Amount",
                    "Payment Mode",
                    "Payment Status",
                    "Phone",
                    "Address",
                ];

                const headerRow =
                    headers
                        .map(
                            csvValue
                        )
                        .join(
                            ","
                        );

                const dataRows =
                    filteredOrders.map(
                        (
                            order
                        ) => {
                            return [
                                formatDate(
                                    order.date ||
                                        order.createdAt
                                ),

                                order.customerName ||
                                    "",

                                Number(
                                    order.weight ||
                                        0
                                ),

                                Number(
                                    order.rate ||
                                        0
                                ),

                                Number(
                                    order.amount ||
                                        0
                                ),

                                order.paymentMode ||
                                    "",

                                order.paymentStatus ||
                                    "",

                                order.phone ||
                                    "",

                                order.address ||
                                    "",
                            ]
                                .map(
                                    csvValue
                                )
                                .join(
                                    ","
                                );
                        }
                    );

                // BOM added so ₹ and
                // Indian text open properly
                // in Excel.
                const csvContent =
                    "\uFEFF" +
                    [
                        headerRow,
                        ...dataRows,
                    ].join(
                        "\r\n"
                    );

                if (
                    !FileSystem.cacheDirectory
                ) {
                    throw new Error(
                        "Unable to access device cache directory."
                    );
                }

                const fileName =
                    `Shivalik_Report_${Date.now()}.csv`;

                const fileUri =
                    FileSystem.cacheDirectory +
                    fileName;

                await FileSystem.writeAsStringAsync(
                    fileUri,
                    csvContent,
                    {
                        encoding:
                            FileSystem
                                .EncodingType
                                .UTF8,
                    }
                );

                console.log(
                    "CSV created:",
                    fileUri
                );

                const fileInfo =
                    await FileSystem.getInfoAsync(
                        fileUri
                    );

                if (
                    !fileInfo.exists
                ) {
                    throw new Error(
                        "CSV file was not created."
                    );
                }

                const canShare =
                    await Sharing.isAvailableAsync();

                if (
                    !canShare
                ) {
                    Alert.alert(
                        "CSV Created",
                        `Report saved at:\n${fileUri}`
                    );

                    return;
                }

                await Sharing.shareAsync(
                    fileUri,
                    {
                        mimeType:
                            "text/csv",

                        dialogTitle:
                            "Export Shivalik Report",

                        UTI:
                            "public.comma-separated-values-text",
                    }
                );
            } catch (
                error: any
            ) {
                console.error(
                    "CSV EXPORT ERROR:",
                    error
                );

                Alert.alert(
                    "Export Failed",
                    error?.message ||
                        "Unable to export CSV."
                );
            } finally {
                setExporting(
                    false
                );
            }
        };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <View
                style={
                    styles.loading
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
                    Loading reports...
                </Text>
            </View>
        );
    }

    // =========================
    // UI
    // =========================

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
            {/* HEADER */}

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
                        Reports
                    </Text>

                    <Text
                        style={
                            styles.pageSubtitle
                        }
                    >
                        Filter, review and
                        export business data.
                    </Text>
                </View>
            </View>

            {/* EXPORT BUTTONS */}

            <View
                style={
                    styles.actionGrid
                }
            >
                <ActionButton
                    icon="refresh-outline"
                    title="Refresh"
                    onPress={() =>
                        loadOrders(
                            true
                        )
                    }
                />

                <ActionButton
                    icon="grid-outline"
                    title="CSV"
                    onPress={
                        handleExportCsv
                    }
                />

                <ActionButton
                    icon="document-outline"
                    title="PDF"
                    onPress={
                        handleExportPdf
                    }
                />

                <ActionButton
                    icon="print-outline"
                    title="Print"
                    onPress={
                        handlePrint
                    }
                />
            </View>

            {/* FILTER CARD */}

            <View
                style={
                    styles.filterCard
                }
            >
                <Pressable
                    style={
                        styles.filterHeader
                    }
                    onPress={() =>
                        setFiltersOpen(
                            (
                                value
                            ) =>
                                !value
                        )
                    }
                >
                    <View
                        style={
                            styles.filterHeaderLeft
                        }
                    >
                        <View
                            style={
                                styles.filterIcon
                            }
                        >
                            <Ionicons
                                name="filter"
                                size={17}
                                color="#166534"
                            />
                        </View>

                        <View>
                            <Text
                                style={
                                    styles.filterTitle
                                }
                            >
                                Report Filters
                            </Text>

                            <Text
                                style={
                                    styles.filterSubtitle
                                }
                            >
                                Select a date
                                range and
                                conditions
                            </Text>
                        </View>
                    </View>

                    <Ionicons
                        name={
                            filtersOpen
                                ? "chevron-up"
                                : "chevron-down"
                        }
                        size={19}
                        color="#64748b"
                    />
                </Pressable>

                {filtersOpen && (
                    <View
                        style={
                            styles.filterContent
                        }
                    >
                        {/* START DATE */}

                        <Text
                            style={
                                styles.label
                            }
                        >
                            Start Date
                        </Text>

                        <Pressable
                            style={
                                styles.dateInput
                            }
                            onPress={() =>
                                setShowStartPicker(
                                    true
                                )
                            }
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={18}
                                color="#166534"
                            />

                            <Text
                                style={
                                    startDate
                                        ? styles.dateValue
                                        : styles.datePlaceholder
                                }
                            >
                                {startDate
                                    ? displayPickerDate(
                                          startDate
                                      )
                                    : "Select start date"}
                            </Text>

                            {startDate ? (
                                <Pressable
                                    onPress={(
                                        event
                                    ) => {
                                        event.stopPropagation();

                                        setStartDate(
                                            null
                                        );
                                    }}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={
                                            18
                                        }
                                        color="#94a3b8"
                                    />
                                </Pressable>
                            ) : (
                                <Ionicons
                                    name="chevron-down"
                                    size={
                                        16
                                    }
                                    color="#94a3b8"
                                />
                            )}
                        </Pressable>

                        {showStartPicker && (
                            <DateTimePicker
                                value={
                                    startDate ||
                                    new Date()
                                }
                                mode="date"
                                display={
                                    Platform.OS ===
                                    "ios"
                                        ? "spinner"
                                        : "default"
                                }
                                onChange={
                                    handleStartDateChange
                                }
                                maximumDate={
                                    endDate ||
                                    undefined
                                }
                            />
                        )}

                        {/* END DATE */}

                        <Text
                            style={
                                styles.label
                            }
                        >
                            End Date
                        </Text>

                        <Pressable
                            style={
                                styles.dateInput
                            }
                            onPress={() =>
                                setShowEndPicker(
                                    true
                                )
                            }
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={18}
                                color="#166534"
                            />

                            <Text
                                style={
                                    endDate
                                        ? styles.dateValue
                                        : styles.datePlaceholder
                                }
                            >
                                {endDate
                                    ? displayPickerDate(
                                          endDate
                                      )
                                    : "Select end date"}
                            </Text>

                            {endDate ? (
                                <Pressable
                                    onPress={(
                                        event
                                    ) => {
                                        event.stopPropagation();

                                        setEndDate(
                                            null
                                        );
                                    }}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={
                                            18
                                        }
                                        color="#94a3b8"
                                    />
                                </Pressable>
                            ) : (
                                <Ionicons
                                    name="chevron-down"
                                    size={
                                        16
                                    }
                                    color="#94a3b8"
                                />
                            )}
                        </Pressable>

                        {showEndPicker && (
                            <DateTimePicker
                                value={
                                    endDate ||
                                    new Date()
                                }
                                mode="date"
                                display={
                                    Platform.OS ===
                                    "ios"
                                        ? "spinner"
                                        : "default"
                                }
                                onChange={
                                    handleEndDateChange
                                }
                                minimumDate={
                                    startDate ||
                                    undefined
                                }
                            />
                        )}

                        {/* CUSTOMER */}

                        <Text
                            style={
                                styles.label
                            }
                        >
                            Customer
                        </Text>

                        <View
                            style={
                                styles.searchInputContainer
                            }
                        >
                            <Ionicons
                                name="search-outline"
                                size={17}
                                color="#94a3b8"
                            />

                            <TextInput
                                style={
                                    styles.searchInput
                                }
                                placeholder="Search customer..."
                                placeholderTextColor="#94a3b8"
                                value={
                                    customerSearch
                                }
                                onChangeText={
                                    setCustomerSearch
                                }
                            />

                            {customerSearch.length >
                                0 && (
                                <Pressable
                                    onPress={() =>
                                        setCustomerSearch(
                                            ""
                                        )
                                    }
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={
                                            17
                                        }
                                        color="#94a3b8"
                                    />
                                </Pressable>
                            )}
                        </View>

                        {/* STATUS */}

                        <Text
                            style={
                                styles.label
                            }
                        >
                            Payment Status
                        </Text>

                        <View
                            style={
                                styles.optionRow
                            }
                        >
                            {(
                                [
                                    "All",
                                    "Paid",
                                    "Unpaid",
                                ] as StatusFilter[]
                            ).map(
                                (
                                    item
                                ) => (
                                    <FilterOption
                                        key={
                                            item
                                        }
                                        title={
                                            item
                                        }
                                        active={
                                            statusFilter ===
                                            item
                                        }
                                        onPress={() =>
                                            setStatusFilter(
                                                item
                                            )
                                        }
                                    />
                                )
                            )}
                        </View>

                        {/* MODE */}

                        <Text
                            style={
                                styles.label
                            }
                        >
                            Payment Mode
                        </Text>

                        <View
                            style={
                                styles.optionRow
                            }
                        >
                            {(
                                [
                                    "All",
                                    "Cash",
                                    "Online",
                                ] as ModeFilter[]
                            ).map(
                                (
                                    item
                                ) => (
                                    <FilterOption
                                        key={
                                            item
                                        }
                                        title={
                                            item
                                        }
                                        active={
                                            modeFilter ===
                                            item
                                        }
                                        onPress={() =>
                                            setModeFilter(
                                                item
                                            )
                                        }
                                    />
                                )
                            )}
                        </View>

                        {/* RESET */}

                        <Pressable
                            style={
                                styles.resetButton
                            }
                            onPress={
                                resetFilters
                            }
                        >
                            <Ionicons
                                name="refresh-outline"
                                size={17}
                                color="#64748b"
                            />

                            <Text
                                style={
                                    styles.resetText
                                }
                            >
                                Reset Filters
                            </Text>
                        </Pressable>
                    </View>
                )}
            </View>

            {/* HERO */}

            <View
                style={
                    styles.heroCard
                }
            >
                <Text
                    style={
                        styles.heroLabel
                    }
                >
                    Total Amount
                </Text>

                <Text
                    style={
                        styles.heroValue
                    }
                >
                    ₹{" "}
                    {money(
                        stats.totalAmount
                    )}
                </Text>

                <Text
                    style={
                        styles.heroFooter
                    }
                >
                    {
                        stats.totalOrders
                    }{" "}
                    orders •{" "}
                    {money(
                        stats.totalWeight
                    )}{" "}
                    kg
                </Text>
            </View>

            {/* SUMMARY */}

            <View
                style={
                    styles.grid
                }
            >
                <ReportCard
                    title="Total Orders"
                    value={String(
                        stats.totalOrders
                    )}
                    icon="receipt-outline"
                />

                <ReportCard
                    title="Total Weight"
                    value={`${money(
                        stats.totalWeight
                    )} kg`}
                    icon="scale-outline"
                />

                <ReportCard
                    title="Paid Amount"
                    value={`₹ ${money(
                        stats.paidAmount
                    )}`}
                    subtitle={`${stats.paidOrders} paid orders`}
                    icon="checkmark-circle-outline"
                />

                <ReportCard
                    title="Unpaid Amount"
                    value={`₹ ${money(
                        stats.unpaidAmount
                    )}`}
                    subtitle={`${stats.unpaidOrders} unpaid orders`}
                    icon="time-outline"
                    danger
                />
            </View>

            {/* DATA HEADER */}

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
                    Report Data
                </Text>

                <Text
                    style={
                        styles.sectionCount
                    }
                >
                    {
                        filteredOrders.length
                    }{" "}
                    records
                </Text>
            </View>

            {/* REPORT DATA */}

            {filteredOrders.length ===
            0 ? (
                <View
                    style={
                        styles.empty
                    }
                >
                    <Ionicons
                        name="document-text-outline"
                        size={30}
                        color="#166534"
                    />

                    <Text
                        style={
                            styles.emptyTitle
                        }
                    >
                        No matching records
                    </Text>

                    <Text
                        style={
                            styles.emptyText
                        }
                    >
                        Try changing the
                        report filters.
                    </Text>
                </View>
            ) : (
                filteredOrders.map(
                    (
                        order
                    ) => (
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
                                <View
                                    style={
                                        styles.orderIdentity
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
                                    ₹{" "}
                                    {money(
                                        order.amount
                                    )}
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.orderInfoGrid
                                }
                            >
                                <SmallInfo
                                    label="Weight"
                                    value={`${money(
                                        order.weight
                                    )} kg`}
                                />

                                <SmallInfo
                                    label="Rate"
                                    value={`₹ ${money(
                                        order.rate
                                    )}`}
                                />

                                <SmallInfo
                                    label="Mode"
                                    value={
                                        order.paymentMode ||
                                        "-"
                                    }
                                />

                                <SmallInfo
                                    label="Status"
                                    value={
                                        order.paymentStatus ||
                                        "-"
                                    }
                                />
                            </View>
                        </View>
                    )
                )
            )}

            {exporting && (
                <View
                    style={
                        styles.exportingBox
                    }
                >
                    <ActivityIndicator
                        color="#166534"
                    />

                    <Text
                        style={
                            styles.exportingText
                        }
                    >
                        Preparing report...
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

// =========================
// ACTION BUTTON
// =========================

function ActionButton({
    icon,
    title,
    onPress,
}: {
    icon:
        keyof typeof Ionicons.glyphMap;

    title: string;

    onPress: () => void;
}) {
    return (
        <Pressable
            style={({
                pressed,
            }) => [
                styles.actionButton,

                pressed &&
                    styles.actionButtonPressed,
            ]}
            onPress={onPress}
        >
            <Ionicons
                name={icon}
                size={17}
                color="#166534"
            />

            <Text
                style={
                    styles.actionText
                }
            >
                {title}
            </Text>
        </Pressable>
    );
}

// =========================
// FILTER OPTION
// =========================

function FilterOption({
    title,
    active,
    onPress,
}: {
    title: string;

    active: boolean;

    onPress: () => void;
}) {
    return (
        <Pressable
            style={[
                styles.filterOption,

                active &&
                    styles.filterOptionActive,
            ]}
            onPress={onPress}
        >
            <Text
                style={[
                    styles.filterOptionText,

                    active &&
                        styles.filterOptionTextActive,
                ]}
            >
                {title}
            </Text>
        </Pressable>
    );
}

// =========================
// REPORT CARD
// =========================

function ReportCard({
    title,
    value,
    subtitle,
    icon,
    danger = false,
}: {
    title: string;

    value: string;

    subtitle?: string;

    icon:
        keyof typeof Ionicons.glyphMap;

    danger?: boolean;
}) {
    return (
        <View
            style={
                styles.reportCard
            }
        >
            <View
                style={[
                    styles.iconBox,

                    danger
                        ? styles.iconDanger
                        : styles.iconGreen,
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
                    styles.reportLabel
                }
            >
                {title}
            </Text>

            <Text
                style={[
                    styles.reportValue,

                    danger &&
                        styles.reportValueDanger,
                ]}
                numberOfLines={1}
            >
                {value}
            </Text>

            {subtitle ? (
                <Text
                    style={
                        styles.reportSubtitle
                    }
                >
                    {subtitle}
                </Text>
            ) : null}
        </View>
    );
}

// =========================
// SMALL INFO
// =========================

function SmallInfo({
    label,
    value,
}: {
    label: string;

    value: string;
}) {
    return (
        <View
            style={
                styles.smallInfo
            }
        >
            <Text
                style={
                    styles.smallInfoLabel
                }
            >
                {label}
            </Text>

            <Text
                style={
                    styles.smallInfoValue
                }
                numberOfLines={1}
            >
                {value}
            </Text>
        </View>
    );
}

// =========================
// STYLES
// =========================

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
            marginBottom: 18,

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

        actionGrid: {
            marginBottom: 15,

            flexDirection:
                "row",

            gap: 8,
        },

        actionButton: {
            flex: 1,

            minHeight: 48,

            alignItems: "center",

            justifyContent:
                "center",

            gap: 4,

            borderWidth: 1,

            borderColor:
                "#dce8df",

            borderRadius: 12,

            backgroundColor:
                "#ffffff",
        },

        actionButtonPressed: {
            opacity: 0.7,
        },

        actionText: {
            color: "#166534",

            fontSize: 9,

            fontWeight: "800",
        },

        filterCard: {
            marginBottom: 15,

            overflow: "hidden",

            borderWidth: 1,

            borderColor:
                "#e2ebe4",

            borderRadius: 18,

            backgroundColor:
                "#ffffff",
        },

        filterHeader: {
            minHeight: 70,

            paddingHorizontal: 15,

            flexDirection:
                "row",

            alignItems: "center",

            justifyContent:
                "space-between",
        },

        filterHeaderLeft: {
            flexDirection:
                "row",

            alignItems: "center",
        },

        filterIcon: {
            width: 38,

            height: 38,

            alignItems: "center",

            justifyContent:
                "center",

            borderRadius: 11,

            backgroundColor:
                "#ecfdf3",
        },

        filterTitle: {
            marginLeft: 10,

            color: "#17231b",

            fontSize: 12,

            fontWeight: "800",
        },

        filterSubtitle: {
            marginTop: 2,

            marginLeft: 10,

            color: "#94a3b8",

            fontSize: 8,
        },

        filterContent: {
            paddingHorizontal: 15,

            paddingBottom: 15,

            borderTopWidth: 1,

            borderTopColor:
                "#edf2ee",
        },

        label: {
            marginTop: 14,

            marginBottom: 7,

            color: "#374151",

            fontSize: 10,

            fontWeight: "700",
        },

        dateInput: {
            height: 50,

            paddingHorizontal: 13,

            flexDirection:
                "row",

            alignItems: "center",

            borderWidth: 1,

            borderColor:
                "#dce8df",

            borderRadius: 12,

            backgroundColor:
                "#fbfdfb",
        },

        dateValue: {
            flex: 1,

            marginLeft: 9,

            color: "#17231b",

            fontSize: 11,

            fontWeight: "600",
        },

        datePlaceholder: {
            flex: 1,

            marginLeft: 9,

            color: "#94a3b8",

            fontSize: 11,
        },

        searchInputContainer: {
            height: 50,

            paddingHorizontal: 13,

            flexDirection:
                "row",

            alignItems: "center",

            borderWidth: 1,

            borderColor:
                "#dce8df",

            borderRadius: 12,

            backgroundColor:
                "#fbfdfb",
        },

        searchInput: {
            flex: 1,

            height: "100%",

            marginLeft: 8,

            color: "#17231b",

            fontSize: 11,
        },

        optionRow: {
            flexDirection:
                "row",

            gap: 7,
        },

        filterOption: {
            flex: 1,

            minHeight: 42,

            alignItems: "center",

            justifyContent:
                "center",

            borderWidth: 1,

            borderColor:
                "#dce8df",

            borderRadius: 11,

            backgroundColor:
                "#ffffff",
        },

        filterOptionActive: {
            borderColor:
                "#166534",

            backgroundColor:
                "#166534",
        },

        filterOptionText: {
            color: "#64748b",

            fontSize: 9,

            fontWeight: "700",
        },

        filterOptionTextActive: {
            color: "#ffffff",
        },

        resetButton: {
            height: 44,

            marginTop: 17,

            flexDirection:
                "row",

            alignItems: "center",

            justifyContent:
                "center",

            gap: 6,

            borderRadius: 11,

            backgroundColor:
                "#f1f5f9",
        },

        resetText: {
            color: "#64748b",

            fontSize: 10,

            fontWeight: "800",
        },

        heroCard: {
            padding: 20,

            borderRadius: 20,

            backgroundColor:
                "#166534",

            elevation: 5,
        },

        heroLabel: {
            color:
                "rgba(255,255,255,.7)",

            fontSize: 10,

            fontWeight: "600",
        },

        heroValue: {
            marginTop: 5,

            color: "#ffffff",

            fontSize: 29,

            fontWeight: "800",
        },

        heroFooter: {
            marginTop: 10,

            color:
                "rgba(255,255,255,.6)",

            fontSize: 9,
        },

        grid: {
            marginTop: 14,

            marginBottom: 24,

            flexDirection:
                "row",

            flexWrap: "wrap",

            justifyContent:
                "space-between",

            rowGap: 11,
        },

        reportCard: {
            width: "48.4%",

            minHeight: 120,

            padding: 14,

            borderWidth: 1,

            borderColor:
                "#e2ebe4",

            borderRadius: 16,

            backgroundColor:
                "#ffffff",
        },

        iconBox: {
            width: 36,

            height: 36,

            alignItems: "center",

            justifyContent:
                "center",

            borderRadius: 11,
        },

        iconGreen: {
            backgroundColor:
                "#ecfdf3",
        },

        iconDanger: {
            backgroundColor:
                "#fef2f2",
        },

        reportLabel: {
            marginTop: 10,

            color: "#64748b",

            fontSize: 9,

            fontWeight: "600",
        },

        reportValue: {
            marginTop: 4,

            color: "#17231b",

            fontSize: 15,

            fontWeight: "800",
        },

        reportValueDanger: {
            color: "#dc2626",
        },

        reportSubtitle: {
            marginTop: 4,

            color: "#94a3b8",

            fontSize: 8,
        },

        sectionHeader: {
            marginBottom: 12,

            flexDirection:
                "row",

            justifyContent:
                "space-between",

            alignItems: "center",
        },

        sectionTitle: {
            color: "#17231b",

            fontSize: 17,

            fontWeight: "800",
        },

        sectionCount: {
            color: "#94a3b8",

            fontSize: 9,
        },

        orderCard: {
            marginBottom: 11,

            padding: 14,

            borderWidth: 1,

            borderColor:
                "#e2ebe4",

            borderRadius: 16,

            backgroundColor:
                "#ffffff",
        },

        orderTop: {
            flexDirection:
                "row",

            alignItems:
                "flex-start",

            justifyContent:
                "space-between",

            gap: 10,
        },

        orderIdentity: {
            flex: 1,

            minWidth: 0,
        },

        customerName: {
            color: "#17231b",

            fontSize: 12,

            fontWeight: "800",
        },

        date: {
            marginTop: 3,

            color: "#94a3b8",

            fontSize: 9,
        },

        amount: {
            color: "#14532d",

            fontSize: 14,

            fontWeight: "800",
        },

        orderInfoGrid: {
            marginTop: 13,

            paddingTop: 12,

            flexDirection:
                "row",

            flexWrap: "wrap",

            rowGap: 11,

            borderTopWidth: 1,

            borderTopColor:
                "#edf2ee",
        },

        smallInfo: {
            width: "50%",
        },

        smallInfoLabel: {
            color: "#94a3b8",

            fontSize: 8,

            fontWeight: "600",
        },

        smallInfoValue: {
            marginTop: 3,

            paddingRight: 8,

            color: "#374151",

            fontSize: 10,

            fontWeight: "700",
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

        emptyText: {
            marginTop: 5,

            color: "#94a3b8",

            fontSize: 9,
        },

        exportingBox: {
            marginTop: 15,

            padding: 13,

            flexDirection:
                "row",

            alignItems: "center",

            justifyContent:
                "center",

            gap: 8,

            borderRadius: 12,

            backgroundColor:
                "#ecfdf3",
        },

        exportingText: {
            color: "#166534",

            fontSize: 10,

            fontWeight: "700",
        },
    });