import {create} from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from "react-hot-toast";

export const useUserStore = create((set) => ({
  users: [],
  isLoading: false,

  fetchUsers: async (orgId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/user/by-org/`+orgId);
      set({ users: res.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      set({ isLoading: false });
    }
  },
}));