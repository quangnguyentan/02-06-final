import actionType from "../actions/actionType";

// Define the shape of the state
interface UserState {
  userData: Record<string, any>;
  status: "idle" | "loading" | "succeeded" | "failed";
}

// Define the shape of the action
interface UserAction {
  type: string;
  currentData?: Record<string, any>; // Optional payload
}

// Initial state
const initState: UserState = {
  userData: {},
  status: "idle",
};

// Reducer with typed action parameter
const userReducer = (
  state: UserState = initState,
  action: UserAction
): UserState => {
  switch (action.type) {
    case actionType.GET_CURRENT_PENDING:
      return {
        ...state,
        status: "loading",
      };
    case actionType.GET_CURRENT_FULFILLED:
      return {
        ...state,
        userData: action.currentData || {},
        status: "succeeded",
      };
    case actionType.GET_CURRENT_REJECTED:
      return {
        ...state,
        userData: {},
        status: "failed",
      };
    default:
      return state;
  }
};

export default userReducer;
