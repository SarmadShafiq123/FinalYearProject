import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import clearInvalidToken, {
  clearInvalidAdminToken,
} from "./utils/clearInvalidToken";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import { FileProvider } from "./context/FileContext";
import { FolderProvider } from "./context/FolderContext";
import { TrashProvider } from "./context/TrashContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminProtectedRoute from "./admin/components/AdminProtectedRoute";
import Navbar from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";
import AdminSidebar from "./admin/components/AdminSidebar";
import AdminNavbar from "./admin/components/AdminNavbar";
import Loader from "./components/common/Loader";
import useAdminAuth from "./admin/hooks/useAdminAuth";
import Home from "./pages/landing/Home";
import Pricing from "./pages/landing/Pricing";
import About from "./pages/landing/About";
import Contact from "./pages/landing/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import SetPassword from "./pages/SetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import FileManager from "./pages/FileManager";
import Trash from "./pages/Trash";
import AdminLogin from "./admin/pages/Login";
import AdminForgotPassword from "./admin/pages/ForgotPassword";
import AdminDashboard from "./admin/pages/Dashboard";
import AdminRequests from "./admin/pages/Requests";
import AdminUsers from "./admin/pages/Users";
import AdminContacts from "./admin/pages/ContactMessages";
import AdminAlerts from "./admin/pages/Alerts";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const AppLayout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isMobile={true}
        />
        <Sidebar isMobile={false} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

const AdminEntryRoute = () => {
  const { admin, loading } = useAdminAuth();

  if (loading) return <Loader fullScreen />;

  if (!admin) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
};

const App = () => {
  clearInvalidToken();
  clearInvalidAdminToken();
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <FileProvider>
          <FolderProvider>
            <TrashProvider>
              <Elements stripe={stripePromise}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />

                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/set-password" element={<SetPassword />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Dashboard />
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/files"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <FileManager />
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/trash"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Trash />
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/login"
                    element={
                      <AdminAuthProvider>
                        <AdminLogin />
                      </AdminAuthProvider>
                    }
                  />
                  <Route
                    path="/admin/forgot-password"
                    element={
                      <AdminAuthProvider>
                        <AdminForgotPassword />
                      </AdminAuthProvider>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminAuthProvider>
                        <AdminEntryRoute />
                      </AdminAuthProvider>
                    }
                  />
                  <Route
                    path="/admin/requests"
                    element={
                      <AdminAuthProvider>
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <AdminRequests />
                          </AdminLayout>
                        </AdminProtectedRoute>
                      </AdminAuthProvider>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminAuthProvider>
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <AdminUsers />
                          </AdminLayout>
                        </AdminProtectedRoute>
                      </AdminAuthProvider>
                    }
                  />
                  <Route
                    path="/admin/contacts"
                    element={
                      <AdminAuthProvider>
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <AdminContacts />
                          </AdminLayout>
                        </AdminProtectedRoute>
                      </AdminAuthProvider>
                    }
                  />
                  <Route
                    path="/admin/alerts"
                    element={
                      <AdminAuthProvider>
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <AdminAlerts />
                          </AdminLayout>
                        </AdminProtectedRoute>
                      </AdminAuthProvider>
                    }
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Elements>
            </TrashProvider>
          </FolderProvider>
        </FileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
