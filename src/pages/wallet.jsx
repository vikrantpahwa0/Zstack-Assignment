import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchWalletOverview, // Single API call
  sendMoney,
  clearUserError,
  clearTransferStatus,
} from "../store/slices/user-slice";
import { logout } from "../store/slices/auth-slice";

const paisaToRupees = (paisa) => (Number(paisa) / 100).toFixed(2);

export default function Wallet() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    wallet,
    transactions,
    users,
    overviewLoading,
    transferLoading,
    error,
    lastTransfer,
  } = useSelector((s) => s.user);
  
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    dispatch(fetchWalletOverview());
  }, [dispatch, isAuthenticated, navigate]);

  const selfId = wallet?.userId;
  const receivers = users ? users.filter((u) => u.id !== selfId) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearUserError());
    dispatch(clearTransferStatus());

    const amountPaisa = Number(amount);
    if (!Number.isInteger(amountPaisa) || amountPaisa <= 0) return;

    const idempotencyKey = crypto.randomUUID();
    
    const simulateFailure = true; 

    const payload = {
      toUserId: Number(toUserId),
      amount: amountPaisa,
      idempotencyKey,
    };

    const attemptTransfer = async (isRetry = false) => {
      const res = await dispatch(
        sendMoney({
          ...payload,
          simulateFailure: isRetry ? false : simulateFailure, 
        })
      );

      if (res.meta.requestStatus === "fulfilled") {
        setAmount("");
        setToUserId("");
        dispatch(fetchWalletOverview());
      } else {
        if (!isRetry) {
          console.log("Transfer failed. Retrying with same key:", idempotencyKey);
          setTimeout(() => attemptTransfer(true), 1000);
        } else {
          console.error("Retry failed too.");
        }
      }
    };

    attemptTransfer();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  if (overviewLoading && !wallet) {
    return <p className="p-8 text-center">Loading wallet...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Hi, {wallet?.name || "there"} 
            </h1>
            <p className="text-gray-500 text-sm mt-1">Your wallet</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-gray-100 transition"
          >
            Log out
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-200 via-green-300 to-green-400 rounded-2xl shadow-sm p-6 mb-6">
          <p className="text-sm text-slate-700 font-medium">Available balance</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-4xl font-bold text-slate-900">
              {wallet ? wallet.balance : "—"} <span className="text-xl font-medium text-slate-700">Paisa</span>
            </p>
            {wallet && (
              <p className="text-lg font-medium text-slate-700">
                (₹{paisaToRupees(wallet.balance)})
              </p>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6"
        >
          <h2 className="text-lg font-medium text-slate-800 mb-4">Send money</h2>

          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Receiver</label>
              <select
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                required
                disabled={transferLoading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-green-300 focus:ring-2 focus:ring-green-200 transition disabled:opacity-50"
              >
                <option value="">Select a user</option>
                {receivers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Amount (Paisa)
              </label>
              <input
                type="number"
                min="100"
                max="5000000"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={transferLoading}
                placeholder="100 – 5,000,000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-300 focus:ring-2 focus:ring-green-200 transition disabled:opacity-50"
              />
              {amount && Number(amount) > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  = ₹{paisaToRupees(amount)}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={transferLoading || !toUserId || !amount}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-green-200 via-green-300 to-green-400 text-slate-900 font-semibold transition active:scale-95 hover:from-green-300 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {transferLoading ? "Sending..." : "Send"}
          </button>

          {lastTransfer?.success && (
            <p className="text-emerald-600 text-sm mt-3">
              ✓ {lastTransfer.message}
            </p>
          )}
          {lastTransfer && !lastTransfer.success && (
            <p className="text-red-500 text-sm mt-3">{lastTransfer.message}</p>
          )}
          {error && !lastTransfer && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-lg font-medium text-slate-800 mb-4">
            Transactions
          </h2>

          {overviewLoading && transactions.length === 0 && (
            <p className="text-sm text-gray-500">Loading...</p>
          )}
          {!overviewLoading && transactions.length === 0 && (
            <p className="text-sm text-gray-500">No transactions yet.</p>
          )}

          <ul className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isSent = tx.direction === "SENT";
              const otherUserName = isSent ? tx.toUserName : tx.fromUserName;

              return (
                <li key={tx.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {isSent ? "Sent to" : "Received from"} {otherUserName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-semibold block ${
                        isSent ? "text-red-500" : "text-emerald-600"
                      }`}
                    >
                      {isSent ? "−" : "+"}{tx.amount} P
                    </span>
                    <span className="text-xs text-gray-400">
                      {isSent ? "−" : "+"}₹{paisaToRupees(tx.amount)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}