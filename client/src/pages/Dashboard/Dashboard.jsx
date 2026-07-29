import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FaRupeeSign,
    FaMoneyBillWave,
    FaCreditCard,
    FaShoppingBag,
    FaCheckCircle,
    FaClock,
    FaWeightHanging,
    FaChartLine,
    FaChartBar,
    FaArrowUp,
    FaArrowDown
} from "react-icons/fa";

import { getOrders } from "../../services/orderService";

import RevenueChart from "../../components/dashboard/RevenueChart";
import PaymentModeChart from "../../components/dashboard/PaymentModeChart";
import WeightChart from "../../components/dashboard/WeightChart";
import PaymentStatusChart from "../../components/dashboard/PaymentStatusChart";
import TopCustomers from "../../components/dashboard/TopCustomers";

import "./Dashboard.css";

function Dashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] =
        useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getOrders();

            setOrders(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    "Unable to load dashboard details."
            );
        } finally {
            setLoading(false);
        }
    };

    const dashboardData = useMemo(() => {
        const totalAmount = orders.reduce(
            (total, order) =>
                total +
                (Number(order.amount) || 0),
            0
        );

        const totalPaidAmount = orders
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

        const totalUnpaidAmount = orders
            .filter(
                (order) =>
                    order.paymentStatus ===
                    "Unpaid"
            )
            .reduce(
                (total, order) =>
                    total +
                    (Number(order.amount) || 0),
                0
            );

        const totalCashAmount = orders
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

        const totalOnlineAmount = orders
            .filter(
                (order) =>
                    order.paymentMode ===
                    "Online"
            )
            .reduce(
                (total, order) =>
                    total +
                    (Number(order.amount) || 0),
                0
            );

        const totalWeight = orders.reduce(
            (total, order) =>
                total +
                (Number(order.weight) || 0),
            0
        );

        return {
            totalAmount,
            totalPaidAmount,
            totalUnpaidAmount,
            totalCashAmount,
            totalOnlineAmount,
            totalOrders: orders.length,
            totalWeight
        };
    }, [orders]);

    const monthlyAnalytics = useMemo(() => {
        const monthlyMap = new Map();

        orders.forEach((order) => {
            const value =
                order.date || order.createdAt;

            if (!value) {
                return;
            }

            const orderDate = new Date(value);

            if (
                Number.isNaN(orderDate.getTime())
            ) {
                return;
            }

            const year =
                orderDate.getFullYear();

            const month =
                orderDate.getMonth();

            const key = `${year}-${String(
                month + 1
            ).padStart(2, "0")}`;

            const currentMonth =
                monthlyMap.get(key) || {
                    key,
                    year,
                    month,
                    revenue: 0,
                    weight: 0
                };

            currentMonth.revenue +=
                Number(order.amount) || 0;

            currentMonth.weight +=
                Number(order.weight) || 0;

            monthlyMap.set(
                key,
                currentMonth
            );
        });

        return Array.from(
            monthlyMap.values()
        )
            .sort((first, second) =>
                first.key.localeCompare(
                    second.key
                )
            )
            .slice(-12)
            .map((item) => ({
                month: new Date(
                    item.year,
                    item.month,
                    1
                ).toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        year: "2-digit"
                    }
                ),

                revenue: Number(
                    item.revenue.toFixed(2)
                ),

                weight: Number(
                    item.weight.toFixed(2)
                )
            }));
    }, [orders]);

    const monthlyPerformance = useMemo(() => {
    const now = new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();

    const previousMonthDate =
        new Date(
            currentYear,
            currentMonth - 1,
            1
        );

    const previousMonth =
        previousMonthDate.getMonth();

    const previousMonthYear =
        previousMonthDate.getFullYear();

    let currentMonthRevenue = 0;
    let previousMonthRevenue = 0;

    let currentMonthOrders = 0;
    let previousMonthOrders = 0;

    orders.forEach((order) => {
        const value =
            order.date || order.createdAt;

        if (!value) {
            return;
        }

        const orderDate =
            new Date(value);

        if (
            Number.isNaN(
                orderDate.getTime()
            )
        ) {
            return;
        }

        const amount =
            Number(order.amount) || 0;

        if (
            orderDate.getMonth() ===
                currentMonth &&
            orderDate.getFullYear() ===
                currentYear
        ) {
            currentMonthRevenue += amount;
            currentMonthOrders += 1;
        }

        if (
            orderDate.getMonth() ===
                previousMonth &&
            orderDate.getFullYear() ===
                previousMonthYear
        ) {
            previousMonthRevenue += amount;
            previousMonthOrders += 1;
        }
    });

    const revenueGrowth =
        previousMonthRevenue > 0
            ? ((currentMonthRevenue -
                  previousMonthRevenue) /
                  previousMonthRevenue) *
              100
            : currentMonthRevenue > 0
              ? 100
              : 0;

    const averageOrderValue =
        orders.length > 0
            ? dashboardData.totalAmount /
              orders.length
            : 0;

    return {
        currentMonthRevenue,
        previousMonthRevenue,
        currentMonthOrders,
        previousMonthOrders,
        revenueGrowth,
        averageOrderValue
    };
}, [orders, dashboardData]);

