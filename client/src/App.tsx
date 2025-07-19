import { Route, RouteObject, Routes, useNavigate } from "react-router-dom";
import routes from "./pages/routes";
import { Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Toaster } from "react-hot-toast";
import { getCurrent } from "./stores/actions/userAction";
import type { RootState, AppDispatch } from "./store";
import { setNavigate } from "./lib/navigate";
import { Loader } from "./components/layout/Loader";
import TokenExpirationChecker from "./pages/(User)/Token";
import { useAppDispatch } from "./hooks/use-dispatch";
function App() {
  const { isLoggedIn, current, token } = useSelector(
    (state: RootState) => state.auth
  );
  console.log(isLoggedIn);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      if (isLoggedIn) {
        dispatch(getCurrent());
      }
    }, 1000);
    return () => {
      clearTimeout(setTimeoutId);
    };
  }, [dispatch, isLoggedIn]);
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  type AppRouteObject = RouteObject & {
    role?: string[];
  };
  const filteredRoutes = (routes as AppRouteObject[]).filter((route) => {
    if (!route.role) return true;
    return route.role.includes(current as string);
  });
  // useEffect(() => {
  //   const handleBeforeUnload = (event) => {
  //     // Hiển thị thông báo hoặc thực hiện hành động trước khi reload
  //     console.log("Trang đang được reload hoặc đóng");
  //     // Nếu muốn hiển thị xác nhận trước khi reload
  //     event.preventDefault();
  //     event.returnValue = ""; // Hiển thị hộp thoại xác nhận (tùy trình duyệt)
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   // Cleanup listener khi component unmount
  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, []);

  return (
    <Suspense fallback={<Loader />}>
      {isLoggedIn && token && <TokenExpirationChecker />}
      <Routes>
        {filteredRoutes?.map((route) => {
          const isAdminRoute = route.role?.includes("ADMIN");
          if (isAdminRoute) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<div className="admin-wrapper">{route.element}</div>}
              />
            );
          }

          return (
            <Route key={route.path} path={route.path} element={route.element}>
              {route.children?.map((childRoute) => (
                <Route
                  key={childRoute.path}
                  path={childRoute.path}
                  element={childRoute.element}
                />
              ))}
            </Route>
          );
        })}
      </Routes>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
            fontSize: "0.9rem",
          },
          success: {
            style: {
              background: "green",
            },
          },
          error: {
            style: {
              background: "red",
            },
          },
        }}
      />
    </Suspense>
  );
}

export default App;
