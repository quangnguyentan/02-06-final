import styles from "./login-authentication.module.css";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { apiLogin } from "@/services/auth.services";
import { ChangeEvent, FormEvent, useState } from "react";
import { authActionProps, loginAction } from "@/stores/actions/authAction";
import { useAppDispatch } from "@/hooks/use-dispatch";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useMediaQuery, useTheme } from "@mui/material";
type loginProps = {
  onRegister?: () => void;
  onReset?: () => void;
  onTogglePassword?: () => void;
  onShowPassword?: boolean;
  onClickTypeLogin: (type: string) => void;
  onClose?: () => void;
};
const LoginAuthentication = ({
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
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!input.phone || !input.password) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }
      setLoading(true);
      const response = await apiLogin(input);
      if (response.data.err === 0) {
        toast.error(response.data.msg);
      }
      if (response?.data?.success) {
        dispatch(loginAction(input))
          .then(() => {
            toast.success("Đăng nhập thành công!");
            if (onClose) {
              onClose();
            }
          })
          .catch(() => {
            toast.error("Đăng nhập thất bại. Vui lòng thử lại!");
            setInput({ phone: "", password: "" });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } catch (error: any) {
      setLoading(false);
      console.error("Login failed:", error);
      if (error.status === 400) {
        toast.error(
          error.data?.msg || "Người dùng đã tồn tại. Vui lòng thử lại!"
        );
      } else {
        const msg =
          error.response?.data?.msg ?? "Đăng nhập thất bại. Vui lòng thử lại!";
        toast.error(msg);
      }
    }
  };

  return (
    <div className={styles.containerAuth}>
      <div className={styles.leftAuth}>
        <div className={styles.loginSection}>
          <header>
            <h2
              className={`${styles.loginSectionHeaderH2} ${styles.animation} ${styles.a1} !font-serif !text-[#d93280] !italic`}
            >
              HoiQuanTV
            </h2>
            <h4
              className={`${styles.loginSectionHeaderH4} ${styles.animation} ${styles.a2}`}
            >
              Chào mừng bạn đến với HoiQuanTV, Vui lòng đăng nhập để tiếp tục
            </h4>
          </header>
          <form className={styles.loginSectionForm} onSubmit={handleSubmit}>
            <input
              onChange={handleInput}
              type="number"
              placeholder="Số điện thọai"
              name="phone"
              className={`${styles.inputField} ${styles.animation} ${styles.a3} !text-black no-arrows`}
            />
            <div className="relative">
              <input
                onChange={handleInput}
                type={onShowPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                name="password"
                className={`${styles.inputField} ${styles.animation} ${styles.a4} !w-full !text-black`}
              />
              <span
                className={`${styles.animation} block absolute right-3 top-[22px] md:top-9 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 transition-all duration-200 ease-in-out`}
                data-testid="toggle-password-icon"
                onClick={onTogglePassword}
              >
                {onShowPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
            <p
              className={`${styles.loginSectionFormP} ${styles.animation} ${styles.a5}`}
            >
              <div
                onClick={onRegister}
                className={`${styles.loginSectionFormPA} !cursor-pointer pt-2`}
              >
                Chưa có tài khoản?{" "}
                <span className="text-[#d93280] hover:text-[#ea6aa6f3] transition-colors duration-200">
                  Đăng ký
                </span>
              </div>
            </p>
            <button
              className={`${styles.loginSectionFormButton} ${styles.animation} ${styles.a6}`}
            >
              ĐĂNG NHẬP
            </button>
          </form>
        </div>
      </div>
      <div className={styles.rightAuth}></div>
    </div>
  );
};

export default LoginAuthentication;
