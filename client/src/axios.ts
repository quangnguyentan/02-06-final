import axios, { AxiosHeaders } from "axios";
import toast from "react-hot-toast";
import reduxStore from "@/store";
import { logout } from "./stores/actions/authAction";
import { navigate } from "./lib/navigate";
import type { AppDispatch } from "@/store";
import { apiRefreshToken } from "./services/auth.services";

const production = "https://sv.hoiquan.live/api";
const development = "http://localhost:8080/api";
const API_BASE_URL =
  import.meta.env.VITE_NODE_ENV === "production" ? production : development;
const { store } = reduxStore();
const typedDispatch = store.dispatch as AppDispatch;

const instance = axios.create({
  // baseURL: production,
  baseURL: API_BASE_URL,
  withCredentials: true,
});

instance.interceptors.request.use(
  function (config) {
    const token =
      window.localStorage.getItem("persist:auth") &&
      JSON.parse(
        window.localStorage.getItem("persist:auth") as string
      )?.token.slice(1, -1);
    if (token) {
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set("authorization", `Bearer ${token}`);
      } else {
        config.headers = new AxiosHeaders({
          authorization: `Bearer ${token}`,
        });
      }
    }
    return config;
  },
  function (error) {
    console.log(error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest.url?.includes("/auth/refreshToken")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await apiRefreshToken();
        const newAccessToken = refreshResponse?.data?.newAccessToken;
        if (newAccessToken) {
          const persistAuth = JSON.parse(
            window.localStorage.getItem("persist:auth") ?? "{}"
          );
          persistAuth.token = JSON.stringify(newAccessToken);
          window.localStorage.setItem(
            "persist:auth",
            JSON.stringify(persistAuth)
          );
          originalRequest.headers.set(
            "authorization",
            `Bearer ${newAccessToken}`
          );
          return instance(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token expired:", refreshError);
        window.localStorage.removeItem("persist:auth");
        typedDispatch(logout());
        navigate("/");
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return Promise.reject(new Error("Session expired"));
      }
    }

    if (error.response) {
      console.error("API error:", error.response.data);
      return Promise.reject({
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("Network error:", error.message);
      return Promise.reject(new Error("Network error"));
    } else {
      console.error("Configuration error:", error.message);
      return Promise.reject(new Error("Configuration error"));
    }
  }
);
export default instance;
