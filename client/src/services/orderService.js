// import api from "./api";

// export const getOrders = () =>
//     api.get("/orders");

// export const getOrder = (id) =>
//     api.get(`/orders/${id}`);

// export const createOrder = (data) =>
//     api.post("/orders", data);

// export const updateOrder = (id, data) =>
//     api.put(`/orders/${id}`, data);

// export const deleteOrder = (id) =>
//     api.delete(`/orders/${id}`);

// // export const getOrder = (id) => {
// //     return api.get(`/orders/${id}`);
// // };

import api from "./api";

export const getOrders = () => {
    return api.get("/orders");
};

export const getOrder = (id) => {
    return api.get(`/orders/${id}`);
};

export const createOrder = (orderData) => {
    return api.post("/orders", orderData);
};

export const updateOrder = (id, orderData) => {
    return api.put(`/orders/${id}`, orderData);
};

export const deleteOrder = (id) => {
    return api.delete(`/orders/${id}`);
};