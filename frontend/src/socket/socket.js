import { io } from "socket.io-client";

const socket = io("https://dutymanagement-3.onrender.com", {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
