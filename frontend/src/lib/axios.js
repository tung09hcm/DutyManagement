import axios from 'axios';
export const axiosInstance = axios.create({
  baseURL: 'https://dutymanagement-3.onrender.com/api',
  // baseURL: 'https://dutymanagement.onrender.com/api',
  withCredentials: true, // Include credentials in requests
});