import { useEffect, useMemo, useState } from "react";

import {
    FaMoneyBillWave,
    FaCreditCard,
    FaCheckCircle,
    FaClock,
    FaSearch
} from "react-icons/fa";

import {
    getOrders,
    updateOrder
} from "../../services/orderService";

import "./Payments.css";

function Payments() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const [activeTab, setActiveTab] = useState("All");
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    useEffect(() => {
        loadPayments();
    }, []);

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timeout = setTimeout(() => {
            setSuccessMessage("");
        }, 2500);

        return () => clearTimeout(timeout);
    }, [successMessage]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getOrders();

            setOrders(response.data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load payment records."
            );
        } finally {
            setLoading(false);
        }
    };

    const paymentSummary = useMemo(() => {
        const paidAmount = orders
            .filter(
                (order) =>
                    order.paymentStatus === "Paid"
            )
            .reduce(
                (total, order) =>
                    total +
                    (Number(order.amount) || 0),
                0
            );

        const unpaidAmount = orders
            .filter(
                (order) =>
                    order.paymentStatus === "Unpaid"
            )
            .reduce(
                (total, order) =>
                    total +
                    (Number(order.amount) || 0),
                0
            );

        const cashAmount = orders
            .filter(
                (order) =>
                    order.paymentMode === "Cash"
            )
            .reduce(
                (total, order) =>
                    total +
                    (Number(order.amount) || 0),
                0
            );

        const onlineAmount = orders
            .filter(
                (order) =>
                    order.paymentMode === "Online"
            )
            .reduce(
                (total, order) =>
                    total +
                    (Number(order.amount) || 0),
                0
            );

        return {
            paidAmount,
            unpaidAmount,
            cashAmount,
            onlineAmount
        };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        const searchText = search
            .trim()
            .toLowerCase();

        return orders.filter((order) => {
            const matchesSearch =
                order.customerName
                    ?.toLowerCase()
                    .includes(searchText);

            let matchesTab = true;

            if (activeTab === "Paid") {
                matchesTab =
                    order.paymentStatus === "Paid";
            }

            if (activeTab === "Unpaid") {
                matchesTab =
                    order.paymentStatus === "Unpaid";
            }

            if (activeTab === "Cash") {
                matchesTab =
                    order.paymentMode === "Cash";
            }

            if (activeTab === "Online") {
                matchesTab =
                    order.paymentMode === "Online";
            }

            return matchesSearch && matchesTab;
        });
    }, [orders, search, activeTab]);

    const handleStatusChange = async (
        order,
        paymentStatus
    ) => {
        try {
            setUpdatingId(order._id);
            setError("");

            await updateOrder(order._id, {
                ...order,
                paymentStatus
            });

            setOrders((currentOrders) =>
                currentOrders.map((currentOrder) =>
                    currentOrder._id === order._id
                        ? {
                              ...currentOrder,
                              paymentStatus
                          }
                        : currentOrder
                )
            );

            setSuccessMessage(
                `Payment marked as ${paymentStatus}.`
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to update payment status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const formatCurrency = (value) =>
        Number(value || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

    const formatDate = (value) => {
        if (!value) {
            return "-";
        }

        return new Date(value).toLocaleDateString(
            "en-GB"
        );
    };

    return (
        <div className="payments-page">
            <div className="payments-header">
                <div>
                    <h1>Payments</h1>

                    <p>
                        Track paid, unpaid, cash and online
                        payments.
                    </p>
                </div>

                <button
                    type="button"
                    className="payments-refresh-btn"
                    onClick={loadPayments}
                >
                    Refresh
                </button>
            </div>

            {successMessage && (
                <div className="payments-success">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="payments-error">
                    {error}
                </div>
            )}

            <div className="payments-summary">
                <div className="payment-summary-card paid-summary">
                    <div className="payment-summary-icon">
                        <FaCheckCircle />
                    </div>

                    <div>
                        <span>Paid Amount</span>

                        <strong>
                            ₹{" "}
                            {formatCurrency(
                                paymentSummary.paidAmount
                            )}
                        </strong>
                    </div>
                </div>

                <div className="payment-summary-card unpaid-summary">
                    <div className="payment-summary-icon">
                        <FaClock />
                    </div>

                    <div>
                        <span>Unpaid Amount</span>

                        <strong>
                            ₹{" "}
                            {formatCurrency(
                                paymentSummary.unpaidAmount
                            )}
                        </strong>
                    </div>
                </div>

                <div className="payment-summary-card cash-summary">
                    <div className="payment-summary-icon">
                        <FaMoneyBillWave />
                    </div>

                    <div>
                        <span>Cash Amount</span>

                        <strong>
                            ₹{" "}
                            {formatCurrency(
                                paymentSummary.cashAmount
                            )}
                        </strong>
                    </div>
                </div>

                <div className="payment-summary-card online-summary">
                    <div className="payment-summary-icon">
                        <FaCreditCard />
                    </div>

                    <div>
                        <span>Online Amount</span>

                        <strong>
                            ₹{" "}
                            {formatCurrency(
                                paymentSummary.onlineAmount
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="payments-controls">
                <div className="payment-tabs">
                    {[
                        "All",
                        "Paid",
                        "Unpaid",
                        "Cash",
                        "Online"
                    ].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            className={
                                activeTab === tab
                                    ? "payment-tab active"
                                    : "payment-tab"
                            }
                            onClick={() =>
                                setActiveTab(tab)
                            }
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="payments-search">
                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search customer..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />
                </div>
            </div>

            <div className="payments-table-card">
                {loading ? (
                    <div className="payments-loading">
                        Loading payments...
                    </div>
                ) : (
                    <div className="payments-table-wrapper">
                        <table className="payments-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Payment Mode</th>
                                    <th>Status</th>
                                    <th>Update Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredOrders.length ===
                                0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="payments-empty"
                                        >
                                            No payment records
                                            found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map(
                                        (order) => (
                                            <tr key={order._id}>
                                                <td>
                                                    {formatDate(
                                                        order.date ||
                                                            order.createdAt
                                                    )}
                                                </td>

                                                <td>
                                                    {
                                                        order.customerName
                                                    }
                                                </td>

                                                <td className="payment-amount-cell">
                                                    ₹{" "}
                                                    {formatCurrency(
                                                        order.amount
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            order.paymentMode ===
                                                            "Cash"
                                                                ? "payment-badge cash-payment"
                                                                : "payment-badge online-payment"
                                                        }
                                                    >
                                                        {
                                                            order.paymentMode
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            order.paymentStatus ===
                                                            "Paid"
                                                                ? "payment-badge paid-payment"
                                                                : "payment-badge unpaid-payment"
                                                        }
                                                    >
                                                        {
                                                            order.paymentStatus
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <select
                                                        className="payment-status-select"
                                                        value={
                                                            order.paymentStatus
                                                        }
                                                        disabled={
                                                            updatingId ===
                                                            order._id
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleStatusChange(
                                                                order,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        <option value="Paid">
                                                            Paid
                                                        </option>

                                                        <option value="Unpaid">
                                                            Unpaid
                                                        </option>
                                                    </select>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Payments;