const Order = require("../models/Order");

// =========================
// Get All Orders
// =========================

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({
            createdAt: -1
        });

        res.json(orders);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// Get Single Order
// =========================

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(
            req.params.id
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// Create Order
// =========================

exports.createOrder = async (req, res) => {
    try {
        const {
            date,
            customerName,
            weight,
            rate,
            paymentMode,
            paymentStatus,
            phone,
            address,
            notes
        } = req.body;

        const amount =
            Number(weight) * Number(rate);

        const order = await Order.create({
            date: date || new Date(),

            customerName:
                customerName?.trim(),

            weight: Number(weight),

            rate: Number(rate),

            amount,

            paymentMode:
                paymentMode || "Cash",

            paymentStatus:
                paymentStatus || "Unpaid",

            phone:
                phone?.trim() || "",

            address:
                address?.trim() || "",

            notes:
                notes?.trim() || ""
        });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// Update Order
// =========================

exports.updateOrder = async (req, res) => {
    try {
        const existingOrder =
            await Order.findById(req.params.id);

        if (!existingOrder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const weight =
            req.body.weight !== undefined
                ? Number(req.body.weight)
                : existingOrder.weight;

        const rate =
            req.body.rate !== undefined
                ? Number(req.body.rate)
                : existingOrder.rate;

        const updateData = {
            ...req.body,

            customerName:
                req.body.customerName !== undefined
                    ? req.body.customerName.trim()
                    : existingOrder.customerName,

            weight,

            rate,

            amount: weight * rate,

            phone:
                req.body.phone !== undefined
                    ? req.body.phone.trim()
                    : existingOrder.phone,

            address:
                req.body.address !== undefined
                    ? req.body.address.trim()
                    : existingOrder.address,

            notes:
                req.body.notes !== undefined
                    ? req.body.notes.trim()
                    : existingOrder.notes
        };

        const order =
            await Order.findByIdAndUpdate(
                req.params.id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            );

        res.json(order);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// Delete Order
// =========================

exports.deleteOrder = async (req, res) => {
    try {
        const order =
            await Order.findByIdAndDelete(
                req.params.id
            );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json({
            message:
                "Order Deleted Successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};