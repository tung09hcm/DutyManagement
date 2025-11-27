import axios from 'axios';
export const axiosInstance = axios.create({
  // baseURL: 'http://localhost:3030/api',
  baseURL: 'https://dutymanagement.onrender.com/api',
  withCredentials: true, // Include credentials in requests
});