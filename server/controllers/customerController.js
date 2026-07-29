const Order = require("../models/Order");

/*
|--------------------------------------------------------------------------
| GET ALL CUSTOMERS
|--------------------------------------------------------------------------
| Creates a customer summary by grouping existing orders.
*/
exports.getCustomers = async (req, res) => {
    try {
        const customers = await Order.aggregate([
            {
                $match: {
                    customerName: {
                        $exists: true,
                        $ne: ""
                    }
                }
            },

            {
                $group: {
                    _id: {
                        $toLower: {
                            $trim: {
                                input: "$customerName"
                            }
                        }
                    },

                    customerName: {
                        $first: "$customerName"
                    },

                    phone: {
                        $first: "$phone"
                    },

                    address: {
                        $first: "$address"
                    },

                    totalOrders: {
                        $sum: 1
                    },

                    totalWeight: {
                        $sum: {
                            $ifNull: ["$weight", 0]
                        }
                    },

                    totalPurchased: {
                        $sum: {
                            $ifNull: ["$amount", 0]
                        }
                    },

                    paidAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$paymentStatus",
                                        "Paid"
                                    ]
                                },
                                {
                                    $ifNull: [
                                        "$amount",
                                        0
                                    ]
                                },
                                0
                            ]
                        }
                    },

                    outstandingAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$paymentStatus",
                                        "Unpaid"
                                    ]
                                },
                                {
                                    $ifNull: [
                                        "$amount",
                                        0
                                    ]
                                },
                                0
                            ]
                        }
                    },

                    paidOrders: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$paymentStatus",
                                        "Paid"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    unpaidOrders: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$paymentStatus",
                                        "Unpaid"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    lastOrderDate: {
                        $max: {
                            $ifNull: [
                                "$date",
                                "$createdAt"
                            ]
                        }
                    }
                }
            },

            {
                $project: {
                    _id: 0,

                    customerKey: "$_id",

                    customerName: 1,

                    phone: {
                        $ifNull: ["$phone", ""]
                    },

                    address: {
                        $ifNull: ["$address", ""]
                    },

                    totalOrders: 1,
                    totalWeight: 1,
                    totalPurchased: 1,
                    paidAmount: 1,
                    outstandingAmount: 1,
                    paidOrders: 1,
                    unpaidOrders: 1,
                    lastOrderDate: 1
                }
            },

            {
                $sort: {
                    totalPurchased: -1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: customers.length,
            customers
        });
    } catch (error) {
        console.error(
            "Get customers error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch customer records."
        });
    }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE CUSTOMER WITH ORDER HISTORY
|--------------------------------------------------------------------------
*/
exports.getCustomerDetails = async (
    req,
    res
) => {
    try {
        const customerName = decodeURIComponent(
            req.params.customerName
        ).trim();

        const orders = await Order.find({
            customerName: {
                $regex: `^${escapeRegex(
                    customerName
                )}$`,
                $options: "i"
            }
        }).sort({
            date: -1,
            createdAt: -1
        });

        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        const summary = orders.reduce(
            (result, order) => {
                const weight =
                    Number(order.weight) || 0;

                const amount =
                    Number(order.amount) || 0;

                result.totalOrders += 1;
                result.totalWeight += weight;
                result.totalPurchased += amount;

                if (
                    order.paymentStatus ===
                    "Paid"
                ) {
                    result.paidOrders += 1;
                    result.paidAmount += amount;
                } else {
                    result.unpaidOrders += 1;
                    result.outstandingAmount +=
                        amount;
                }

                return result;
            },
            {
                totalOrders: 0,
                totalWeight: 0,
                totalPurchased: 0,
                paidOrders: 0,
                unpaidOrders: 0,
                paidAmount: 0,
                outstandingAmount: 0
            }
        );

        const latestContactOrder =
            orders.find(
                (order) =>
                    order.phone ||
                    order.address
            ) || orders[0];

        res.status(200).json({
            success: true,

            customer: {
                customerName:
                    latestContactOrder.customerName,

                phone:
                    latestContactOrder.phone ||
                    "",

                address:
                    latestContactOrder.address ||
                    "",

                ...summary
            },

            orders
        });
    } catch (error) {
        console.error(
            "Get customer details error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch customer details."
        });
    }
};

/*
|--------------------------------------------------------------------------
| ESCAPE REGEX SPECIAL CHARACTERS
|--------------------------------------------------------------------------
*/
const escapeRegex = (value) => {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
};