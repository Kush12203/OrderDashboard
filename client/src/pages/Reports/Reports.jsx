import { useEffect, useMemo, useState } from "react";
import {
    FaCalendarAlt,
    FaFilter,
    FaMoneyBillWave,
    FaShoppingBag,
    FaWeightHanging,
    FaCheckCircle,
    FaClock,
    FaTimes,
    FaPrint
} from "react-icons/fa";

import { getReportOrders } from "../../services/reportService";
import { exportOrdersToExcel } from "../../utils/exportExcel";
import { exportOrdersToPdf } from "../../utils/exportPdf";
import "./Reports.css";

function Reports() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("All");
    const [paymentMode, setPaymentMode] = useState("All");

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getReportOrders();

            setOrders(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    "Unable to load reports."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const orderDateValue =
                order.date || order.createdAt;

            const orderDate = orderDateValue
                ? new Date(orderDateValue)
                : null;

            if (
                orderDate &&
                Number.isNaN(orderDate.getTime())
            ) {
                return false;
            }

            if (startDate) {
                const selectedStartDate = new Date(
                    `${startDate}T00:00:00`
                );

                if (
                    !orderDate ||
                    orderDate < selectedStartDate
                ) {
                    return false;
                }
            }

            if (endDate) {
                const selectedEndDate = new Date(
                    `${endDate}T23:59:59`
                );

                if (
                    !orderDate ||
                    orderDate > selectedEndDate
                ) {
                    return false;
                }
            }

            if (
                customerSearch.trim() &&
                !order.customerName
                    ?.toLowerCase()
                    .includes(
                        customerSearch
                            .trim()
                            .toLowerCase()
                    )
            ) {
                return false;
            }

            if (
                paymentStatus !== "All" &&
                order.paymentStatus !== paymentStatus
            ) {
                return false;
            }

            if (
                paymentMode !== "All" &&
                order.paymentMode !== paymentMode
            ) {
                return false;
            }

            return true;
        });
    }, [
        orders,
        startDate,
        endDate,
        customerSearch,
        paymentStatus,
        paymentMode
    ]);

    const summary = useMemo(() => {
        return filteredOrders.reduce(
            (result, order) => {
                const amount =
                    Number(order.amount) || 0;

                const weight =
                    Number(order.weight) || 0;

                result.totalOrders += 1;
                result.totalAmount += amount;
                result.totalWeight += weight;

                if (
                    order.paymentStatus === "Paid"
                ) {
                    result.paidAmount += amount;
                    result.paidOrders += 1;
                }

                if (
                    order.paymentStatus === "Unpaid"
                ) {
                    result.unpaidAmount += amount;
                    result.unpaidOrders += 1;
                }

                if (
                    order.paymentMode === "Cash"
                ) {
                    result.cashAmount += amount;
                }

                if (
                    order.paymentMode === "Online"
                ) {
                    result.onlineAmount += amount;
                }

                return result;
            },
            {
                totalOrders: 0,
                totalAmount: 0,
                totalWeight: 0,
                paidAmount: 0,
                unpaidAmount: 0,
                cashAmount: 0,
                onlineAmount: 0,
                paidOrders: 0,
                unpaidOrders: 0
            }
        );
    }, [filteredOrders]);

    const resetFilters = () => {
        setStartDate("");
        setEndDate("");
        setCustomerSearch("");
        setPaymentStatus("All");
        setPaymentMode("All");
    };

    const printReport = () => {
    if (!filteredOrders.length) {
        window.alert(
            "No records are available to print."
        );

        return;
    }

    window.print();
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

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("en-GB");
    };

    if (loading) {
        return (
            <div className="reports-loading">
                <div className="reports-spinner" />
                <p>Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="reports-page">
            <div className="reports-heading">
                <div>
                    <h1>Reports</h1>

                    <p>
                        Filter and review order,
                        payment and customer data.
                    </p>
                </div>

                <div
    style={{
        display: "flex",
        gap: "12px"
    }}
>
    <button
        className="reports-refresh-btn"
        onClick={loadOrders}
    >
        Refresh
    </button>

    <button
    type="button"
    className="reports-export-btn"
    onClick={() =>
        exportOrdersToExcel(
            filteredOrders,
            summary,
            {
                startDate,
                endDate,
                customerSearch,
                paymentStatus,
                paymentMode
            }
        )
    }
>
    Export Excel
</button>
<button
    type="button"
    className="reports-pdf-btn"
    onClick={() =>
        exportOrdersToPdf(
            filteredOrders,
            summary,
            {
                startDate,
                endDate,
                customerSearch,
                paymentStatus,
                paymentMode
            }
        )
    }
>
    Export PDF
</button>
<button
    type="button"
    className="reports-print-btn"
    onClick={printReport}
>
    <FaPrint />
    Print
</button>

</div>
            </div>

            {error && (
                <div className="reports-error">
                    {error}
                </div>
            )}

            <div className="reports-filter-card">
                <div className="reports-filter-title">
                    <div>
                        <h2>
                            <FaFilter />
                            Report Filters
                        </h2>

                        <p>
                            Select a date range and
                            other conditions.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="reports-reset-btn"
                        onClick={resetFilters}
                    >
                        <FaTimes />
                        Reset
                    </button>
                </div>

                <div className="reports-filters-grid">
                    <div className="reports-field">
                        <label htmlFor="startDate">
                            Start Date
                        </label>

                        <div className="reports-input-wrapper">
                            <FaCalendarAlt />

                            <input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(event) =>
                                    setStartDate(
                                        event.target.value
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="reports-field">
                        <label htmlFor="endDate">
                            End Date
                        </label>

                        <div className="reports-input-wrapper">
                            <FaCalendarAlt />

                            <input
                                id="endDate"
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(event) =>
                                    setEndDate(
                                        event.target.value
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="reports-field">
                        <label htmlFor="customerSearch">
                            Customer
                        </label>

                        <input
                            id="customerSearch"
                            type="text"
                            placeholder="Search customer..."
                            value={customerSearch}
                            onChange={(event) =>
                                setCustomerSearch(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="reports-field">
                        <label htmlFor="paymentStatus">
                            Payment Status
                        </label>

                        <select
                            id="paymentStatus"
                            value={paymentStatus}
                            onChange={(event) =>
                                setPaymentStatus(
                                    event.target.value
                                )
                            }
                        >
                            <option value="All">
                                All
                            </option>
                            <option value="Paid">
                                Paid
                            </option>
                            <option value="Unpaid">
                                Unpaid
                            </option>
                        </select>
                    </div>

                    <div className="reports-field">
                        <label htmlFor="paymentMode">
                            Payment Mode
                        </label>

                        <select
                            id="paymentMode"
                            value={paymentMode}
                            onChange={(event) =>
                                setPaymentMode(
                                    event.target.value
                                )
                            }
                        >
                            <option value="All">
                                All
                            </option>
                            <option value="Cash">
                                Cash
                            </option>
                            <option value="Online">
                                Online
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="reports-summary-grid">
                <div className="report-summary-card">
                    <div className="report-summary-icon total-icon">
                        <FaMoneyBillWave />
                    </div>

                    <div>
                        <span>Total Amount</span>

                        <strong>
                            ₹{" "}
                            {formatCurrency(
                                summary.totalAmount
                            )}
                        </strong>
                    </div>
                </div>

                <div className="report-summary-card">
                    <div className="report-summary-icon orders-icon">
                        <FaShoppingBag />
                    </div>

                    <div>
                        <span>Total Orders</span>

                        <strong>
                            {summary.totalOrders}
                        </strong>
                    </div>
                </div>

                <div className="report-summary-card">
                    <div className="report-summary-icon weight-icon">
                        <FaWeightHanging />
                    </div>

                    <div>
                        <span>Total Weight</span>

                        <strong>
                            {Number(
                                summary.totalWeight
                            ).toLocaleString(
                                "en-IN",
                                {
                                    maximumFractionDigits: 2
                                }
                            )}{" "}
                            kg
                        </strong>
                    </div>
                </div>

                <div className="report-summary-card">
                    <div className="report-summary-icon paid-icon">
                        <FaCheckCircle />
                    </div>

                    <div>
                        <span>Paid Amount</span>

                        <strong>
                            ₹{" "}
                            {formatCurrency(
                                summary.paidAmount
                            )}
                        </strong>

                        <small>
                            {summary.paidOrders} paid
                            orders
                        </small>
                    </div>
                </div>

                <div className="report-summary-card">
                    <div className="report-summary-icon unpaid-icon">
                        <FaClock />
                    </div>

                    <div>
                        <span>Unpaid Amount</span>

                        <strong>
                            ₹{" "}
                            {formatCurrency(
                                summary.unpaidAmount
                            )}
                        </strong>

                        <small>
                            {summary.unpaidOrders} unpaid
                            orders
                        </small>
                    </div>
                </div>
            </div>
            
            <div className="reports-print-header">
    <h1>SHIVALIK DRAGON FARM</h1>

    <h2>Orders and Payments Report</h2>

    <p>
        Generated on:{" "}
        {new Date().toLocaleString("en-IN")}
    </p>

    <div className="reports-print-filters">
        <span>
            Start Date: {startDate || "All"}
        </span>

        <span>
            End Date: {endDate || "All"}
        </span>

        <span>
            Customer:{" "}
            {customerSearch || "All"}
        </span>

        <span>
            Status: {paymentStatus}
        </span>

        <span>
            Mode: {paymentMode}
        </span>
    </div>
</div>

            <div className="reports-table-card">
                <div className="reports-table-heading">
                    <div>
                        <h2>Order Report</h2>

                        <p>
                            Showing{" "}
                            {filteredOrders.length} of{" "}
                            {orders.length} orders.
                        </p>
                    </div>
                </div>

                <div className="reports-table-wrapper">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Weight</th>
                                <th>Amount</th>
                                <th>
                                    Payment Mode
                                </th>
                                <th>
                                    Payment Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredOrders.length ===
                            0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="reports-empty"
                                    >
                                        No records match
                                        the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(
                                    (order) => (
                                        <tr
                                            key={
                                                order._id
                                            }
                                        >
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

                                            <td>
                                                {Number(
                                                    order.weight ||
                                                        0
                                                ).toLocaleString(
                                                    "en-IN",
                                                    {
                                                        maximumFractionDigits: 2
                                                    }
                                                )}{" "}
                                                kg
                                            </td>

                                            <td>
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
                                                            ? "report-badge cash-badge"
                                                            : "report-badge online-badge"
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
                                                            ? "report-badge paid-badge"
                                                            : "report-badge unpaid-badge"
                                                    }
                                                >
                                                    {
                                                        order.paymentStatus
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Reports;