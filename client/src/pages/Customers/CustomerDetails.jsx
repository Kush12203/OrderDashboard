import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    FaArrowLeft,
    FaPhone,
    FaMapMarkerAlt,
    FaShoppingBag,
    FaWeightHanging,
    FaMoneyBillWave,
    FaCheckCircle,
    FaClock
} from "react-icons/fa";

import { getCustomerDetails } from "../../services/customerService";

import "./CustomerDetails.css";

const CustomerDetails = () => {
    const navigate = useNavigate();

    const { customerName } = useParams();

    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadCustomer = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getCustomerDetails(
                    decodeURIComponent(customerName)
                );

            setCustomer(
                response.data.customer || null
            );

            setOrders(response.data.orders || []);
        } catch (err) {
            console.error(
                "Customer details error:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Unable to load customer details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomer();
    }, [customerName]);

    const formatCurrency = (value) =>
        Number(value || 0).toLocaleString(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
            }
        );

    const formatNumber = (value) =>
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

        return date.toLocaleDateString("en-IN");
    };

    const sortedOrders = useMemo(() => {
        return [...orders].sort((a, b) => {
            const firstDate = new Date(
                a.date || a.createdAt
            );

            const secondDate = new Date(
                b.date || b.createdAt
            );

            return secondDate - firstDate;
        });
    }, [orders]);

    if (loading) {
        return (
            <div className="customer-details-state">
                Loading customer details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="customer-details-state customer-details-error">
                <p>{error}</p>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/customers")
                    }
                >
                    Back to Customers
                </button>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="customer-details-state">
                Customer not found.
            </div>
        );
    }

    return (
        <div className="customer-details-page">
            <div className="customer-details-heading">
                <div>
                    <button
                        type="button"
                        className="customer-back-btn"
                        onClick={() =>
                            navigate("/customers")
                        }
                    >
                        <FaArrowLeft />
                        Back to Customers
                    </button>

                    <h1>
                        {customer.customerName}
                    </h1>

                    <p>
                        Complete purchase and payment
                        history
                    </p>
                </div>

                <button
                    type="button"
                    className="customer-details-refresh-btn"
                    onClick={loadCustomer}
                >
                    Refresh
                </button>
            </div>

            <div className="customer-profile-card">
                <div className="customer-profile-avatar">
                    {customer.customerName
                        ?.charAt(0)
                        .toUpperCase() || "C"}
                </div>

                <div className="customer-profile-info">
                    <h2>
                        {customer.customerName}
                    </h2>

                    <div className="customer-profile-contact">
                        <span>
                            <FaPhone />
                            {customer.phone ||
                                "Phone not available"}
                        </span>

                        <span>
                            <FaMapMarkerAlt />
                            {customer.address ||
                                "Address not available"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="customer-details-summary-grid">
                <div className="customer-details-summary-card">
                    <div className="customer-details-summary-icon details-blue">
                        <FaShoppingBag />
                    </div>

                    <div>
                        <span>Total Orders</span>

                        <strong>
                            {customer.totalOrders || 0}
                        </strong>

                        <small>
                            Lifetime orders
                        </small>
                    </div>
                </div>

                <div className="customer-details-summary-card">
                    <div className="customer-details-summary-icon details-orange">
                        <FaWeightHanging />
                    </div>

                    <div>
                        <span>Total Weight</span>

                        <strong>
                            {formatNumber(
                                customer.totalWeight
                            )}{" "}
                            kg
                        </strong>

                        <small>
                            Total quantity purchased
                        </small>
                    </div>
                </div>

                <div className="customer-details-summary-card">
                    <div className="customer-details-summary-icon details-purple">
                        <FaMoneyBillWave />
                    </div>

                    <div>
                        <span>Total Purchased</span>

                        <strong>
                            {formatCurrency(
                                customer.totalPurchased
                            )}
                        </strong>

                        <small>
                            Lifetime purchase value
                        </small>
                    </div>
                </div>

                <div className="customer-details-summary-card">
                    <div className="customer-details-summary-icon details-green">
                        <FaCheckCircle />
                    </div>

                    <div>
                        <span>Paid Amount</span>

                        <strong>
                            {formatCurrency(
                                customer.paidAmount
                            )}
                        </strong>

                        <small>
                            {customer.paidOrders || 0}{" "}
                            paid orders
                        </small>
                    </div>
                </div>

                <div className="customer-details-summary-card">
                    <div className="customer-details-summary-icon details-red">
                        <FaClock />
                    </div>

                    <div>
                        <span>Outstanding</span>

                        <strong>
                            {formatCurrency(
                                customer.outstandingAmount
                            )}
                        </strong>

                        <small>
                            {customer.unpaidOrders || 0}{" "}
                            unpaid orders
                        </small>
                    </div>
                </div>
            </div>

            <div className="customer-history-card">
                <div className="customer-history-heading">
                    <div>
                        <h2>Order History</h2>

                        <p>
                            All orders placed by this
                            customer
                        </p>
                    </div>

                    <span>
                        {sortedOrders.length} order
                        {sortedOrders.length === 1
                            ? ""
                            : "s"}
                    </span>
                </div>

                {sortedOrders.length === 0 ? (
                    <div className="customer-history-empty">
                        No orders found.
                    </div>
                ) : (
                    <div className="customer-history-table-wrapper">
                        <table className="customer-history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Weight</th>
                                    <th>Rate</th>
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
                                {sortedOrders.map(
                                    (order) => (
                                        <tr key={order._id}>
                                            <td>
                                                {formatDate(
                                                    order.date ||
                                                        order.createdAt
                                                )}
                                            </td>

                                            <td>
                                                {formatNumber(
                                                    order.weight
                                                )}{" "}
                                                kg
                                            </td>

                                            <td>
                                                {formatCurrency(
                                                    order.rate
                                                )}
                                            </td>

                                            <td>
                                                <strong>
                                                    {formatCurrency(
                                                        order.amount
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className="customer-mode-badge">
                                                    {order.paymentMode ||
                                                        "-"}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        order.paymentStatus ===
                                                        "Paid"
                                                            ? "customer-status-paid"
                                                            : "customer-status-unpaid"
                                                    }
                                                >
                                                    {order.paymentStatus ||
                                                        "-"}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetails;