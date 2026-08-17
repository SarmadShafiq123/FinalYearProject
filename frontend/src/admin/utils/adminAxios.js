import axios from "axios"

const adminAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
})

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname.startsWith("/admin")
    ) {
      localStorage.removeItem("adminToken")
    }
    return Promise.reject(error)
  }
)

export default adminAxios
