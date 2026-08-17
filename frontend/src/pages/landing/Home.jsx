import { Link } from "react-router-dom";
import { Lock, Timer, Globe, Eye, Shield, Zap } from "lucide-react";
import LandingLayout from "../../components/landing/LandingLayout";

const Home = () => {
  return (
    <LandingLayout>
      <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-400 mb-8">
            <Lock className="text-blue-400" size={14} />
            AES-256 Encrypted Storage
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Your Files,
            <br />
            <span className="text-blue-400">Encrypted</span>
            <br />
            & Secure.
          </h1>
          <p className="text-base text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            CloudStore encrypts every file before storage using AES-256-CBC encryption. Not even we can read your data. Built for privacy-first individuals and teams.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/pricing"
              className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold px-8 py-3 rounded-lg cursor-pointer text-sm"
            >
              Get Started Free
            </Link>
            <Link
              to="/about"
              className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-white font-medium px-8 py-3 rounded-lg cursor-pointer text-sm"
            >
              Learn More
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Shield size={14} />
              AES-256 Encryption
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Globe size={14} />
              Geo-Restricted Access
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Timer size={14} />
              Self-Destruct Files
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Eye size={14} />
              Full Transparency
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">
            FEATURES
          </div>
          <h2 className="text-3xl font-bold text-white">
            Everything you need for secure storage
          </h2>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
              <Lock className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">AES-256 Encryption</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Every file encrypted before leaving your device. Zero plaintext on our servers.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
              <Timer className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Self-Destruct Files</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Set expiry time or download limits. Files auto-delete after limit is reached.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
              <Globe className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Geo-Restricted Access</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Restrict file access by country or IP. Unauthorized locations get blocked.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
              <Eye className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Privacy Dashboard</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              See who accessed your files, when and from where. Full transparency always.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
              <Shield className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Integrity Verified</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              SHA-256 hash verification on every download. Detect tampering instantly.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
              <Zap className="text-blue-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">AI Assistant</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Ask questions about your files naturally. Find anything in seconds.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">
            PROCESS
          </div>
          <h2 className="text-3xl font-bold text-white">Get started in 3 steps</h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-8 mt-12">
          <div className="flex gap-5">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Request Access</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Choose your plan on our pricing page and submit a request with your details.
              </p>
            </div>
          </div>
          <div className="flex gap-5">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Get Approved</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Receive email confirmation once approved. Your encrypted dashboard is ready instantly.
              </p>
            </div>
          </div>
          <div className="flex gap-5">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Upload Securely</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Drag and drop your files. AES-256 encryption happens automatically before storage.
              </p>
            </div>
          </div>
        </div>
        <div className="text-center mt-16">
          <Link
            to="/pricing"
            className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium px-8 py-3 rounded-lg cursor-pointer text-sm inline-block"
          >
            View Pricing Plans
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Home;
