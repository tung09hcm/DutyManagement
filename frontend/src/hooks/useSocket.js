import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-toastify";

export const useTaskNotification = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("new_task", (task) => {
      console.log("Task mới:", task);
      toast.info(task.message);
      // dispatch thêm vào store nếu cần
    });

    return () => socket.off("new_task");
  }, [socket]);
};