const topCustomers = useMemo(() => {
    const customerMap = new Map();

    orders.forEach((order) => {
        const customerName =
            order.customerName
                ?.trim();

        if (!customerName) {
            return;
        }

        const key =
            customerName.toLowerCase();

        const currentCustomer =
            customerMap.get(key) || {
                name: customerName,
                orders: 0,
                weight: 0,
                amount: 0
            };

        currentCustomer.orders += 1;

        currentCustomer.weight +=
            Number(order.weight) || 0;

        currentCustomer.amount +=
            Number(order.amount) || 0;

        customerMap.set(
            key,
            currentCustomer
        );
    });

    return Array.from(
        customerMap.values()
    )
        .sort(
            (first, second) =>
                second.amount -
                first.amount
        )
        .slice(0, 5);
}, [orders]);

    const paymentModeData = useMemo(
        () => [
            {
                name: "Cash",
                value:
                    dashboardData.totalCashAmount
            },
            {
                name: "Online",
                value:
                    dashboardData.totalOnlineAmount
            }
        ],
        [dashboardData]
    );

    const paymentStatusData = useMemo(
        () => [
            {
                name: "Paid",
                value:
                    dashboardData.totalPaidAmount
            },
            {
                name: "Unpaid",
                value:
                    dashboardData.totalUnpaidAmount
            }
        ],
        [dashboardData]
    );

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort(
                (
                    firstOrder,
                    secondOrder
                ) => {
                    const firstDate =
                        new Date(
                            firstOrder.date ||
                                firstOrder.createdAt
                        );

                    const secondDate =
                        new Date(
                            secondOrder.date ||
                                secondOrder.createdAt
                        );

                    return (
                        secondDate -
                        firstDate
                    );
                }
            )
            .slice(0, 5);
    }, [orders]);

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

        if (
            Number.isNaN(date.getTime())
        ) {
            return "-";
        }

        return date.toLocaleDateString(
            "en-GB"
        );
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="dashboard-spinner" />

                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-heading">
                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Overview of your dragon
                        fruit orders and payments.
                    </p>
                </div>

                <button
                    type="button"
                    className="refresh-dashboard-btn"
                    onClick={loadDashboard}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            <div className="dashboard-stats">
                <div className="dashboard-stat-card revenue-card">
                    <div className="stat-icon">
                        <FaRupeeSign />
                    </div>

                    <div className="stat-content">
                        <span>
                            Total Amount
                        </span>

                        <strong>
                            ₹{" "}
                            {formatCurrency(
                                dashboardData.totalAmount
                            )}
                        </strong>
                    </div>
                </div>

                <div className="dashboard-stat-card paid-card">
                    <div className="stat-icon">
                        <FaCheckCircle />
                    </div>

                    <div className="stat-content">
                        <span>
                            Total Paid Amount
                        </span>

                        <strong>
                            ₹{" "}
                            {formatCurrency(
                                dashboardData.totalPaidAmount
                            )}
                        </strong>
                    </div>
                </div>

                <div className="dashboard-stat-card unpaid-card">
                    <div className="stat-icon">
                        <FaClock />
                    </div>

                    <div className="stat-content">
                        <span>
                            Total Unpaid Amount
                        </span>

                        <strong>
                            ₹{" "}
                            {formatCurrency(
                                dashboardData.totalUnpaidAmount
                            )}
                        </strong>
                    </div>
                </div>

                <div className="dashboard-stat-card cash-card">
                    <div className="stat-icon">
                        <FaMoneyBillWave />
                    </div>

                    <div className="stat-content">
                        <span>
                            Total Cash Amount
                        </span>

                        <strong>
                            ₹{" "}
                            {formatCurrency(
                                dashboardData.totalCashAmount
                            )}
                        </strong>
                    </div>
                </div>

                <div className="dashboard-stat-card online-card">
                    <div className="stat-icon">
                        <FaCreditCard />
                    </div>

                    <div className="stat-content">
                        <span>
                            Total Online Amount
                        </span>

                        <strong>
                            ₹{" "}
                            {formatCurrency(
                                dashboardData.totalOnlineAmount
                            )}
                        </strong>
                    </div>
                </div>

                <div className="dashboard-stat-card orders-card">
                    <div className="stat-icon">
                        <FaShoppingBag />
                    </div>

                    <div className="stat-content">
                        <span>
                            Total Orders
                        </span>

                        <strong>
                            {
                                dashboardData.totalOrders
                            }
                        </strong>
                    </div>
                </div>

                <div className="dashboard-stat-card weight-card">
                    <div className="stat-icon">
                        <FaWeightHanging />
                    </div>

                    <div className="stat-content">
                        <span>
                            Total Weight Sold
                        </span>

                        <strong>
                            {dashboardData.totalWeight.toLocaleString(
                                "en-IN",
                                {
                                    maximumFractionDigits: 2
                                }
                            )}{" "}
                            kg
                        </strong>
                    </div>
                </div>
            </div>
        
            <div className="monthly-performance-grid">
    <div className="performance-card">
        <div className="performance-card-icon current-month-icon">
            <FaChartLine />
        </div>

        <div className="performance-card-content">
            <span>
                Revenue This Month
            </span>

            <strong>
                ₹{" "}
                {formatCurrency(
                    monthlyPerformance.currentMonthRevenue
                )}
            </strong>

            <small>
                {
                    monthlyPerformance.currentMonthOrders
                }{" "}
                orders
            </small>
        </div>
    </div>

    <div className="performance-card">
        <div className="performance-card-icon previous-month-icon">
            <FaChartBar />
        </div>

        <div className="performance-card-content">
            <span>
                Revenue Last Month
            </span>

            <strong>
                ₹{" "}
                {formatCurrency(
                    monthlyPerformance.previousMonthRevenue
                )}
            </strong>

            <small>
                {
                    monthlyPerformance.previousMonthOrders
                }{" "}
                orders
            </small>
        </div>
    </div>

    <div className="performance-card">
        <div
            className={`performance-card-icon ${
                monthlyPerformance.revenueGrowth >=
                0
                    ? "growth-positive-icon"
                    : "growth-negative-icon"
            }`}
        >
            {monthlyPerformance.revenueGrowth >=
            0 ? (
                <FaArrowUp />
            ) : (
                <FaArrowDown />
            )}
        </div>

        <div className="performance-card-content">
            <span>
                Monthly Growth
            </span>

            <strong
                className={
                    monthlyPerformance.revenueGrowth >=
                    0
                        ? "positive-growth"
                        : "negative-growth"
                }
            >
                {monthlyPerformance.revenueGrowth >=
                0
                    ? "+"
                    : ""}
                {monthlyPerformance.revenueGrowth.toFixed(
                    1
                )}
                %
            </strong>

            <small>
                Compared with last month
            </small>
        </div>
    </div>

    <div className="performance-card">
        <div className="performance-card-icon average-value-icon">
            <FaRupeeSign />
        </div>

        <div className="performance-card-content">
            <span>
                Average Order Value
            </span>

            <strong>
                ₹{" "}
                {formatCurrency(
                    monthlyPerformance.averageOrderValue
                )}
            </strong>

            <small>
                Across all orders
            </small>
        </div>
    </div>
</div>

            <div className="dashboard-analytics-grid">
                <RevenueChart
                    data={monthlyAnalytics}
                />

                <PaymentModeChart
                    data={paymentModeData}
                />

                <WeightChart
                    data={monthlyAnalytics}
                />

                <PaymentStatusChart
                    data={paymentStatusData}
                />
            </div>
  
           <TopCustomers customers={topCustomers} />

            <div className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>Recent Orders</h2>

                        <p>
                            Latest five customer
                            orders.
                        </p>
                    </div>
                </div>

                <div className="dashboard-table-wrapper">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>
                                    Customer
                                </th>
                                <th>Weight</th>
                                <th>Amount</th>
                                <th>
                                    Payment
                                </th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentOrders.length ===
                            0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="dashboard-empty"
                                    >
                                        No orders
                                        available yet.
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map(
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
                                                {
                                                    order.weight
                                                }{" "}
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
                                                            ? "dashboard-badge cash-badge"
                                                            : "dashboard-badge online-badge"
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
                                                            ? "dashboard-badge paid-badge"
                                                            : "dashboard-badge unpaid-badge"
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

export default Dashboard;