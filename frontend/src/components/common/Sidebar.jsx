import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import useTrash from "../../hooks/useTrash";

const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "My Files",
    to: "/files",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    label: "Trash",
    to: "/trash",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    showBadge: true,
  },
];

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const { trashedFiles } = useTrash();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpen", isSidebarOpen.toString());
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-900 border-r border-zinc-800 z-50 flex flex-col py-6 px-3">
              <div className="flex items-center justify-between mb-6 px-3">
                <span className="text-white font-semibold">Menu</span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-400 hover:text-white"
                  aria-label="Close sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                    {item.showBadge && trashedFiles.length > 0 && (
                      <span className="bg-zinc-700 text-zinc-300 text-xs px-1.5 py-0.5 rounded-full ml-auto">
                        {trashedFiles.length}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </aside>
          </>
        )}
      </>
    );
  }

  return (
    <aside className={`${isSidebarOpen ? "w-64" : "w-16"} bg-zinc-900 border-r border-zinc-800 min-h-screen hidden md:flex flex-col py-6 px-3 transition-all`}>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-400 hover:text-white"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={!isSidebarOpen ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center ${isSidebarOpen ? "gap-3 px-3" : "justify-center px-0"} py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`
            }
          >
            {item.icon}
            {isSidebarOpen && (
              <>
                {item.label}
                {item.showBadge && trashedFiles.length > 0 && (
                  <span className="bg-zinc-700 text-zinc-300 text-xs px-1.5 py-0.5 rounded-full ml-auto">
                    {trashedFiles.length}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
