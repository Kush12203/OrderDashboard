import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    FaArrowLeft,
    FaPrint,
    FaFilePdf
} from "react-icons/fa";

import {
    getOrder
} from "../../services/orderService";

import "./Invoice.css";

const Invoice = () => {
    const navigate = useNavigate();

    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

const loadOrder = async () => {
    try {
        setLoading(true);
        setError("");

        const response = await getOrder(id);

        console.log(
            "Invoice API response:",
            response.data
        );

        const orderData =
            response.data?.order ||
            response.data?.data ||
            response.data;

        if (!orderData || !orderData._id) {
            throw new Error(
                "Order data was not returned correctly."
            );
        }

        setOrder(orderData);
    } catch (error) {
        console.error(
            "Invoice loading error:",
            error
        );

        setError(
            error.response?.data?.message ||
            error.message ||
            "Unable to load invoice."
        );
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        loadOrder();
    }, [id]);

    const formatCurrency = (value) => {
        return Number(
            value || 0
        ).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
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
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const getInvoiceNumber = () => {
        if (!order) {
            return "";
        }

        const date = new Date(
            order.date || order.createdAt
        );

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        const shortId =
            order._id
                ?.slice(-5)
                .toUpperCase() || "00000";

        return `INV-${year}${month}${day}-${shortId}`;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="invoice-state">
                Loading invoice...
            </div>
        );
    }

    if (error) {
        return (
            <div className="invoice-state invoice-error">
                <p>{error}</p>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/orders")
                    }
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="invoice-state">
                Invoice not found.
            </div>
        );
    }
if (order.paymentStatus !== "Paid") {
    return (
        <div className="invoice-state invoice-error">
            <p>
                Invoice is available only after payment is completed.
            </p>

            <button
                type="button"
                onClick={() =>
                    navigate("/orders")
                }
            >
                Back to Orders
            </button>
        </div>
    );
}

    return (
        <div className="invoice-page">
            <div className="invoice-toolbar">
                <button
                    type="button"
                    className="invoice-back-btn"
                    onClick={() =>
                        navigate("/orders")
                    }
                >
                    <FaArrowLeft />
                    Back to Orders
                </button>

                <div className="invoice-actions">
                    <button
                        type="button"
                        className="invoice-print-btn"
                        onClick={handlePrint}
                    >
                        <FaPrint />
                        Print
                    </button>

                    <button
                        type="button"
                        className="invoice-pdf-btn"
                        onClick={
                            handleDownloadPdf
                        }
                    >
                        <FaFilePdf />
                        Save PDF
                    </button>
                </div>
            </div>

            <div className="invoice-sheet">
                <div className="invoice-top">
                    <div>
                        <h1>
                            SHIVALIK DRAGON FARM
                        </h1>

                        <p>
                            Fresh Dragon Fruit Farm
                        </p>
                    </div>

                    <div className="invoice-title">
                        <h2>INVOICE</h2>

                        <span>
                            {getInvoiceNumber()}
                        </span>
                    </div>
                </div>

                <div className="invoice-divider" />

                <div className="invoice-info-grid">
                    <div className="invoice-bill-to">
                        <span className="invoice-label">
                            BILL TO
                        </span>

                        <h3>
                            {order.customerName}
                        </h3>

                        <p>
                            {order.phone ||
                                "Phone not available"}
                        </p>

                        <p>
                            {order.address ||
                                "Address not available"}
                        </p>
                    </div>

                    <div className="invoice-meta">
                        <div>
                            <span>
                                Invoice Date
                            </span>

                            <strong>
                                {formatDate(
                                    order.date ||
                                    order.createdAt
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Payment Mode
                            </span>

                            <strong>
                                {order.paymentMode ||
                                    "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Payment Status
                            </span>

                            <strong
                                className={
                                    order.paymentStatus ===
                                    "Paid"
                                        ? "invoice-paid"
                                        : "invoice-unpaid"
                                }
                            >
                                {order.paymentStatus ||
                                    "-"}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="invoice-table-wrapper">
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Weight</th>
                                <th>Rate</th>
                                <th>Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>
                                    Fresh Dragon Fruit
                                </td>

                                <td>
                                    {Number(
                                        order.weight ||
                                        0
                                    ).toLocaleString(
                                        "en-IN",
                                        {
                                            maximumFractionDigits:
                                                2
                                        }
                                    )}{" "}
                                    kg
                                </td>

                                <td>
                                    {formatCurrency(
                                        order.rate
                                    )}
                                    /kg
                                </td>

                                <td>
                                    {formatCurrency(
                                        order.amount
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="invoice-total-section">
                    <div className="invoice-notes">
                        <span className="invoice-label">
                            NOTES
                        </span>

                        <p>
                            Thank you for choosing
                            Shivalik Dragon Farm.
                        </p>
                    </div>

                    <div className="invoice-totals">
                        <div>
                            <span>Subtotal</span>

                            <strong>
                                {formatCurrency(
                                    order.amount
                                )}
                            </strong>
                        </div>

                        <div className="invoice-grand-total">
                            <span>
                                Total Amount
                            </span>

                            <strong>
                                {formatCurrency(
                                    order.amount
                                )}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="invoice-footer">
                    <p>
                        Shivalik Dragon Farm
                    </p>

                    <p>
                        Thank you for your business!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;