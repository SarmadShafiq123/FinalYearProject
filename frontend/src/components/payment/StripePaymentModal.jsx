import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { X, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { confirmPayment } from "../../api/payment.api";

const StripePaymentModal = ({ isOpen, onClose, paymentData, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState("");

  if (!isOpen) return null;

  const handleCardChange = (e) => {
    setCardError(e.error?.message || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe is not loaded");
      return;
    }

    if (!paymentData?.clientSecret) {
      toast.error("Payment information is missing");
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (error) {
        setCardError(error.message);
        toast.error(error.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        const confirmRes = await confirmPayment({
          paymentIntentId: paymentIntent.id,
          requestId: paymentData.requestId,
        });

        toast.success("Payment successful! Your plan is now active.");
        onSuccess();
        onClose();
      } else if (paymentIntent.status === "processing") {
        toast.loading("Payment is being processed...");
      }
    } catch (err) {
      toast.error(err.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const amount = paymentData?.amount ? (paymentData.amount / 100).toFixed(2) : "0.00";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Complete Payment</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <p className="text-sm text-zinc-400 mb-2">Amount to Pay</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">${amount}</span>
              <span className="text-sm text-zinc-500">/month</span>
            </div>
          </div>

          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">
              Card Details
            </label>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "14px",
                    color: "#f4f4f5",
                    "::placeholder": {
                      color: "#71717a",
                    },
                  },
                  invalid: {
                    color: "#ef4444",
                  },
                },
              }}
              onChange={handleCardChange}
            />
            {cardError && (
              <p className="text-xs text-red-500 mt-2">{cardError}</p>
            )}
          </div>

          <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
            <p className="text-xs text-zinc-300">
              <span className="text-blue-400 font-semibold">Test Card:</span> 4242 4242 4242 4242 | Any future date | Any CVC
            </p>
          </div>

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing && <Loader size={18} className="animate-spin" />}
            {isProcessing ? "Processing..." : `Pay $${amount}`}
          </button>

          <p className="text-xs text-zinc-500 text-center">
            Your payment is secure and encrypted. Your card information is processed by Stripe.
          </p>
        </form>
      </div>
    </div>
  );
};

export default StripePaymentModal;
