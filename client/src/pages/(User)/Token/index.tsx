import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { logout } from "@/stores/actions/authAction";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/use-dispatch";

interface JwtPayload {
  _id: string;
  role?: string;
  exp: number;
}

const TokenExpirationChecker = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useEffect(() => {
    const checkTokenExpiration = () => {
      const persistAuth = window.localStorage.getItem("persist:auth");
      if (persistAuth) {
        const { token } = JSON.parse(persistAuth);
        if (token) {
          try {
            const decoded: JwtPayload = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
              console.log("Access token expired");
              window.localStorage.removeItem("persist:auth");
              dispatch(logout());
              navigate("/");
              toast.error(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
              );
            }
          } catch (error) {
            console.error("Invalid token:", error);
          }
        }
      }
    };

    const interval = setInterval(checkTokenExpiration, 1000);
    return () => clearInterval(interval);
  }, [dispatch, navigate]);

  return null;
};

export default TokenExpirationChecker;
