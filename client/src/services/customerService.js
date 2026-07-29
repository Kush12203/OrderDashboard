import api from "./api";

export const getCustomers = () => {
    return api.get("/customers");
};

export const getCustomerDetails = (customerName) => {
    return api.get(
        `/customers/${encodeURIComponent(customerName)}`
    );
};