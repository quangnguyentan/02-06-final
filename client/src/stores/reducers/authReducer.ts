import { Reducer } from "redux";
import actionType from "../actions/actionType";
export interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  current: unknown;

}

// Kiểu action
interface LoginSuccessAction {
  type: typeof actionType.LOGIN_SUCCESS;
  token: string | null;
  role: string | null;

}
interface LoginAction {
  type: typeof actionType.LOGIN_SUCCESS;
  token: string | null;
  role: string | null;

}
interface LogoutAction {
  type: typeof actionType.LOGOUT;
}

export type AuthAction = LoginSuccessAction | LogoutAction;
const initState: AuthState = {
  isLoggedIn: false,
  token: null,
  current: null,
};

const authReducer: Reducer<AuthState, AuthAction> = (state = initState, action: AuthAction): AuthState => {
  switch (action.type) {
    case actionType.LOGIN_SUCCESS: {
      const loginAction = action as LoginSuccessAction;
      return {
        ...state,
        isLoggedIn: !!loginAction.token,
        token: loginAction.token,
        current: loginAction.role,

      };
    }

    case actionType.LOGIN: {
      const loginAction = action as LoginAction;

      return {
        ...state,
        isLoggedIn: !!loginAction.token,
        token: loginAction.token,
        current: loginAction.role,

      };
    }
    case actionType.LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        token: null,
        current: null,
      };

    default:
      return state;
  }
};

export default authReducer;