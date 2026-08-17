import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Check, CreditCard, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import LandingLayout from "../../components/landing/LandingLayout";
import useAuth from "../../hooks/useAuth";
import { createPaymentIntent } from "../../api/payment.api";
import StripePaymentModal from "../../components/payment/StripePaymentModal";

const plans = [
  {
    id: "free",
    name: "Free Trial",
    price: "$0",
    storage: "1 GB Storage",
    storageBytes: 1073741824,
    features: [
      "Up to 1 GB storage",
      "AES-256 encryption",
      "Basic file management",
      "Folder organization",
      "Email support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$5",
    storage: "5 GB Storage",
    storageBytes: 5368709120,
    features: [
      "Up to 5 GB storage",
      "AES-256 encryption",
      "Self-destruct files",
      "Geo-restricted access",
      "Trash with recovery",
      "Priority support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$10",
    storage: "10 GB Storage",
    storageBytes: 10737418240,
    popular: true,
    features: [
      "Up to 10 GB storage",
      "All Starter features",
      "Privacy dashboard",
      "AI chat assistant",
      "Full activity logs",
      "Priority support",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "$25",
    storage: "25 GB Storage",
    storageBytes: 26843545600,
    features: [
      "Up to 25 GB storage",
      "All Pro features",
      "Advanced analytics",
      "Custom geo-restrictions",
      "Dedicated support",
      "SLA guarantee",
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam && plans.find((p) => p.id === planParam)) {
      setSelectedPlan(planParam);
    }
  }, [searchParams]);

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);
  const isLockedUser =
    user?.planStatus === "locked" || user?.planStatus === "expired";

  const scrollToForm = () => {
    // If user is not logged in, send them to login with plan preserved
    if (!user) {
      navigate(`/login?redirect=/pricing&plan=${selectedPlan}`);
      return;
    }
    document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Belt-and-suspenders guard — should not be reachable without user, but just in case
    if (!user) {
      navigate(`/login?redirect=/pricing&plan=${selectedPlan}`);
      return;
    }

    if (!user.isEmailVerified && !user.googleId) {
      toast.error("Please verify your email before activating a plan.");
      navigate("/verify-email");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createPaymentIntent({
        plan: selectedPlan,
        storageBytes: selectedPlanData.storageBytes,
        organization: organization || undefined,
        message: message || undefined,
      });

      const { request, clientSecret, amount } = response.data.data;

      if (selectedPlan === "free") {
        // Refresh the user object so ProtectedRoute sees the new planStatus immediately
        await refreshUser();
        toast.success("Free plan activated! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setPaymentData({
          clientSecret,
          requestId: request._id,
          amount,
          plan: selectedPlan,
        });
        setIsPaymentModalOpen(true);
      }

      setOrganization("");
      setMessage("");
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Failed to create payment. Please try again.";

      if (status === 409) {
        // Already has an active plan — show the message and redirect to dashboard
        toast(msg, {
          icon: "✅",
          style: {
            background: "#18181b",
            color: "#ffffff",
            border: "1px solid #27272a",
            fontSize: "13px",
          },
          duration: 5000,
        });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LandingLayout>
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">
          PRICING
        </div>
        <h1 className="text-3xl font-bold text-white">
          Simple, transparent pricing
        </h1>
        <p className="text-sm text-zinc-500 mt-2">
          Start free. Upgrade when you need more space.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`rounded-xl p-6 cursor-pointer transition-colors relative ${
              selectedPlan === plan.id
                ? "bg-zinc-900 border-2 border-blue-500"
                : "bg-zinc-900 border border-zinc-800 hover:border-zinc-600"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                POPULAR
              </div>
            )}
            {selectedPlan === plan.id && (
              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <Check className="text-white" size={12} />
              </div>
            )}
            <h3 className="text-sm font-semibold text-white mb-1">
              {plan.name}
            </h3>
            <div className="mb-1">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              <span className="text-sm text-zinc-500 font-normal">/mo</span>
            </div>
            <p className="text-xs text-zinc-500 mb-1">{plan.storage}</p>
            <div className="border-t border-zinc-800 my-5"></div>
            <div className="space-y-2.5">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="text-emerald-400 shrink-0" size={14} />
                  <span className="text-xs text-zinc-400">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 text-center">
        <button
          onClick={scrollToForm}
          className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium px-10 py-3 rounded-lg cursor-pointer text-sm flex items-center justify-center gap-2 mx-auto"
        >
          <CreditCard size={16} />
          Get Started with {selectedPlanData?.name}
        </button>
      </div>

      {/* ── Form section ── only renders for logged-in users ── */}
      <div id="request-form" className="max-w-lg mx-auto px-6 py-16">
        {!user ? (
          /* Logged-out state — show a clean CTA instead of the form */
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/10 rounded-full mb-4">
              <LogIn className="text-blue-400" size={24} />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Sign in to get started
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              You need an account to activate a plan. It only takes a minute.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={`/login?redirect=/pricing&plan=${selectedPlan}`}
                className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium px-6 py-2.5 rounded-lg flex items-center justify-center gap-2"
              >
                <LogIn size={15} />
                Sign In
              </Link>
              <Link
                to={`/register?redirect=/pricing&plan=${selectedPlan}`}
                className="bg-zinc-800 hover:bg-zinc-700 transition-colors text-white text-sm font-medium px-6 py-2.5 rounded-lg"
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          /* Logged-in state — show the form */
          <>
            <h2 className="text-xl font-semibold text-white mb-1 text-center">
              {selectedPlan === "free" ? "Start Your Free Trial" : "Upgrade Your Account"}
            </h2>
            <p className="text-sm text-zinc-500 text-center mb-8">
              {selectedPlan === "free"
                ? "No credit card required. Get instant access."
                : "Secure payment powered by Stripe."}
            </p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              {isLockedUser && (
                <div className="bg-amber-600/10 border border-amber-600/20 rounded-lg p-4 mb-6 text-sm text-amber-100">
                  Your paid plan has expired and your files are locked. Renew now to
                  restore your files before the 45-day deletion deadline.
                </div>
              )}

              {/* Selected plan summary */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 flex items-center justify-between mb-6">
                <span className="text-sm text-zinc-300">Selected Plan:</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">
                    {selectedPlanData?.name} {selectedPlanData?.price}/mo
                  </span>
                  <button
                    type="button"
                    onClick={scrollToTop}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Account info — read-only, sourced from JWT */}
              <div className="mb-4">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user.name}
                  readOnly
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                    Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Company or personal"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
                <div className="mb-4">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                    Message / Use Case (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your use case..."
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium py-2.5 rounded-lg cursor-pointer mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CreditCard size={14} />
                  {isSubmitting
                    ? "Processing..."
                    : selectedPlan === "free"
                      ? "Activate Free Plan →"
                      : "Continue to Payment →"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      <StripePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentData={paymentData}
        onSuccess={async () => {
          // Refresh user so ProtectedRoute sees planStatus: "active" before navigation
          await refreshUser();
          setTimeout(() => navigate("/dashboard"), 1500);
        }}
      />
    </LandingLayout>
  );
};

export default Pricing;
