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
  createGroup: async(data) => {
    try {
      const res = await axiosInstance.post(`/org/create`,data);
      toast.success("Create Group Successfully");
      return res.data;
    } catch (error) {
      console.error("Error create group:", error);
      toast.error("Failed to create group");
    }
  },
  createInviteToken: async(orgId) => {
    try {
      const res = await axiosInstance.post(`/org/${orgId}/invite`);
      toast.success("Create Invite Token Successfully");
      return res.data;
    } catch (error) {
      console.log("Error create invite token", error);
      toast.error("Failed to create invite link");
    }
  },
  joinOrg: async(inviteToken) => {
    try {
      const data = {
        "inviteToken": inviteToken
      }
      const res = await axiosInstance.post(`/org/join`,data);
      toast.success("Join Successfully");
      return res.data;
    }
    catch (error) {
      console.log("Error join organization", error);
      toast.error("Failed to join organization via inviteToken");
    }
  }
}));