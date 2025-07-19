import { createStore, applyMiddleware, compose, Reducer } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { thunk } from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./stores/reducers/rootReducer";
import { persistStore } from "redux-persist";
import { AnyAction } from "redux";
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>;
const middleware = [thunk];
const composedEnhancer =
  process.env.NODE_ENV === "development"
    ? composeWithDevTools(applyMiddleware(...middleware))
    : compose(applyMiddleware(...middleware));
const reduxStore = () => {
  const store = createStore(
    rootReducer as Reducer<RootState, AnyAction>,
    composedEnhancer
  );
  const persistor = persistStore(store);

  return { store, persistor };
};

export default reduxStore;
