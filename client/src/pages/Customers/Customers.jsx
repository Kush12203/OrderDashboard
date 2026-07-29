import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    FaUsers,
    FaSearch,
    FaShoppingBag,
    FaWeightHanging,
    FaMoneyBillWave,
    FaClock,
    FaPhone,
    FaMapMarkerAlt
} from "react-icons/fa";

import {
    getCustomers
} from "../../services/customerService";

import "./Customers.css";

const Customers = () => {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadCustomers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCustomers();

            setCustomers(
                response.data.customers || []
            );
        } catch (err) {
            console.error(
                "Customer loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Unable to load customers."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        const searchValue = search
            .trim()
            .toLowerCase();

        if (!searchValue) {
            return customers;
        }

        return customers.filter((customer) => {
            const customerName =
                customer.customerName
                    ?.toLowerCase() || "";

            const phone =
                customer.phone
                    ?.toLowerCase() || "";

            const address =
                customer.address
                    ?.toLowerCase() || "";

            return (
                customerName.includes(searchValue) ||
                phone.includes(searchValue) ||
                address.includes(searchValue)
            );
        });
    }, [customers, search]);

    const summary = useMemo(() => {
        return customers.reduce(
            (result, customer) => {
                result.totalCustomers += 1;

                result.totalOrders +=
                    Number(
                        customer.totalOrders
                    ) || 0;

                result.totalWeight +=
                    Number(
                        customer.totalWeight
                    ) || 0;

                result.totalPurchased +=
                    Number(
                        customer.totalPurchased
                    ) || 0;

                result.outstandingAmount +=
                    Number(
                        customer.outstandingAmount
                    ) || 0;

                return result;
            },
            {
                totalCustomers: 0,
                totalOrders: 0,
                totalWeight: 0,
                totalPurchased: 0,
                outstandingAmount: 0
            }
        );
    }, [customers]);

    const formatCurrency = (value) => {
        return Number(
            value || 0
        ).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });
    };

    const formatNumber = (value) => {
        return Number(
            value || 0
        ).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
    };

    const formatDate = (value) => {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString(
            "en-IN"
        );
    };

    const handleViewHistory = (
        customerName
    ) => {
        navigate(
            `/customers/${encodeURIComponent(
                customerName
            )}`
        );
    };

    return (
        <div className="customers-page">
            <div className="customers-heading">
                <div>
                    <h1>Customers</h1>

                    <p>
                        View customer purchases,
                        outstanding balances and order
                        activity.
                    </p>
                </div>

                <button
                    type="button"
                    className="customers-refresh-btn"
                    onClick={loadCustomers}
                    disabled={loading}
                >
                    {loading
                        ? "Refreshing..."
                        : "Refresh"}
                </button>
            </div>

            <div className="customers-summary-grid">
                <div className="customer-summary-card">
                    <div className="customer-summary-icon customers-icon-blue">
                        <FaUsers />
                    </div>

                    <div>
                        <span>
                            Total Customers
                        </span>

                        <strong>
                            {
                                summary.totalCustomers
                            }
                        </strong>

                        <small>
                            Registered through orders
                        </small>
                    </div>
                </div>

                <div className="customer-summary-card">
                    <div className="customer-summary-icon customers-icon-purple">
                        <FaShoppingBag />
                    </div>

                    <div>
                        <span>Total Orders</span>

                        <strong>
                            {summary.totalOrders}
                        </strong>

                        <small>
                            Across all customers
                        </small>
                    </div>
                </div>

                <div className="customer-summary-card">
                    <div className="customer-summary-icon customers-icon-orange">
                        <FaWeightHanging />
                    </div>

                    <div>
                        <span>Total Weight</span>

                        <strong>
                            {formatNumber(
                                summary.totalWeight
                            )}{" "}
                            kg
                        </strong>

                        <small>
                            Total product sold
                        </small>
                    </div>
                </div>

                <div className="customer-summary-card">
                    <div className="customer-summary-icon customers-icon-green">
                        <FaMoneyBillWave />
                    </div>

                    <div>
                        <span>
                            Total Purchased
                        </span>

                        <strong>
                            {formatCurrency(
                                summary.totalPurchased
                            )}
                        </strong>

                        <small>
                            Lifetime customer sales
                        </small>
                    </div>
                </div>

                <div className="customer-summary-card">
                    <div className="customer-summary-icon customers-icon-red">
                        <FaClock />
                    </div>

                    <div>
                        <span>Outstanding</span>

                        <strong>
                            {formatCurrency(
                                summary.outstandingAmount
                            )}
                        </strong>

                        <small>
                            Total unpaid amount
                        </small>
                    </div>
                </div>
            </div>

            <div className="customers-search-card">
                <div className="customers-search-box">
                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search by customer, phone or address..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />
                </div>

                <span>
                    {filteredCustomers.length}{" "}
                    customer
                    {filteredCustomers.length ===
                    1
                        ? ""
                        : "s"}
                </span>
            </div>

            <div className="customers-table-card">
                <div className="customers-table-heading">
                    <div>
                        <h2>Customer List</h2>

                        <p>
                            Customer performance and
                            payment summary
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="customers-state">
                        Loading customers...
                    </div>
                ) : error ? (
                    <div className="customers-state customers-error">
                        <p>{error}</p>

                        <button
                            type="button"
                            className="customers-refresh-btn"
                            onClick={
                                loadCustomers
                            }
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredCustomers.length ===
                  0 ? (
                    <div className="customers-state">
                        No customers found.
                    </div>
                ) : (
                    <div className="customers-table-wrapper">
                        <table className="customers-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Contact</th>
                                    <th>Orders</th>
                                    <th>Weight</th>
                                    <th>
                                        Total Purchased
                                    </th>
                                    <th>Paid</th>
                                    <th>
                                        Outstanding
                                    </th>
                                    <th>Last Order</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCustomers.map(
                                    (customer) => (
                                        <tr
                                            key={
                                                customer.customerKey ||
                                                customer.customerName
                                            }
                                        >
                                            <td>
                                                <div className="customer-name-cell">
                                                    <div className="customer-avatar">
                                                        {customer.customerName
                                                            ?.charAt(
                                                                0
                                                            )
                                                            .toUpperCase() ||
                                                            "C"}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                customer.customerName
                                                            }
                                                        </strong>

                                                        <small>
                                                            {Number(
                                                                customer.unpaidOrders
                                                            ) ||
                                                                0}{" "}
                                                            unpaid
                                                            order
                                                            {Number(
                                                                customer.unpaidOrders
                                                            ) ===
                                                            1
                                                                ? ""
                                                                : "s"}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="customer-contact">
                                                    <span>
                                                        <FaPhone />

                                                        {customer.phone ||
                                                            "No phone"}
                                                    </span>

                                                    <span>
                                                        <FaMapMarkerAlt />

                                                        {customer.address ||
                                                            "No address"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                {Number(
                                                    customer.totalOrders
                                                ) ||
                                                    0}
                                            </td>

                                            <td>
                                                {formatNumber(
                                                    customer.totalWeight
                                                )}{" "}
                                                kg
                                            </td>

                                            <td>
                                                {formatCurrency(
                                                    customer.totalPurchased
                                                )}
                                            </td>

                                            <td>
                                                <span className="customer-paid-amount">
                                                    {formatCurrency(
                                                        customer.paidAmount
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        Number(
                                                            customer.outstandingAmount
                                                        ) >
                                                        0
                                                            ? "customer-outstanding-badge"
                                                            : "customer-clear-badge"
                                                    }
                                                >
                                                    {Number(
                                                        customer.outstandingAmount
                                                    ) >
                                                    0
                                                        ? formatCurrency(
                                                              customer.outstandingAmount
                                                          )
                                                        : "Cleared"}
                                                </span>
                                            </td>

                                            <td>
                                                {formatDate(
                                                    customer.lastOrderDate
                                                )}
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="customer-view-btn"
                                                    onClick={() =>
                                                        handleViewHistory(
                                                            customer.customerName
                                                        )
                                                    }
                                                >
                                                    View History
                                                </button>
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

export default Customers;