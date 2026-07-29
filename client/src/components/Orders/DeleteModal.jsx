function DeleteModal({
    order,
    onClose,
    onConfirm,
    deleting
}) {
    if (!order) {
        return null;
    }

    return (
        <div
            className="modal-overlay"
            onMouseDown={onClose}
        >
            <div
                className="delete-modal"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="delete-icon">
                    !
                </div>

                <h2>Delete Order?</h2>

                <p className="delete-description">
                    This action cannot be undone.
                </p>

                <div className="delete-order-info">
                    <div>
                        <span>Customer</span>
                        <strong>
                            {order.customerName}
                        </strong>
                    </div>

                    <div>
                        <span>Amount</span>
                        <strong>
                            ₹{" "}
                            {Number(
                                order.amount
                            ).toLocaleString("en-IN")}
                        </strong>
                    </div>
                </div>

                <div className="delete-modal-buttons">
                    <button
                        type="button"
                        className="delete-cancel-btn"
                        onClick={onClose}
                        disabled={deleting}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="delete-confirm-btn"
                        onClick={onConfirm}
                        disabled={deleting}
                    >
                        {deleting
                            ? "Deleting..."
                            : "Delete Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;