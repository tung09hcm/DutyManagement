import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useTaskStore = create((set) => ({
  tasks: [],
  evidence: "",
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
  addTask: async (data,orgId) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.post(`/tasks/${orgId}/tasks`,data);
      set({ tasks: res.data.tasks || [] });
      toast.success("Add Task Successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to Add tasks");
    } finally {
      set({ isLoading: false });
    }
  },
  submitTaskProof: async (orgId, taskId, file) => {
    try {
      if (!file) {
        toast.error("Please select an image first");
        return;
      }

      set({ isLoading: true });
      const formData = new FormData();
      formData.append("proofImage", file);

      const res = await axiosInstance.put(
        `/tasks/${orgId}/${taskId}/proof`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const updatedTask = res.data.task;
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === updatedTask.id ? updatedTask : t
        ),
      }));

      toast.success("Proof uploaded!");
      return updatedTask;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      set({ isLoading: false });
    }
  },
  applyPenalty: async(orgId, taskId, userIds, taskPenalty) => {
    try {
      set({ isLoading: true });
      const payload = {
        userIds,
        description: taskPenalty
      };
      // /:orgId/tasks/:taskId/penalties
      await axiosInstance.post(`/tasks/${orgId}/tasks/${taskId}/penalties`,payload);
      toast.success("Apply Penalty Successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Apply penalty failed");
    }finally {
      set({ isLoading: false });
    }
  },
  deleteTask: async(orgId, taskId) => {
    try{
      set({ isLoading: true });
      // /:orgId/tasks/:taskId/deleteTask
      await axiosInstance.delete(`/tasks/${orgId}/tasks/${taskId}/deleteTask`);
      toast.success("Delete task Successfully");
    }catch(error){
      console.error(error);
      toast.error(error.response?.data?.message || "Delete task failed");
    }
  },
  autoAssign: async(orgId,data) => {
    try{
      set({ isLoading: true });
      // /:orgId/tasks/autoAssign
      await axiosInstance.post(`/tasks/${orgId}/tasks/autoAssign`,data);
      toast.success("Auto assign tasks Successfully");
    }catch(error){
      console.error(error);
      toast.error(error.response?.data?.message || "Auto assign tasks failed");
    }
  },
  // fetchUserActivities: async(orgId) => {
  //   try{
  //     set({ isLoading: true });

  //     toast.success("Auto assign tasks Successfully");
  //   }catch(error){
  //     console.error(error);
  //     toast.error(error.response?.data?.message || "Auto assign tasks failed");
  //   }
  // }
}));
