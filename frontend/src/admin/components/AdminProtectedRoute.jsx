import { Navigate } from "react-router-dom"
import useAdminAuth from "../hooks/useAdminAuth"
import Loader from "./Loader"

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth()

  if (loading) return <Loader />
  if (!admin) return <Navigate to="/admin/login" replace />

  return children
}

export default AdminProtectedRoute
