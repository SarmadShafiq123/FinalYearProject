import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AlertsPanel from "./AlertsPanel";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-400 hover:text-white"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <span className="font-semibold text-white text-lg">CloudStore</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-400 hidden sm:block">
          {user?.name}
        </span>
        <AlertsPanel />
        <button
          onClick={handleLogout}
          className="bg-zinc-800 hover:bg-zinc-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
