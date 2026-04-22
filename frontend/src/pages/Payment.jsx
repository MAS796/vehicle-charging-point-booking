import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("upi"); // upi | card | netbanking

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-slate-900/60 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold">No booking found</h2>
          <p className="text-slate-300 mt-1">Please book a slot first.</p>
        </div>
      </div>
    );
  }

  // Booking API returns `id`, older code expected `booking_id`. Support both.
  const { name, car_number, phone, hours } = state;
  const bookingId = state.booking_id ?? state.id;

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-slate-900/60 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold">Invalid booking</h2>
          <p className="text-slate-300 mt-1">Missing booking id. Please book a slot again.</p>
        </div>
      </div>
    );
  }

  const amount = Number(state.amount ?? Number(hours) * 60); // fallback for legacy state

  let razorpayMethod = { upi: true, netbanking: true, card: true, wallet: true, emi: true };
  if (method === "upi") razorpayMethod = { upi: true };
  if (method === "card") razorpayMethod = { card: true, emi: true };
  if (method === "netbanking") razorpayMethod = { netbanking: true };

  const handleRazorpayPayment = async () => {
    setError("");
    setLoading(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Razorpay checkout failed to load");

      const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!key) throw new Error("Missing VITE_RAZORPAY_KEY_ID in frontend env");

      const { data: order } = await api.post("/payments/create-order", {
        booking_id: bookingId,
        amount,
      });

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "EV Smart Charging",
        description: "EV Charging Slot Booking",
        order_id: order.id,
        handler: async function (response) {
          try {
            await api.post("/payments/verify", {
              booking_id: bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate("/");
          } catch (e) {
            setError("Payment verification failed: " + getErrorMessage(e));
          }
        },
        prefill: {
          name: name || "EV User",
          email: localStorage.getItem("email") || "user@example.com",
          contact: phone || "9999999999",
        },
        theme: { color: "#00c853" },
        method: razorpayMethod,
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        setError("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      setError("Payment failed: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    try {
      await api.post("/payments/process", {
        booking_id: bookingId,
        amount,
        phone,
      });
      navigate("/");
    } catch (err) {
      setError("Payment failed: " + getErrorMessage(err));
    }
  };

  const methodCard = (id, title, subtitle) => {
    const active = method === id;
    return (
      <button
        type="button"
        onClick={() => setMethod(id)}
        className={[
          "text-left rounded-xl border p-4 transition",
          active
            ? "border-emerald-400/70 bg-emerald-400/10"
            : "border-slate-700 bg-slate-900/40 hover:bg-slate-900/70",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-white font-semibold">{title}</p>
            <p className="text-slate-300 text-sm mt-1">{subtitle}</p>
          </div>
          <div
            className={[
              "h-4 w-4 rounded-full border",
              active ? "border-emerald-300 bg-emerald-400" : "border-slate-500 bg-transparent",
            ].join(" ")}
          />
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Payment</h1>
            <p className="text-slate-300 mt-1">Step 2 of 2: Choose a method and pay securely.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-900 transition"
          >
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Select Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {methodCard("upi", "UPI", "Pay using UPI apps")}
              {methodCard("card", "Card", "Debit/Credit + EMI")}
              {methodCard("netbanking", "Net Banking", "Pay via your bank")}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRazorpayPayment}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-semibold hover:opacity-95 disabled:opacity-60 transition"
              >
                {loading ? "Opening Razorpay..." : `Pay Rs ${amount} (Secure)`}
              </button>
              <button
                onClick={confirmPayment}
                disabled={loading}
                className="py-3 px-5 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-900 transition disabled:opacity-60"
                title="Fallback option for testing only"
              >
                Manual (Test)
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Booking Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Name</span>
                <span className="text-white font-medium">{name || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Car</span>
                <span className="text-white font-medium">{car_number || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Phone</span>
                <span className="text-white font-medium">{phone || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Hours</span>
                <span className="text-white font-medium">{hours}</span>
              </div>
              <div className="h-px bg-slate-700 my-3" />
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Total</span>
                <span className="text-emerald-300 font-semibold">Rs {amount}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-5">
              Powered by Razorpay. Your card/UPI details are never stored on our server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
