import authReducer, { AuthState } from "./authReducer";
import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import { persistReducer } from "redux-persist";
import userReducer from "./userReducer";

const commonConfig = {
  storage,
  stateReconciler: autoMergeLevel2,
};
const authConfig = {
  ...commonConfig,
  key: "auth",
  whitelist: ["current", "token", "isLoggedIn"],
};
const rootReducer = combineReducers({
  auth: persistReducer<AuthState>(authConfig, authReducer),
  user: userReducer,
});
export default rootReducer;
