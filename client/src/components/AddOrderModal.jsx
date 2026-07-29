import { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";

function AddOrderModal({
    selectedOrder,
    onClose,
    onSave
}) {
    const getTodayDate = () => {
        return new Date().toISOString().split("T")[0];
    };

    const [formData, setFormData] = useState({
        date: getTodayDate(),
        customerName: "",
        weight: "",
        rate: "",
        paymentMode: "Cash",
        paymentStatus: "Unpaid",
        phone: "",
        address: "",
        notes: ""
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const isEditing = Boolean(selectedOrder);

    useEffect(() => {
        if (selectedOrder) {
            setFormData({
                date: selectedOrder.date
                    ? new Date(selectedOrder.date)
                          .toISOString()
                          .split("T")[0]
                    : getTodayDate(),

                customerName:
                    selectedOrder.customerName || "",

                weight:
                    selectedOrder.weight !== undefined
                        ? selectedOrder.weight
                        : "",

                rate:
                    selectedOrder.rate !== undefined
                        ? selectedOrder.rate
                        : "",

                paymentMode:
                    selectedOrder.paymentMode || "Cash",

                paymentStatus:
                    selectedOrder.paymentStatus ||
                    "Unpaid",

                phone: selectedOrder.phone || "",
                address: selectedOrder.address || "",
                notes: selectedOrder.notes || ""
            });
        } else {
            setFormData({
                date: getTodayDate(),
                customerName: "",
                weight: "",
                rate: "",
                paymentMode: "Cash",
                paymentStatus: "Unpaid",
                phone: "",
                address: "",
                notes: ""
            });
        }

        setError("");
    }, [selectedOrder]);

    const totalAmount = useMemo(() => {
        const weight = Number(formData.weight);
        const rate = Number(formData.rate);

        if (
            Number.isNaN(weight) ||
            Number.isNaN(rate)
        ) {
            return 0;
        }

        return weight * rate;
    }, [formData.weight, formData.rate]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.date) {
            setError("Please select an order date.");
            return;
        }

        if (!formData.customerName.trim()) {
            setError("Please enter the customer name.");
            return;
        }

        if (Number(formData.weight) <= 0) {
            setError("Weight must be greater than zero.");
            return;
        }

        if ( formData.rate === "" ||  Number(formData.rate) < 0) {
        setError("Please enter a valid rate of 0 or more.");
        return;
       }

        try {
            setSaving(true);
            setError("");

            await onSave({
                ...formData,
                customerName:
                    formData.customerName.trim(),
                weight: Number(formData.weight),
                rate: Number(formData.rate),
                amount: totalAmount
            });
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                `Unable to ${
                    isEditing ? "update" : "add"
                } the order.`
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="modal-overlay"
            onMouseDown={onClose}
        >
            <div
                className="order-modal"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="order-modal-header">
                    <div>
                        <h2>
                            {isEditing
                                ? "Edit Order"
                                : "Add New Order"}
                        </h2>

                        <p>
                            {isEditing
                                ? "Update the existing order details."
                                : "Enter the customer and order details."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close modal"
                    >
                        <FaTimes />
                    </button>
                </div>

                {error && (
                    <div className="modal-error">
                        {error}
                    </div>
                )}

                <form
                    className="order-form"
                    onSubmit={handleSubmit}
                >
                    <div className="order-form-row">
                        <div className="form-group">
                            <label htmlFor="order-date">
                                Order Date
                            </label>

                            <input
                                id="order-date"
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="customer-name">
                                Customer Name
                            </label>

                            <input
                                id="customer-name"
                                type="text"
                                name="customerName"
                                placeholder="Enter customer name"
                                value={
                                    formData.customerName
                                }
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="order-form-row">
                        <div className="form-group">
                            <label htmlFor="weight">
                                Weight (kg)
                            </label>

                            <input
                                id="weight"
                                type="number"
                                name="weight"
                                min="0"
                                step="0.01"
                                placeholder="Enter weight"
                                value={formData.weight}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="rate">
                                Price per kg
                            </label>

                            <input
                                id="rate"
                                type="number"
                                name="rate"
                                min="0"
                                step="0.01"
                                placeholder="Enter rate"
                                value={formData.rate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="calculated-amount">
                        <span>
                            Calculated Total Amount
                        </span>

                        <strong>
                            ₹{" "}
                            {totalAmount.toLocaleString(
                                "en-IN",
                                {
                                    maximumFractionDigits: 2
                                }
                            )}
                        </strong>
                    </div>

                    <div className="order-form-row">
                        <div className="form-group">
                            <label htmlFor="payment-mode">
                                Payment Mode
                            </label>

                            <select
                                id="payment-mode"
                                name="paymentMode"
                                value={
                                    formData.paymentMode
                                }
                                onChange={handleChange}
                            >
                                <option value="Cash">
                                    Cash
                                </option>

                                <option value="Online">
                                    Online
                                </option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="payment-status">
                                Payment Status
                            </label>

                            <select
                                id="payment-status"
                                name="paymentStatus"
                                value={
                                    formData.paymentStatus
                                }
                                onChange={handleChange}
                            >
                                <option value="Paid">
                                    Paid
                                </option>

                                <option value="Unpaid">
                                    Unpaid
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="order-form-row">
                        <div className="form-group">
                            <label htmlFor="phone">
                                Phone
                            </label>

                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                placeholder="Optional phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">
                                Address
                            </label>

                            <input
                                id="address"
                                type="text"
                                name="address"
                                placeholder="Optional address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">
                            Notes
                        </label>

                        <textarea
                            id="notes"
                            name="notes"
                            placeholder="Optional notes"
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : isEditing
                                  ? "Update Order"
                                  : "Save Order"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddOrderModal;