import { Dispatch } from "redux";
import { apiGetCurrent } from "../../services/user.services";
import actionType from "./actionType";

// Define the shape of the action
export interface UserAction {
  type: string; // This is crucial for all Redux actions
  currentData?: Record<string, any>;
  [key: string]: any;
}
interface ApiResponse<T = unknown> {
  success: boolean;
  err: number;
  data: {
    success?: boolean;
    accessToken?: string;
    token?: string;
    rs?: T;
    msg?: string;
  };
}
interface GetCurrentPendingAction {
  type: typeof actionType.GET_CURRENT_PENDING;
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

export const getCurrent =
  () =>
  async (
    dispatch: Dispatch<
      | GetCurrentFulfilledAction
      | GetCurrentRejectedAction
      | GetCurrentPendingAction
    >
  ) => {
    try {
      dispatch({ type: actionType.GET_CURRENT_PENDING });
      const response = (await apiGetCurrent()) as unknown as ApiResponse;
      if (response?.data?.success) {
        dispatch({
          type: actionType.GET_CURRENT_FULFILLED,
          currentData: response?.data.rs,
        });
      } else {
        dispatch({
          type: actionType.GET_CURRENT_REJECTED,
          currentData: null,
          msg: response?.data?.msg || "Error occurred",
        });
      }
    } catch (error) {
      dispatch({
        type: actionType.GET_CURRENT_REJECTED,
        currentData: null,
        msg: error,
      });
    }
  };
