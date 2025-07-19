import { useState } from "react";
import resetImg from "@/assets/admin/forgot.svg";
import { AiOutlineClose } from "react-icons/ai";
import { apiForgotPassword } from "@/services/user.services";

type ResetProps = {
  onLogin?: () => void;
};

const Reset = ({ onLogin }: ResetProps) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      setError(null);

      await apiForgotPassword({ email });
      setMessage("Reset link has been sent to your email.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to send reset link.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container --flex-center">
      <div className="form-container reset">
        <form className="--form-control" onSubmit={handleSubmit}>
          <h2 className="--color-danger --text-center">Reset</h2>

          <input
            type="email"
            className="--width-100"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="--btn --btn-primary --btn-block"
            disabled={loading}
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>

          {message && (
            <span className="--text-sm --block --text-center --color-success">
              {message}
            </span>
          )}
          {error && (
            <span className="--text-sm --block --text-center --color-danger">
              {error}
            </span>
          )}

          <span className="--text-sm --block --text-center">
            We will send you a reset link!
          </span>

          <div className="close" onClick={onLogin}>
            <AiOutlineClose color="red" />
          </div>
        </form>
      </div>
      <div className="img-container">
        <img src={resetImg} alt="reset" />
      </div>
    </div>
  );
};

export default Reset;
