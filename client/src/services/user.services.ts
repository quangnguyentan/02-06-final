import { User } from "@/types/user.types";
import axiosConfig from "../axios";
interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
}

export const apiGetAllUser = async () => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/users",
    });
    return response;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};
export const apiGetUserById = async (id: string) => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/users/getUserById/" + id,
    });
    return response;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};
export const apiDeleteUserById = async (id: string) => {
  try {
    const response = await axiosConfig({
      method: "DELETE",
      url: "/users/" + id,
    });
    return response;
  } catch (error) {
    console.error("Error deleting user by ID:", error);
    throw error;
  }
};
export const apiUpdateUser = async (id: string, data: FormData) => {
  try {
    const response = await axiosConfig({
      method: "PUT",
      url: "/users/" + id,
      data,
    });
    console.log(response);
    return response;
  } catch (error) {
    console.log("Error fetching current user:", error);
    throw error;
  }
};
export const apiCreateUser = async (data: User) => {
  try {
    const response = await axiosConfig({
      method: "POST",
      url: "/users/",
      data,
    });
    console.log(response);
    return response;
  } catch (error) {
    console.log("Error fetching current user:", error);
    throw error;
  }
};
export const apiGetCurrent = async () => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/users/current",
    });
    return response;
  } catch (error) {
    console.log("Error fetching current user:", error);
    throw error;
  }
};
export const apiLogout = async () => {
  try {
    const response = await axiosConfig({
      method: "POST",
      url: "/users/logout",
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.log("Error fetching current user:", error);
    throw error;
  }
};
export const apiForgotPassword = async (data: ForgotPasswordPayload) => {
  console.log(data);
  try {
    const response = await axiosConfig({
      method: "POST",
      url: "/users/forgot-password",
      data,
    });
    return response;
  } catch (error) {
    console.log("Error fetching current user:", error);
    throw error;
  }
};
export const apiResetPassword = async (data: ResetPasswordPayload) => {
  try {
    const response = await axiosConfig({
      method: "POST",
      url: "/users/reset-password",
      data,
    });
    return response;
  } catch (error) {
    console.log("Error fetching current user:", error);
    throw error;
  }
};
export const apiUpdateProfile = async (data: FormData) => {
  try {
    const response = await axiosConfig({
      method: "PUT",
      url: "/users/profile",
      data,
    });
    return response;
  } catch (error) {
    console.log("Error fetching current user:", error);
    throw error;
  }
};
