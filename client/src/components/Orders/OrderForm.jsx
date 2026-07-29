import { useEffect, useState } from "react";

function OrderForm({ onSubmit, selectedOrder, onClose }) {
    const [form, setForm] = useState({
        customerName: "",
        weight: "",
        rate: "",
        paymentMode: "Cash",
        paymentStatus: "Paid"
    });

    useEffect(() => {
        if (selectedOrder) {
            setForm({
                customerName: selectedOrder.customerName || "",
                weight: selectedOrder.weight || "",
                rate: selectedOrder.rate || "",
                paymentMode: selectedOrder.paymentMode || "Cash",
                paymentStatus: selectedOrder.paymentStatus || "Paid"
            });
        }
    }, [selectedOrder]);

    const amount =
        (Number(form.weight) || 0) *
        (Number(form.rate) || 0);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit({
            customerName: form.customerName.trim(),
            weight: Number(form.weight),
            rate: Number(form.rate),
            amount,
            paymentMode: form.paymentMode,
            paymentStatus: form.paymentStatus
        });
    };

    return (
        <div className="modal-overlay" onMouseDown={onClose}>
            <div
                className="modal"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <h2>
                    {selectedOrder ? "Edit Order" : "Add New Order"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="customerName"
                        placeholder="Customer Name"
                        value={form.customerName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="number"
                        name="weight"
                        placeholder="Weight (kg)"
                        value={form.weight}
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        required
                    />

                    <input
                        type="number"
                        name="rate"
                        placeholder="Price per kg"
                        value={form.rate}
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        required
                    />

                    <div className="total-box">
                        <span>Total Amount</span>
                        <strong>
                            ₹ {amount.toLocaleString("en-IN")}
                        </strong>
                    </div>

                    <select
                        name="paymentMode"
                        value={form.paymentMode}
                        onChange={handleChange}
                    >
                        <option value="Cash">Cash</option>
                        <option value="Online">Online</option>
                    </select>

                    <select
                        name="paymentStatus"
                        value={form.paymentStatus}
                        onChange={handleChange}
                    >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                    </select>

                    <div className="modal-buttons">
                        <button type="submit">
                            {selectedOrder ? "Update Order" : "Save Order"}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default OrderForm;