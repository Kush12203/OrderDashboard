const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
            default: Date.now
        },

        customerName: {
            type: String,
            required: true,
            trim: true
        },

        // product: {
        //     type: String,
        //     default: "Dragon Fruit"
        // },

        weight: {
            type: Number,
            required: true,
            min: 0
        },

        rate: {
            type: Number,
            required: true,
            min: 0
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMode: {
            type: String,
            enum: ["Cash", "Online"],
            default: "Cash"
        },

        paymentStatus: {
            type: String,
            enum: ["Paid", "Unpaid"],
            default: "Unpaid"
        },

        phone: {
            type: String,
            default: ""
        },

        address: {
            type: String,
            default: ""
        },

        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);