import { useEffect, useState } from "react";

import {
    FaSearch,
    FaPlus,
    FaEdit,
    FaTrash,
    FaFileInvoice
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import {
    getOrders,
    createOrder,
    updateOrder,
    deleteOrder
} from "../../services/orderService";

import AddOrderModal from "../../components/Orders/AddOrderModal";
import DeleteModal from "../../components/Orders/DeleteModal";

import "./Orders.css";

function Orders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);

    const [filteredOrders, setFilteredOrders] =
        useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [showOrderModal, setShowOrderModal] =
        useState(false);

    const [selectedOrder, setSelectedOrder] =
        useState(null);

    const [orderToDelete, setOrderToDelete] =
        useState(null);

    const [deleting, setDeleting] =
        useState(false);

    const [pageError, setPageError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        const searchText = search
            .trim()
            .toLowerCase();

        const filtered = orders.filter((order) =>
            order.customerName
                ?.toLowerCase()
                .includes(searchText)
        );

        setFilteredOrders(filtered);
    }, [orders, search]);

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timeout = setTimeout(() => {
            setSuccessMessage("");
        }, 2500);

        return () => clearTimeout(timeout);
    }, [successMessage]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setPageError("");

            const response = await getOrders();

            setOrders(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.orders || []
            );
        } catch (error) {
            console.error(
                "Unable to load orders:",
                error
            );

            setPageError(
                error.response?.data?.message ||
                "Unable to load orders."
            );
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setSelectedOrder(null);
        setShowOrderModal(true);
    };

    const openEditModal = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const closeOrderModal = () => {
        setShowOrderModal(false);
        setSelectedOrder(null);
    };

    const handleSaveOrder = async (formData) => {
        try {
            setPageError("");

            if (selectedOrder) {
                await updateOrder(
                    selectedOrder._id,
                    formData
                );

                setSuccessMessage(
                    "Order updated successfully."
                );
            } else {
                await createOrder(formData);

                setSuccessMessage(
                    "Order added successfully."
                );
            }

            closeOrderModal();

            await loadOrders();
        } catch (error) {
            console.error(
                "Unable to save order:",
                error
            );

            setPageError(
                error.response?.data?.message ||
                "Unable to save the order."
            );

            throw error;
        }
    };

    const openDeleteModal = (order) => {
        setOrderToDelete(order);
    };

    const closeDeleteModal = () => {
        if (!deleting) {
            setOrderToDelete(null);
        }
    };

    const handleDeleteOrder = async () => {
        if (!orderToDelete) {
            return;
        }

        try {
            setDeleting(true);
            setPageError("");

            await deleteOrder(orderToDelete._id);

            setOrderToDelete(null);

            setSuccessMessage(
                "Order deleted successfully."
            );

            await loadOrders();
        } catch (error) {
            console.error(
                "Unable to delete order:",
                error
            );

            setPageError(
                error.response?.data?.message ||
                "Unable to delete the order."
            );
        } finally {
            setDeleting(false);
        }
    };

    const handleInvoice = (orderId) => {
        navigate(`/orders/${orderId}/invoice`);
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
            "en-GB"
        );
    };

    const formatNumber = (value) => {
        return Number(value || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );
    };

    return (
        <>
            <div className="records-page">
                <div className="records-top">
                    <div>
                        <h2>
                            Orders Management
                        </h2>

                        <p>
                            Add, edit and manage customer
                            orders.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="add-order"
                        onClick={openAddModal}
                    >
                        <FaPlus />

                        Add Order
                    </button>
                </div>

                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}

                {pageError && (
                    <div className="page-error">
                        {pageError}
                    </div>
                )}

                <div className="search-box">
                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search customer..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div className="table-card">
                    {loading ? (
                        <div className="orders-loading">
                            Loading orders...
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Weight</th>
                                    <th>Rate</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredOrders.length ===
                                0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="empty-orders"
                                        >
                                            No orders found
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
                                                        order.date
                                                    )}
                                                </td>

                                                <td>
                                                    {
                                                        order.customerName
                                                    }
                                                </td>

                                                <td>
                                                    {formatNumber(
                                                        order.weight
                                                    )}{" "}
                                                    kg
                                                </td>

                                                <td>
                                                    ₹{" "}
                                                    {formatNumber(
                                                        order.rate
                                                    )}
                                                </td>

                                                <td>
                                                    ₹{" "}
                                                    {formatNumber(
                                                        order.amount
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            order.paymentMode ===
                                                            "Cash"
                                                                ? "cash"
                                                                : "online"
                                                        }
                                                    >
                                                        {order.paymentMode ||
                                                            "-"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            order.paymentStatus ===
                                                            "Paid"
                                                                ? "paid"
                                                                : "unpaid"
                                                        }
                                                    >
                                                        {order.paymentStatus ||
                                                            "-"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            type="button"
                                                            className="icon-btn"
                                                            title="Edit order"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    order
                                                                )
                                                            }
                                                        >
                                                            <FaEdit />
                                                        </button>

                                                      {order.paymentStatus === "Paid" && (
    <button
        type="button"
        className="icon-btn invoice"
        title="View invoice"
        onClick={() =>
            handleInvoice(order._id)
        }
    >
        <FaFileInvoice />
    </button>
)}

                                                        <button
                                                            type="button"
                                                            className="icon-btn delete"
                                                            title="Delete order"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    order
                                                                )
                                                            }
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showOrderModal && (
                <AddOrderModal
                    selectedOrder={selectedOrder}
                    onClose={closeOrderModal}
                    onSave={handleSaveOrder}
                />
            )}

            {orderToDelete && (
                <DeleteModal
                    order={orderToDelete}
                    deleting={deleting}
                    onClose={closeDeleteModal}
                    onConfirm={handleDeleteOrder}
                />
            )}
        </>
    );
}

export default Orders;