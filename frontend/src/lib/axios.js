import axios from "axios";

const API_URL = import.meta.env.DEV
  ? "http://localhost:8443/api"
  : "https://dutymanagement-3.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Include credentials in requests
});
