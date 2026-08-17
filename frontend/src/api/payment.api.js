import axiosInstance from "../utils/axiosInstance";

const createPaymentIntent = (data) =>
  axiosInstance.post("/requests/payment/create", data);

const confirmPayment = (data) =>
  axiosInstance.post("/requests/payment/confirm", data);

export { createPaymentIntent, confirmPayment };
