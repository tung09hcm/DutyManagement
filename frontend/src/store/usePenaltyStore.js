import {create} from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from "react-hot-toast";
export const usePenaltyStore = create((set) => ({
    penalties: [],
    fetchPenalties: async (orgId) => {
        console.log("🔹 Fetching penalties for org:", orgId);
        try {
            set({ isLoading: true });
            const res = await axiosInstance.get(`/tasks/${orgId}/penalties`);
            set({ penalties: res.data.penalties || [] });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to load penalties");
        } finally {
            set({ isLoading: false });
        }
    },
}));