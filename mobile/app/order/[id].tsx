import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

import {
    Ionicons,
} from "@expo/vector-icons";

import api from "../../services/api";

type PaymentMode =
    | "Cash"
    | "Online";

type PaymentStatus =
    | "Paid"
    | "Unpaid";

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
    notes?: string;
};

export default function EditOrder() {
    const router = useRouter();

    const { id } =
        useLocalSearchParams<{
            id: string;
        }>();

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [date, setDate] =
        useState("");

    const [customerName, setCustomerName] =
        useState("");

    const [weight, setWeight] =
        useState("");

    const [rate, setRate] =
        useState("");

    const [paymentMode, setPaymentMode] =
        useState<PaymentMode>("Cash");

    const [
        paymentStatus,
        setPaymentStatus,
    ] = useState<PaymentStatus>(
        "Unpaid"
    );

    const [phone, setPhone] =
        useState("");

    const [address, setAddress] =
        useState("");

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true);

            const response =
                await api.get(
                    `/orders/${id}`
                );

            const order: Order =
                response.data;

            setDate(
                order.date
                    ? new Date(order.date)
                          .toISOString()
                          .split("T")[0]
                    : ""
            );

            setCustomerName(
                order.customerName || ""
            );

            setWeight(
                order.weight !== undefined
                    ? String(order.weight)
                    : ""
            );

            setRate(
                order.rate !== undefined
                    ? String(order.rate)
                    : ""
            );

            setPaymentMode(
                order.paymentMode ||
                    "Cash"
            );

            setPaymentStatus(
                order.paymentStatus ||
                    "Unpaid"
            );

            setPhone(
                order.phone || ""
            );

            setAddress(
                order.address || ""
            );
        } catch (error: any) {
            console.error(
                "Load order error:",
                error.response?.data ||
                    error
            );

            Alert.alert(
                "Unable to Load Order",
                error.response?.data
                    ?.message ||
                    "Order could not be loaded.",
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

    const totalAmount =
        useMemo(() => {
            const weightValue =
                Number(weight);

            const rateValue =
                Number(rate);

            if (
                Number.isNaN(
                    weightValue
                ) ||
                Number.isNaN(
                    rateValue
                )
            ) {
                return 0;
            }

            return (
                weightValue *
                rateValue
            );
        }, [weight, rate]);

    const formatAmount = (
        value: number
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

    const handleUpdate = async () => {
        if (!date) {
            Alert.alert(
                "Missing Date",
                "Please enter the order date."
            );

            return;
        }

        if (!customerName.trim()) {
            Alert.alert(
                "Missing Customer",
                "Please enter the customer name."
            );

            return;
        }

        if (
            weight === "" ||
            Number(weight) <= 0
        ) {
            Alert.alert(
                "Invalid Weight",
                "Weight must be greater than 0."
            );

            return;
        }

        if (
            rate === "" ||
            Number(rate) < 0
        ) {
            Alert.alert(
                "Invalid Rate",
                "Rate must be 0 or more."
            );

            return;
        }

        try {
            setSaving(true);

            await api.put(
                `/orders/${id}`,
                {
                    date,

                    customerName:
                        customerName.trim(),

                    weight:
                        Number(weight),

                    rate:
                        Number(rate),

                    amount:
                        totalAmount,

                    paymentMode,
                    paymentStatus,

                    phone:
                        phone.trim(),

                    address:
                        address.trim(),
                }
            );

            Alert.alert(
                "Order Updated",
                "Order updated successfully.",
                [
                    {
                        text: "OK",
                        onPress: () =>
                            router.back(),
                    },
                ]
            );
        } catch (error: any) {
            console.error(
                "Update order error:",
                error.response?.data ||
                    error
            );

            Alert.alert(
                "Update Failed",
                error.response?.data
                    ?.message ||
                    "Unable to update order."
            );
        } finally {
            setSaving(false);
        }
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
                    Loading order...
                </Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={
                Platform.OS === "ios"
                    ? "padding"
                    : undefined
            }
        >
            <ScrollView
                contentContainerStyle={
                    styles.content
                }
                showsVerticalScrollIndicator={
                    false
                }
                keyboardShouldPersistTaps="handled"
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
                            size={21}
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
                                styles.title
                            }
                        >
                            Edit Order
                        </Text>

                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Update customer and
                            order details.
                        </Text>
                    </View>
                </View>

                <View
                    style={
                        styles.formCard
                    }
                >
                    <FieldLabel
                        title="Order Date"
                    />

                    <TextInput
                        style={
                            styles.input
                        }
                        value={date}
                        onChangeText={
                            setDate
                        }
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94a3b8"
                    />

                    <FieldLabel
                        title="Customer Name"
                    />

                    <TextInput
                        style={
                            styles.input
                        }
                        value={
                            customerName
                        }
                        onChangeText={
                            setCustomerName
                        }
                        placeholder="Enter customer name"
                        placeholderTextColor="#94a3b8"
                    />

                    <View
                        style={
                            styles.row
                        }
                    >
                        <View
                            style={
                                styles.halfField
                            }
                        >
                            <FieldLabel
                                title="Weight (kg)"
                            />

                            <TextInput
                                style={
                                    styles.input
                                }
                                value={
                                    weight
                                }
                                onChangeText={
                                    setWeight
                                }
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View
                            style={
                                styles.halfField
                            }
                        >
                            <FieldLabel
                                title="Price per kg"
                            />

                            <TextInput
                                style={
                                    styles.input
                                }
                                value={rate}
                                onChangeText={
                                    setRate
                                }
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    <View
                        style={
                            styles.amountCard
                        }
                    >
                        <View>
                            <Text
                                style={
                                    styles.amountLabel
                                }
                            >
                                Calculated Total
                            </Text>

                            <Text
                                style={
                                    styles.amountHint
                                }
                            >
                                Weight × Rate
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.amountValue
                            }
                        >
                            ₹{" "}
                            {formatAmount(
                                totalAmount
                            )}
                        </Text>
                    </View>

                    <FieldLabel
                        title="Payment Mode"
                    />

                    <View
                        style={
                            styles.optionRow
                        }
                    >
                        <OptionButton
                            title="Cash"
                            active={
                                paymentMode ===
                                "Cash"
                            }
                            onPress={() =>
                                setPaymentMode(
                                    "Cash"
                                )
                            }
                        />

                        <OptionButton
                            title="Online"
                            active={
                                paymentMode ===
                                "Online"
                            }
                            onPress={() =>
                                setPaymentMode(
                                    "Online"
                                )
                            }
                        />
                    </View>

                    <FieldLabel
                        title="Payment Status"
                    />

                    <View
                        style={
                            styles.optionRow
                        }
                    >
                        <OptionButton
                            title="Unpaid"
                            active={
                                paymentStatus ===
                                "Unpaid"
                            }
                            onPress={() =>
                                setPaymentStatus(
                                    "Unpaid"
                                )
                            }
                        />

                        <OptionButton
                            title="Paid"
                            active={
                                paymentStatus ===
                                "Paid"
                            }
                            onPress={() =>
                                setPaymentStatus(
                                    "Paid"
                                )
                            }
                        />
                    </View>

                    <FieldLabel
                        title="Phone"
                    />

                    <TextInput
                        style={
                            styles.input
                        }
                        value={phone}
                        onChangeText={
                            setPhone
                        }
                        placeholder="Optional phone number"
                        placeholderTextColor="#94a3b8"
                        keyboardType="phone-pad"
                    />

                    <FieldLabel
                        title="Address"
                    />

                    <TextInput
                        style={[
                            styles.input,
                            styles.addressInput,
                        ]}
                        value={address}
                        onChangeText={
                            setAddress
                        }
                        placeholder="Optional address"
                        placeholderTextColor="#94a3b8"
                        multiline
                        textAlignVertical="top"
                    />

                    <Pressable
                        style={({ pressed }) => [
                            styles.saveButton,

                            pressed &&
                                styles.saveButtonPressed,

                            saving &&
                                styles.saveButtonDisabled,
                        ]}
                        onPress={
                            handleUpdate
                        }
                        disabled={saving}
                    >
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={19}
                            color="#ffffff"
                        />

                        <Text
                            style={
                                styles.saveButtonText
                            }
                        >
                            {saving
                                ? "Updating..."
                                : "Update Order"}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function FieldLabel({
    title,
}: {
    title: string;
}) {
    return (
        <Text
            style={
                styles.label
            }
        >
            {title}
        </Text>
    );
}

function OptionButton({
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
            onPress={onPress}
            style={[
                styles.optionButton,

                active &&
                    styles.optionButtonActive,
            ]}
        >
            <Text
                style={[
                    styles.optionText,

                    active &&
                        styles.optionTextActive,
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
    },

    backButton: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 13,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dce8df",
    },

    headerText: {
        flex: 1,
        marginLeft: 13,
    },

    title: {
        color: "#142019",
        fontSize: 27,
        fontWeight: "800",
    },

    subtitle: {
        marginTop: 4,
        color: "#64748b",
        fontSize: 11,
    },

    formCard: {
        padding: 18,
        borderRadius: 21,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e2ebe4",
        elevation: 3,
    },

    label: {
        marginTop: 14,
        marginBottom: 8,
        color: "#374151",
        fontSize: 11,
        fontWeight: "700",
    },

    input: {
        minHeight: 52,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#dce8df",
        borderRadius: 13,
        backgroundColor: "#fbfdfb",
        color: "#17231b",
        fontSize: 13,
    },

    row: {
        flexDirection: "row",
        gap: 10,
    },

    halfField: {
        flex: 1,
    },

    amountCard: {
        marginTop: 20,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent:
            "space-between",
        borderRadius: 15,
        backgroundColor: "#f0fdf4",
        borderWidth: 1,
        borderColor: "#d7f2df",
    },

    amountLabel: {
        color: "#166534",
        fontSize: 11,
        fontWeight: "800",
    },

    amountHint: {
        marginTop: 3,
        color: "#7f9384",
        fontSize: 9,
    },

    amountValue: {
        color: "#14532d",
        fontSize: 23,
        fontWeight: "800",
    },

    optionRow: {
        flexDirection: "row",
        gap: 10,
    },

    optionButton: {
        flex: 1,
        minHeight: 47,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#dce8df",
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },

    optionButtonActive: {
        borderColor: "#166534",
        backgroundColor: "#166534",
    },

    optionText: {
        color: "#64748b",
        fontSize: 11,
        fontWeight: "700",
    },

    optionTextActive: {
        color: "#ffffff",
    },

    addressInput: {
        minHeight: 88,
        paddingTop: 13,
        paddingBottom: 13,
    },

    saveButton: {
        height: 54,
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 13,
        backgroundColor: "#166534",
        elevation: 4,
    },

    saveButtonPressed: {
        opacity: 0.88,
    },

    saveButtonDisabled: {
        opacity: 0.65,
    },

    saveButtonText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "800",
    },
});