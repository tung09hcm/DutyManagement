// src/context/SocketContext.jsx
import { createContext, useContext, useEffect } from "react";
import socket from "../socket/socket";
import { useAuthStore } from "../store/useAuthStore"; // ✅ dùng store thực tế của bạn

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { authUser } = useAuthStore(); // ✅ chỉnh tên theo store của bạn

  useEffect(() => {
    if (!authUser?.id) return;

    socket.connect();
    socket.emit("register", authUser.id);
    console.log("Socket registered for user:", authUser.id); // debug

    return () => {
      socket.disconnect();
    };
  }, [authUser?.id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
