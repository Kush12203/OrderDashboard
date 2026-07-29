const express = require("express");

const router = express.Router();

const customerController = require(
    "../controllers/customerController"
);

router.get(
    "/",
    customerController.getCustomers
);

router.get(
    "/:customerName",
    customerController.getCustomerDetails
);

module.exports = router;