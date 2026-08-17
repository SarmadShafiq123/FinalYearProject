import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Cloud, Menu, X } from "lucide-react";

const LandingNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Pricing", path: "/pricing" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Admin", path: "/admin" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Cloud className="text-blue-400" size={22} />
          <span className="text-lg font-semibold text-white">CloudStore</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm transition-colors cursor-pointer ${
                isActive(link.path)
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center">
          <Link
            to="/login"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/pricing"
            className="text-sm font-medium bg-blue-600 hover:bg-blue-500 transition-colors text-white px-4 py-2 rounded-lg cursor-pointer ml-4"
          >
            Get Started
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden ml-4 text-zinc-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-sm transition-colors ${
                isActive(link.path)
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm text-zinc-400 hover:text-white transition-colors pt-3 border-t border-zinc-800"
          >
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
