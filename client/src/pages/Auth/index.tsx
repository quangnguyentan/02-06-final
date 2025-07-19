import { useState } from "react";
import Reset from "../Reset";
import Authentication from "../Login-Authentication";
import RegistrationAuthentication from "../Registration-Authentication";
interface AuthProps {
  handleClose: () => void;
}
const Auth = ({ handleClose }: AuthProps) => {
  const [auth, setAuth] = useState({
    login: true,
    register: false,
    reset: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = () => {
    setAuth({ reset: false, register: false, login: true });
  };

  const handleRegister = () => {
    setAuth({ ...auth, login: false, register: true });
  };

  const handleReset = () => {
    setAuth({ ...auth, login: false, reset: true });
  };
  const handleClickTypeLogin = (type: string) => {
    window.open(`http://localhost:8080/api/auth/${type}`, "_self");
  };
  return (
    <div className="w-full mx-auto max-w-[640px] sm:max-w-[768px] md:max-w-[960px] lg:max-w-[1024px] xl:max-w-[1200px] 2xl:max-w-[1440px] 3xl:max-w-[1440px]">
      {auth.login && (
        <Authentication
          onClose={handleClose}
          onRegister={handleRegister}
          onReset={handleReset}
          onShowPassword={showPassword}
          onTogglePassword={handleTogglePassword}
          onClickTypeLogin={handleClickTypeLogin}
        />
      )}
      {auth.register && (
        <RegistrationAuthentication
          onClose={handleClose}
          onLogin={handleLogin}
          onShowPassword={showPassword}
          onTogglePassword={handleTogglePassword}
          onClickTypeLogin={handleClickTypeLogin}
        />
      )}
      {auth.reset && <Reset onLogin={handleLogin} />}
    </div>
  );
};

export default Auth;
