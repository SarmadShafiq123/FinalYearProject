import { NavLink } from "react-router-dom";
import { Cloud, LayoutDashboard, FileText, Users, Mail, Bell, LogOut } from "lucide-react";
import useAdminAuth from "../../hooks/useAdminAuth";

const AdminSidebar = ({ pendingCount, unreadCount }) => {
  const { admin, logout } = useAdminAuth();

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/requests", label: "Requests", icon: FileText, badge: pendingCount },
    { to: "/users", label: "Users", icon: Users },
    { to: "/contacts", label: "Messages", icon: Mail, badge: unreadCount },
    { to: "/alerts", label: "Alerts", icon: Bell },
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0">
      <div className="px-6 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <Cloud size={20} className="text-blue-500" />
          <div>
            <p className="text-sm font-semibold text-white">CloudStore</p>
            <p className="text-xs text-zinc-500 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, badge, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
            {badge > 0 && (
              <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-md">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs font-medium text-white truncate">{admin?.name}</p>
        <p className="text-xs text-zinc-500 truncate mt-0.5">{admin?.email}</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-red-400 transition-colors cursor-pointer mt-3"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
