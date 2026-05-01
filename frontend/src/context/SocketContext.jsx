import { createContext, useContext, useEffect } from "react";
import socket from "../socket/socket";
import { useSelector } from "react-redux"; // hoặc context auth của bạn

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const currentUser = useSelector((state) => state.auth.user); // chỉnh theo store của bạn

  useEffect(() => {
    if (!currentUser?.id) return;

    // ✅ Connect và đăng ký userId
    socket.connect();
    socket.emit("register", currentUser.id);

    return () => {
      socket.disconnect(); // Logout hoặc unmount thì ngắt
    };
  }, [currentUser?.id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
