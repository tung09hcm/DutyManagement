import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useTaskStore = create((set) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async (orgId) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.get(`/tasks/${orgId}/getTask`);
      set({ tasks: res.data.tasks || [] });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      set({ isLoading: false });
    }
  },
}));
