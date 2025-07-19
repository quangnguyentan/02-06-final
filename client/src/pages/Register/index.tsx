import { useState, FormEvent, ChangeEvent } from "react";
import registerImg from "@/assets/admin/register.svg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import toast from "react-hot-toast";
import { apiRegister } from "@/services/auth.services";
import { authActionProps } from "@/stores/actions/authAction";

import "./index.css";
import { useMediaQuery, useTheme } from "@mui/material";

type registerProps = {
  onLogin?: () => void;
  onShowPassword?: boolean;
  onTogglePassword?: () => void;
  onClickTypeLogin: (type: string) => void;
  onClose?: () => void;
};
const Register = ({
  onLogin,
  onShowPassword,
  onTogglePassword,
  onClose,
}: registerProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState<authActionProps>({
    username: "",
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
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!input.phone || !input.password) {
        toast.error("Please fill in all fields");
        return;
      }
      setLoading(true);
      const response = await apiRegister({
        ...input,
        typeLogin: "phone",
      });
      if (response.data.err == 0) {
        toast.error(response.data.msg);
      }
      if (response.data.success) {
        toast.success("Register successful!");
        onLogin?.();
        setInput({ phone: "", password: "" });
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  // const handleShowIndicator = () => {
  //   setShowIndicator(true);
  // };

  // useEffect(() => {
  //   // check Lower and Uppercase
  //   if (input.password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
  //     setPassLetter(true);
  //   } else {
  //     setPassLetter(false);
  //   }

  //   // Check For Numbers
  //   if (input.password.match(/([0-9])/)) {
  //     setPassNumber(true);
  //   } else {
  //     setPassNumber(false);
  //   }

  //   // Check For Special char

  //   if (input.password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
  //     setPassChar(true);
  //   } else {
  //     setPassChar(false);
  //   }

  //   if (input.password.length > 7) {
  //     setPassLength(true);
  //   } else {
  //     setPassLength(false);
  //   }

  //   if (passLetter && passNumber && passChar && passLength) {
  //     setPassComplete(true);
  //   } else {
  //     setPassComplete(false);
  //   }
  // }, [input.password, passLetter, passNumber, passChar, passLength]);

  return (
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
              Đăng ký
            </h2>
            <span
              className={`${
                isMobile
                  ? "font-normal text-gray-500/80 text-[14px] flex items-center justify-center"
                  : "font-normal text-gray-500/80 text-[18px] flex items-center justify-center"
              }`}
            >
              Chào mừng đến với HOIQUANTV
            </span>
            {/* <input type="text" className="--width-100" placeholder="Username" /> */}
            <input
              onChange={handleInput}
              name="username"
              type="text"
              className={
                isMobile
                  ? "--width-100 !rounded-xl h-10 placeholder:text-base !text-base"
                  : "--width-100 !rounded-xl"
              }
              placeholder="Họ và tên"
            />
            <input
              onChange={handleInput}
              name="phone"
              type="number"
              className={
                isMobile
                  ? "--width-100 !rounded-xl h-10 placeholder:text-base !text-base no-arrows"
                  : "--width-100 !rounded-xl no-arrows"
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
                {onShowPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
            {/* PASSWORD FIELD */}
            {/* <button
              disabled={!passComplete}
              className={
                passComplete
                  ? "--btn --btn-dark hover:bg-black/90 hover:text-gray-300/90 --btn-block"
                  : "--btn --btn-dark hover:bg-black/90 hover:text-gray-300/90 --btn-block btn-disabled"
              }
            > */}
            <button
              className={
                isMobile
                  ? "--btn --btn-dark !bg-blue-500 hover:!bg-blue-600 --btn-block h-8 !text-base"
                  : "--btn --btn-dark !bg-blue-500 hover:!bg-blue-600 --btn-block"
              }
            >
              Đăng ký tài khoản
            </button>

            <span
              className={
                isMobile ? "--text-sm --block !text-sm" : "--text-sm --block"
              }
            >
              Đã có tài khoản?
              <a
                className={`${
                  isMobile
                    ? "--text-sm cursor-pointer !text-sm"
                    : "--text-sm cursor-pointer"
                }`}
                onClick={onLogin}
              >
                Đăng nhập
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
            {/* Pass Strength Indicator */}
            {/* <div
              className={showIndicator ? "show-indicator" : "hide-indicator"}
            >
              <ul className="--list-style-none --card --bg-grey --text-sm --p">
                <p className="--text-sm">Password Strength Indicator</p>
                <li className={passLetter ? "pass-green" : "pass-red"}>
                  <span className="--align-center">
                    {passLetter ? <FaCheck /> : <GoDotFill />}
                    &nbsp; Lowercase & Uppercase
                  </span>
                </li>
                <li className={passNumber ? "pass-green" : "pass-red"}>
                  <span className="--align-center">
                    {passNumber ? <FaCheck /> : <GoDotFill />}
                    &nbsp; Numbers (0-9)
                  </span>
                </li>
                <li className={passChar ? "pass-green" : "pass-red"}>
                  <span className="--align-center">
                    {passChar ? <FaCheck /> : <GoDotFill />}
                    &nbsp; Special Character (!@#$%^&*)
                  </span>
                </li>
                <li className={passLength ? "pass-green" : "pass-red"}>
                  <span className="--align-center">
                    {passLength ? <FaCheck /> : <GoDotFill />}
                    &nbsp; At least 8 Character
                  </span>
                </li>
              </ul>
            </div> */}
            {/* Pass Strength Indicator */}
          </form>
        </div>
        {/* <div className="img-container-auth flex items-center justify-center ">
          <img
            src={icon_auth}
            alt="login"
            className="w-[70%] h-[90%] object-cover mx-auto -rotate-6 rounded-3xl"
          />
        </div> */}
        <div className="img-container">
          <img src={registerImg} alt="login" />
        </div>
      </div>

      {/* <div className="main-container --flex-center">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="--form-control">
            <h2 className="--color-danger --text-center">Register</h2>

            <input
              onChange={handleInput}
              name="email"
              type="email"
              className="--width-100"
              placeholder="Email"
            />
            <div className="password">
              <input
                type={onShowPassword ? "text" : "password"}
                className="--width-100"
                name="password"
                placeholder="Password"
                onFocus={handleShowIndicator}
                value={input.password}
                onChange={handleInput}
              />
              <span className="icon" onClick={onTogglePassword}>
                {onShowPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
            <button
              disabled={!passComplete}
              className={
                passComplete
                  ? "--btn --btn-primary --btn-block"
                  : "--btn --btn-primary --btn-block btn-disabled"
              }
            >
              Register
            </button>

            <span className="--text-sm --block">
              Have an account?
              <a className="--text-sm" onClick={onLogin}>
                Login
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
            <div
              className={showIndicator ? "show-indicator" : "hide-indicator"}
            >
              <ul className="--list-style-none --card --bg-grey --text-sm --p">
                <p className="--text-sm">Password Strength Indicator</p>
                <li className={passLetter ? "pass-green" : "pass-red"}>
                  <span className="--align-center">
                    {passLetter ? <FaCheck /> : <GoDotFill />}
                    &nbsp; Lowercase & Uppercase
                  </span>
                </li>
                <li className={passNumber ? "pass-green" : "pass-red"}>
                  <span className="--align-center">
                    {passNumber ? <FaCheck /> : <GoDotFill />}
                    &nbsp; Numbers (0-9)
                  </span>
                </li>
                <li className={passChar ? "pass-green" : "pass-red"}>
                  <span className="--align-center">
                    {passChar ? <FaCheck /> : <GoDotFill />}
                    &nbsp; Special Character (!@#$%^&*)
                  </span>
                </li>
                <li className={passLength ? "pass-green" : "pass-red"}>
                  <span className="--align-center">
                    {passLength ? <FaCheck /> : <GoDotFill />}
                    &nbsp; At least 8 Character
                  </span>
                </li>
              </ul>
            </div>
          </form>
        </div>
        <div className="img-container">
          <img src={registerImg} alt="login" />
        </div>
      </div> */}
    </div>
  );
};

export default Register;
