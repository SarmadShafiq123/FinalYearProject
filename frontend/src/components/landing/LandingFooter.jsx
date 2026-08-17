import { Link } from "react-router-dom";
import { Cloud } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer className="border-t border-zinc-800 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="text-blue-400" size={18} />
              <span className="text-sm font-semibold text-white">CloudStore</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Encrypted cloud storage for privacy-first users.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Product
            </h3>
            <div className="space-y-2">
              <Link
                to="/"
                className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/pricing"
                className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                About
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Support
            </h3>
            <div className="space-y-2">
              <Link
                to="/contact"
                className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/pricing"
                className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Request Access
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Legal
            </h3>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            © 2026 CloudStore. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            University of Central Punjab — FYP Project
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
