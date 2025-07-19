import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import reduxStore from "@/store";
import { SelectedPageProvider } from "./components/navigation/navigation-provider";
import { Component, ReactNode } from "react";
import type { RootState, AppDispatch } from "@/store"; // FIX: Import types from your store file
import { DataProvider } from "./context/DataContext";
import NotFound from "./pages/(404)";
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <NotFound />;
    }
    return this.props.children;
  }
}
const { store, persistor } = reduxStore();
createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <ErrorBoundary>
          <SelectedPageProvider
            initialPage="TRANG CHỦ"
            inititalSportsNavbarPage=""
          >
            <DataProvider>
              <App />
            </DataProvider>
          </SelectedPageProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </PersistGate>
  </Provider>
);
