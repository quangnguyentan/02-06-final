import loginImg from "@/assets/admin/login.svg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import { apiLogin } from "@/services/auth.services";
import { ChangeEvent, FormEvent, useState } from "react";
import { authActionProps, loginAction } from "@/stores/actions/authAction";
import { useAppDispatch } from "@/hooks/use-dispatch";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./index.css";
import { useMediaQuery, useTheme } from "@mui/material";

type loginProps = {
  onRegister?: () => void;
  onReset?: () => void;
  onTogglePassword?: () => void;
  onShowPassword?: boolean;
  onClickTypeLogin: (type: string) => void;
  onClose?: () => void;
};
const Login = ({
  onRegister,
  onReset,
  onTogglePassword,
  onShowPassword,
  onClickTypeLogin,
  onClose,
}: loginProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState<authActionProps>({
    phone: "",
    password: "",
  });
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  console.log(input);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!input.phone || !input.password) {
        toast.error("Please fill in all fields");
        return;
      }
      setLoading(true);
      const response = await apiLogin(input);
      console.log(response);
      if (response.data.err === 0) {
        toast.error(response.data.msg);
      }
      if (response?.data?.success) {
        dispatch(loginAction(input))
          .then(() => {
            toast.success("Login successful!");
            if (onClose) {
              onClose();
            }
          })
          .catch(() => {
            toast.error("Login failed. Please try again.");
            setInput({ phone: "", password: "" });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } catch (error: any) {
      setLoading(false);
      const msg =
        error.response?.data?.msg ?? "Login failed. Please try again.";
      toast.error(msg);

      console.error("Login failed:", error);
    }
  };

  return (
    <>
      <div className="relative">
        <div
          onClick={onClose}
          className="opacity-80 bg-red-500 hover:bg-red-600 text-white font-semibold py-0.5 px-2 text-sm shadow absolute right-0 top-0 cursor-pointer"
        >
          <button className="text-white hover:text-yellow-200 text-xl leading-none">
            &times;
          </button>
        </div>
        <div
          className={
            isMobile ? "h-[360px]  w-full" : "main-container --flex-center"
          }
        >
          {/* <div className="img-container-auth flex items-center justify-center ">
            <img
              src={icon_auth}
              alt="login"
              className="w-[70%] h-[90%] object-cover mx-auto -rotate-6 rounded-3xl"
            />
          </div> */}
          <div className="img-container">
            <img src={loginImg} alt="login" />
          </div>
          <div className="form-container ">
            <form
              onSubmit={handleSubmit}
              className="--form-control !flex !flex-col !space-y-2"
            >
              <h2
                className={`${
                  isMobile
                    ? "--color-dark --text-center font-bold text-2xl "
                    : "--color-dark --text-center font-bold text-4xl "
                }`}
              >
                Đăng nhập
              </h2>
              <span
                className={`${
                  isMobile
                    ? "font-normal text-gray-500/80 text-[14px] flex items-center justify-center"
                    : "font-normal text-gray-500/80 text-[18px] flex items-center justify-center"
                }`}
              >
                Chào mừng đến với HOIQUANTV!
              </span>
              <input
                onChange={handleInput}
                name="phone"
                type="number"
                className={
                  isMobile
                    ? "--width-100 !rounded-xl h-10 placeholder:text-base !text-base  no-arrows"
                    : "--width-100 !rounded-xl  no-arrows "
                }
                placeholder="Số điện thoại"
              />
              <div className="password">
                <input
                  type={onShowPassword ? "text" : "password"}
                  name="password"
                  className={
                    isMobile
                      ? "--width-100 !rounded-xl h-10 placeholder:text-base !text-base"
                      : "--width-100 !rounded-xl"
                  }
                  placeholder="Mật khẩu"
                  onChange={handleInput}
                />
                <span
                  className="block absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 transition-all duration-200 ease-in-out"
                  data-testid="toggle-password-icon"
                  onClick={onTogglePassword}
                >
                  {onShowPassword ? (
                    <AiOutlineEyeInvisible />
                  ) : (
                    <AiOutlineEye />
                  )}
                </span>
              </div>
              <button
                className={
                  isMobile
                    ? "--btn --btn-dark !bg-blue-500 hover:!bg-blue-600 --btn-block h-8 !text-base !rounded-xl"
                    : "--btn --btn-dark !bg-blue-500 hover:!bg-blue-600 --btn-block !rounded-xl"
                }
              >
                Đăng nhập
              </button>
              {/* <a className="--text-sm cursor-pointer" onClick={onReset}>
                Quên mật khẩu?
              </a> */}
              <span
                className={
                  isMobile ? "--text-sm --block !text-sm" : "--text-sm --block"
                }
              >
                Chưa có tài khoản?
                <a
                  className={`${
                    isMobile
                      ? "--text-sm cursor-pointer !text-sm"
                      : "--text-sm cursor-pointer"
                  }`}
                  onClick={onRegister}
                >
                  Đăng ký
                </a>
              </span>
              {/* <div className="flex items-center justify-center gap-4 pt-4">
                <img
                  className="h-14 w-14 object-cover cursor-pointer"
                  src={facebook}
                  alt="facebook"
                  onClick={() => onClickTypeLogin("facebook")}
                />
                <img
                  className="h-14 w-14 object-cover cursor-pointer"
                  src={google}
                  alt="google"
                  onClick={() => onClickTypeLogin("google")}
                />
              </div> */}
            </form>
          </div>
        </div>
      </div>

      {/* <div className="main-container --flex-center">
          <div className="img-container">
            <img src={loginImg} alt="login" />
          </div>
          <div className="form-container">
            <form onSubmit={handleSubmit} className="--form-control">
              <h2 className="--color-danger --text-center font-semibold">
                Login
              </h2>
              <input
                onChange={handleInput}
                name="email"
                type="text"
                className="--width-100"
                placeholder="Email"
              />
              <div className="password">
                <input
                  type={onShowPassword ? "text" : "password"}
                  name="password"
                  className="--width-100"
                  placeholder="Password"
                  onChange={handleInput}
                />
                <span className="icon" onClick={onTogglePassword}>
                  {onShowPassword ? (
                    <AiOutlineEyeInvisible />
                  ) : (
                    <AiOutlineEye />
                  )}
                </span>
              </div>
              <button className="--btn --btn-primary --btn-block">Login</button>
              <a className="--text-sm" onClick={onReset}>
                Forgot password?
              </a>
              <span className="--text-sm --block">
                Don't have an account?{" "}
                <a className="--text-sm" onClick={onRegister}>
                  Register
                </a>
              </span>
              <div className="flex items-center justify-center gap-4 pt-4">
                <img
                  className="h-14 w-14 object-cover cursor-pointer"
                  src={facebook}
                  alt="facebook"
                  onClick={() => onClickTypeLogin("facebook")}
                />
                <img
                  className="h-14 w-14 object-cover cursor-pointer"
                  src={google}
                  alt="google"
                  onClick={() => onClickTypeLogin("google")}
                />
              </div>
            </form>
          </div>
        </div> */}
    </>
  );
};

export default Login;
