import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi, getMe } from "../api/auth.api";

const AdminAuthContext = createContext(null);

const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const stored = localStorage.getItem("adminToken");
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        const user = res.data.data.user;
        if (user.role !== "masterAdmin") {
          localStorage.removeItem("adminToken");
          setToken(null);
          setAdmin(null);
        } else {
          setAdmin(user);
          setToken(stored);
        }
      } catch {
        localStorage.removeItem("adminToken");
        setToken(null);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    const { token: newToken, user } = res.data.data;
    if (user.role !== "masterAdmin") {
      throw new Error("Access denied.");
    }
    localStorage.setItem("adminToken", newToken);
    setToken(newToken);
    setAdmin(user);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setAdmin(null);
    navigate("/login");
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export { AdminAuthContext, AdminAuthProvider };
