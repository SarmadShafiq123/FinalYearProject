const clearInvalidToken = () => {
  const token = localStorage.getItem("token")
  if (!token) return
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      localStorage.removeItem("token")
      return
    }
    const payload = JSON.parse(atob(parts[1]))
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token")
    }
  } catch {
    localStorage.removeItem("token")
  }
}

export const clearInvalidAdminToken = () => {
  const token = localStorage.getItem("adminToken")
  if (!token) return
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      localStorage.removeItem("adminToken")
      return
    }
    const payload = JSON.parse(atob(parts[1]))
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("adminToken")
    }
  } catch {
    localStorage.removeItem("adminToken")
  }
}

export default clearInvalidToken
