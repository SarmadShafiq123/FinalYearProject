import axiosInstance from "../utils/axiosInstance"

export const submitAccessRequest = async (data) => {
  const response = await axiosInstance.post("/api/requests", data)
  return response.data
}
