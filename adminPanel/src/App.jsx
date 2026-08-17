import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import useAdminAuth from "./hooks/useAdminAuth";
import Loader from "./components/common/Loader";
import AdminSidebar from "./components/common/AdminSidebar";
import AdminNavbar from "./components/common/AdminNavbar";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import Users from "./pages/Users";
import ContactMessages from "./pages/ContactMessages";
import Alerts from "./pages/Alerts";
import { useState, useEffect } from "react";
import { getStats } from "./api/requests.api";
import { getAllContacts } from "./api/contact.api";

const AdminProtectedRoute = ({ children }) => {
  const { token, admin, loading } = useAdminAuth();
  if (loading) return <Loader />;
  if (!token || !admin) return <Navigate to="/login" replace />;
  if (admin.role !== "masterAdmin") return <Navigate to="/login" replace />;
  return children;
};

const AppLayout = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [statsRes, contactsRes] = await Promise.all([
          getStats(),
          getAllContacts(),
        ]);
        setPendingCount(statsRes.data.data.pendingRequests || 0);
        setUnreadCount(contactsRes.data.data.contacts.length || 0);
      } catch {
        // silent
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <AdminSidebar pendingCount={pendingCount} unreadCount={unreadCount} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/"
        element={
          <AdminProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <AdminProtectedRoute>
            <AppLayout>
              <Requests />
            </AppLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <AdminProtectedRoute>
            <AppLayout>
              <Users />
            </AppLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <AdminProtectedRoute>
            <AppLayout>
              <ContactMessages />
            </AppLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <AdminProtectedRoute>
            <AppLayout>
              <Alerts />
            </AppLayout>
          </AdminProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#ffffff",
              border: "1px solid #27272a",
              fontSize: "13px",
            },
          }}
        />
      </AdminAuthProvider>
    </BrowserRouter>
  );
};

export default App;
