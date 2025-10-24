import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { verifyOrgEditorRole } from "../middleware/verifyOrgEditorRole.middleware.js";
import { verifyTaskAssignment} from "../middleware/verifyTaskAssignment.middleware.js";
import {verifyOrgMembership} from "../middleware/verifyOrgMembership.middleware.js";
import {
    createTask,
    createPenalty,
    deletePenalty,
    getUserPenalties,
    submitTaskProof,
    updateTaskStatus,
    getTasksForThreeMonths
} from "../controllers/task.controller.js";
import upload from '../middleware/upload.js';


const router = express.Router();
router.get(
    "/:orgId/getTask",
    protectRoute,
    verifyOrgMembership,
    getTasksForThreeMonths
)
// Tạo một task mới trong một tổ chức
router.post("/:orgId/tasks", protectRoute, verifyOrgEditorRole, createTask);                        //ok

// Tạo penalty cho một user trong một task
router.post("/:orgId/tasks/:taskId/penalties", protectRoute, verifyOrgEditorRole, createPenalty);   //ok

// Xóa một penalty
router.delete("/:orgId/penalties/:penaltyId", protectRoute, verifyOrgEditorRole, deletePenalty);    //ok

// Lấy tất cả penalty của một user
router.get("/users/:userId/:orgId/penalties", protectRoute, verifyOrgMembership, verifyOrgEditorRole, getUserPenalties);//ok                            //ok

router.put(                                                                                               
    "/:orgId/:taskId/proof",
    protectRoute,
    verifyOrgMembership,
    verifyTaskAssignment, // Kiểm tra xem user có được giao task này không
    upload.single('proofImage'), // Dùng multer để xử lý file có tên là 'proofImage'
    submitTaskProof
);  //ok

// Admin/Collaborator cập nhật trạng thái task (hoàn thành / đã phạt)
router.patch(
    "/:orgId/tasks/:taskId/status",
    protectRoute,
    verifyOrgMembership,
    verifyOrgEditorRole, // Kiểm tra xem user có phải admin/collaborator của org không
    updateTaskStatus
);  //ok



export default router;