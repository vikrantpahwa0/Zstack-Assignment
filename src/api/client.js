import axios from "axios";

export const getAccessToken = () => localStorage.getItem("accessToken");

export const setAccessToken = (token) => {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
};

const api = axios.create({
  baseURL: import.meta.env.VITE_BE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach bearer token on every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise errors -> Error(message) with .status and .payload
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      `Request failed (${err.response?.status ?? "network"})`;
    const e = new Error(message);
    e.status = err.response?.status;
    e.payload = err.response?.data;
    return Promise.reject(e);
  },
);

// Unwrap backend envelope { success, message, data } -> data
export const apiData = async (promise) => {
  const res = await promise;
  const payload = res.data;
  if (payload && typeof payload === "object" && "success" in payload) {
    return payload.data;
  }
  return payload;
};

export default api;