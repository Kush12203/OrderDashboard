import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
    baseURL:
        "https://shivalik-ormn.onrender.com/api",
    timeout: 15000
});

api.interceptors.request.use(
    async (config) => {
        const token =
            await SecureStore.getItemAsync("token");

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;