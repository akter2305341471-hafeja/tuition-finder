import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

// Send the JWT with every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired / invalid token: log the user out
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    if (err.response?.status === 401 && localStorage.getItem("token") && !url.includes("/auth/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Turn any API error into a readable message
export function errMsg(err) {
  const d = err.response?.data;
  if (!d) return "Cannot reach the server. Is the backend running?";
  if (typeof d === "string") return "Server error. Please try again.";
  if (d.detail) return d.detail;
  return Object.entries(d)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
    .join(" | ");
}

export default api;
