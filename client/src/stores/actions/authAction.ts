import { Dispatch } from "redux";
import {
  apiLogin,
  apiLoginSuccess,
  apiRefreshToken,
} from "@/services/auth.services";
import actionType from "./actionType";
import { apiLogout } from "@/services/user.services";

interface ApiResponse {
  success: boolean;
  err: number;
  data: {
    success?: boolean;
    accessToken?: string;
    newAccessToken?: string;
    token?: string;
    role?: string;
    msg?: string;
  };
}

export interface authActionProps {
  typeLogin?: string;
  username?: string;
  phone?: string;
  password?: string;
  role?: string;
  tokenLogin?: string;
  avatar?: string;

}

interface GetCurrentFulfilledAction {
  type: typeof actionType.GET_CURRENT_FULFILLED;
  currentData: unknown;
}

interface GetCurrentRejectedAction {
  type: typeof actionType.GET_CURRENT_REJECTED;
  currentData: null;
  msg: string | unknown;
}

interface LoginSuccessAction {
  type: typeof actionType.LOGIN_SUCCESS;
  token?: string | null;
  role?: string | null;
  data?: string | null;
  msg?: unknown;
}

type AuthAction =
  | GetCurrentFulfilledAction
  | GetCurrentRejectedAction
  | LoginSuccessAction;

export const loginAction =
  (data: authActionProps) => async (dispatch: Dispatch<AuthAction>) => {
    try {
      const response = (await apiLogin(data)) as unknown as ApiResponse;
      if (response?.data) {
        dispatch({
          type: actionType.LOGIN,
          token: response.data.accessToken,
          role: response?.data?.role,
        });
      } else {
        dispatch({
          type: actionType.LOGIN,
          token: null,
          role: null,
        });
      }
    } catch (error) {
      dispatch({
        type: actionType.LOGIN,
        token: null,
        role: null,
        msg: error,
      });
    }
  };
export const handleTokenExpiry = () => async (dispatch: Dispatch) => {
  try {
    // Try refreshing the token
    const refreshResponse = await apiRefreshToken();
    console.log(refreshResponse);
    if (refreshResponse?.data?.newAccessToken) {
      dispatch({
        type: actionType.LOGIN_SUCCESS,
        token: refreshResponse.data.newAccessToken,
      });
    } else {
      dispatch({
        type: actionType.LOGOUT, // Handle logout if refresh fails
      });
    }
  } catch (error) {
    dispatch({
      type: actionType.LOGOUT, // Log out the user if token refresh fails
      msg: error,
    });
  }
};
export const loginSuccessAction =
  (id: unknown, tokenLogin: unknown) =>
    async (dispatch: Dispatch<AuthAction>) => {
      try {
        const response = (await apiLoginSuccess(
          id,
          tokenLogin
        )) as unknown as ApiResponse;
        if (response?.data) {
          dispatch({
            type: actionType.LOGIN_SUCCESS,
            token: response?.data?.token,
            role: response?.data.role,
          });
        } else {
          dispatch({
            type: actionType.LOGIN_SUCCESS,
            token: null,
            role: null,
          });
        }
      } catch (error) {
        dispatch({
          type: actionType.LOGIN_SUCCESS,
          token: null,
          msg: error,
        });
      }
    };
export const logout = () => {
  return async (dispatch: Dispatch) => {
    try {
      // 1. Gọi API logout để server clear cookie
      await apiLogout();
    } catch (err) {
      console.warn("Logout API failed, but we’ll clear state anyway", err);
    }
    // 2. Dispatch action xóa state user khỏi Redux
    dispatch({ type: actionType.LOGOUT });
  };
};
