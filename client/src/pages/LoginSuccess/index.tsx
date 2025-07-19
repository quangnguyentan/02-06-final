import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { loginSuccessAction } from "@/stores/actions/authAction";
import { useAppDispatch } from "@/hooks/use-dispatch";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import "./index.css";
const LoginSuccess = () => {
  const { userId, tokenLogin } = useParams();
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && tokenLogin) {
      dispatch(loginSuccessAction(userId, tokenLogin)).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [dispatch, userId, tokenLogin]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white ">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500" />
        <p className="mt-4 text-gray-600 text-lg">
          Đang đăng nhập, vui lòng chờ...
        </p>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-white">
      <h1 className="text-3xl font-medium mb-4">Yêu cầu bạn hãy đăng nhập</h1>
      <Link
        to="/auth"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Đăng nhập
      </Link>
    </div>
  );
};

export default LoginSuccess;
