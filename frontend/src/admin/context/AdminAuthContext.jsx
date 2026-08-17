import { createContext, useState, useEffect } from "react"
import adminAxios from "../utils/adminAxios"
import { login as loginApi } from "../api/auth.api"

const AdminAuthContext = createContext(null)

const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      setAdmin(null)
      setLoading(false)
      return
    }
    adminAxios
      .get("/auth/me")
      .then((res) => {
        const user = res.data.data.user
        if (user.role !== "masterAdmin") {
          localStorage.removeItem("adminToken")
          setAdmin(null)
        } else {
          setAdmin(user)
        }
      })
      .catch(() => {
        localStorage.removeItem("adminToken")
        setAdmin(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const login = async (email, password) => {
    const res = await loginApi(email, password)
    const { token: newToken, user } = res.data.data
    if (user.role !== "masterAdmin") {
      throw new Error("Access denied.")
    }
    localStorage.setItem("adminToken", newToken)
    setAdmin(user)
  }

  const logout = () => {
    localStorage.removeItem("adminToken")
    setAdmin(null)
    window.location.href = "/admin/login"
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export { AdminAuthContext, AdminAuthProvider }
