import api from "./api";

export const getReportOrders = () => {
    return api.get("/orders");
};