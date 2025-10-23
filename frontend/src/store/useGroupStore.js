import {create} from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from "react-hot-toast";

export const useGroupStore = create((set) => ({
  groups: [],
  isLoading: false,

  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/user/getOrgByUser`);
      set({ groups: res.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
      set({ isLoading: false });
    }
  },
}));