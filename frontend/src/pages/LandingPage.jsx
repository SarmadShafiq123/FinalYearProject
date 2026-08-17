import { useState } from "react";
import { Link } from "react-router-dom";
import { Cloud, Lock, Timer, Globe, Eye, Shield, Zap, Check } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    plan: "free",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/requests`, formData);
      toast.success("Request submitted! We'll contact you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        organization: "",
        plan: "free",
        message: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="text-blue-400" size={22} />
            <span className="text-lg font-semibold text-white">CloudStore</span>
          </div>
          <div className="flex items-center">
            <Link
              to="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer hidden sm:block"
            >
              Sign In
            </Link>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm font-medium bg-blue-600 hover:bg-blue-500 transition-colors text-white px-4 py-2 rounded-lg cursor-pointer ml-4"
            >
              Request Access
            </button>
          </div>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-400 mb-6">
            <Lock className="text-blue-400" size={14} />
            AES-256 Encrypted Storage
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Your Files,
            <br />
            <span className="text-blue-400">Encrypted</span> & Secure.
          </h1>
          <p className="text-base text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
            CloudStore encrypts every file before storage. Not even we can read your data. Built for privacy-first individuals and teams.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => scrollToSection("pricing")}
              className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium px-6 py-3 rounded-lg cursor-pointer text-sm"
            >
              Request Access
            </button>
            <Link
              to="/login"
              className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-white font-medium px-6 py-3 rounded-lg cursor-pointer text-sm"
            >
              Sign In
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Shield size={14} />
              AES-256 Encryption
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Globe size={14} />
              Geo-Restricted Access
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Timer size={14} />
              Self-Destruct Files
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-3">
            FEATURES
          </div>
          <h2 className="text-2xl font-bold text-white">
            Everything you need for secure file storage
          </h2>
          <p className="text-sm text-zinc-500 mt-2">
            Built with privacy and security at the core
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
              <Lock className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">AES-256 Encryption</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Every file is encrypted before leaving your device. Zero plaintext exposure on our servers.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
              <Timer className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Self-Destruct Files</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Set expiry time or download limits. Files automatically delete after the limit is reached.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
              <Globe className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Geo-Restricted Access</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Restrict file access by country or IP range. Access denied from unauthorized locations.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
              <Eye className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Privacy Dashboard</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              See exactly who accessed your files, when, and from where. Full transparency.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
              <Shield className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Integrity Verified</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              SHA-256 hash verification on every download. Detect any tampering instantly.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
              <Zap className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">AI Assistant</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Ask questions about your files in natural language. Find anything instantly.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-3">
            PROCESS
          </div>
          <h2 className="text-2xl font-bold text-white">Get started in minutes</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-6 mb-10">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Request Access</h3>
              <p className="text-sm text-zinc-500">
                Choose your storage plan and submit a request. Our team reviews within 24 hours.
              </p>
            </div>
          </div>
          <div className="flex gap-6 mb-10">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Get Approved</h3>
              <p className="text-sm text-zinc-500">
                Receive an email confirmation once approved. Your encrypted dashboard is ready instantly.
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Upload Securely</h3>
              <p className="text-sm text-zinc-500">
                Drag and drop files. Every file is encrypted with your unique AES-256 key before storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <div className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-3">
            PRICING
          </div>
          <h2 className="text-2xl font-bold text-white">Simple, transparent pricing</h2>
          <p className="text-sm text-zinc-500 mt-2">
            Start free. Upgrade when you need more space.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-1">Free Trial</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">$0</span>
              <span className="text-sm text-zinc-500">/mo</span>
              <p className="text-xs text-zinc-500 mt-1">1 GB Storage</p>
            </div>
            <div className="border-t border-zinc-800 mb-6"></div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Up to 1 GB storage</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">AES-256 encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Basic file management</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Email support</span>
              </div>
            </div>
            <button
              onClick={() => scrollToSection("request")}
              className="w-full py-2.5 text-sm font-medium rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-1">Starter</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">$5</span>
              <span className="text-sm text-zinc-500">/mo</span>
              <p className="text-xs text-zinc-500 mt-1">5 GB Storage</p>
            </div>
            <div className="border-t border-zinc-800 mb-6"></div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Up to 5 GB storage</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">AES-256 encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Self-destruct files</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Geo-restricted access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Priority support</span>
              </div>
            </div>
            <button
              onClick={() => scrollToSection("request")}
              className="w-full py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white cursor-pointer"
            >
              Get Started
            </button>
          </div>

          <div className="bg-zinc-900 border border-blue-600 rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              POPULAR
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Pro</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">$10</span>
              <span className="text-sm text-zinc-500">/mo</span>
              <p className="text-xs text-zinc-500 mt-1">10 GB Storage</p>
            </div>
            <div className="border-t border-zinc-800 mb-6"></div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Up to 10 GB storage</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">All Starter features</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Privacy dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">AI chat assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Activity logs</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Priority support</span>
              </div>
            </div>
            <button
              onClick={() => scrollToSection("request")}
              className="w-full py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white cursor-pointer"
            >
              Get Started
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-1">Business</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">$25</span>
              <span className="text-sm text-zinc-500">/mo</span>
              <p className="text-xs text-zinc-500 mt-1">25 GB Storage</p>
            </div>
            <div className="border-t border-zinc-800 mb-6"></div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Up to 25 GB storage</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">All Pro features</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Advanced analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Custom geo-restrictions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">Dedicated support</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-emerald-400" size={14} />
                <span className="text-xs text-zinc-400">SLA guarantee</span>
              </div>
            </div>
            <button
              onClick={() => scrollToSection("request")}
              className="w-full py-2.5 text-sm font-medium rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <section id="request" className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <div className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-3">
            GET STARTED
          </div>
          <h2 className="text-2xl font-bold text-white">Request your account</h2>
          <p className="text-sm text-zinc-500 mt-2">
            Fill in your details and we'll get back to you within 24 hours.
          </p>
        </div>
        <div className="max-w-lg mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                Organization (Optional)
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="Company or personal"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                Select Plan
              </label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="free">Free Trial</option>
                <option value="starter">Starter ($5)</option>
                <option value="pro">Pro ($10)</option>
                <option value="business">Business ($25)</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your use case..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium py-2.5 rounded-lg cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="text-blue-400" size={18} />
            <span className="text-sm font-semibold text-white">CloudStore</span>
          </div>
          <div className="text-xs text-zinc-600">
            © 2026 CloudStore. All rights reserved.
          </div>
          <Link
            to="/login"
            className="text-xs text-zinc-500 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
