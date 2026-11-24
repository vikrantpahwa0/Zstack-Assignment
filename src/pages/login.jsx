import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, clearError } from "../store/slices/auth-slice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/wallet", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 sm:p-8">
        <h2 className="text-3xl sm:text-4xl text-center font-medium mb-6 sm:mb-8">
          Welcome back
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 text-base focus:outline-none focus:border-green-300 focus:ring-2 focus:ring-green-200 transition disabled:opacity-50"
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 text-base focus:outline-none focus:border-green-300 focus:ring-2 focus:ring-green-200 transition disabled:opacity-50"
          />

          {error && (
            <p className="text-red-500 text-sm text-center mb-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-green-200 text-slate-900 font-semibold text-base transition active:scale-95 hover:bg-green-300 disabled:opacity-50 mt-1"
          >
            {isLoading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          <br />
        </p>
      </div>
    </div>
  );
}