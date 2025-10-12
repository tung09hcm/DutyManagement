import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { verifyOrgEditorRole } from "../middleware/verifyOrgEditorRole.js";
import { verifyTaskAssignment} from "../middleware/verifyTaskAssignment.middleware.js";
import {
    createTask,
    createPenalty,
    deletePenalty,
    getUserPenalties,
    submitTaskProof,
    updateTaskStatus
} from "../controllers/task.controller.js";

const router = express.Router();

// Tạo một task mới trong một tổ chức
router.post("/orgs/:orgId/tasks", protectRoute, verifyOrgEditorRole, createTask);

// Tạo penalty cho một user trong một task
router.post("/orgs/:orgId/tasks/:taskId/penalties", protectRoute, verifyOrgEditorRole, createPenalty);

// Xóa một penalty
router.delete("/orgs/:orgId/penalties/:penaltyId", protectRoute, verifyOrgEditorRole, deletePenalty);

// Lấy tất cả penalty của một user
router.get("/users/:userId/penalties", protectRoute, getUserPenalties);

// Người dùng được giao task nộp bằng chứng (ảnh)
router.put(
    "/tasks/:taskId/proof",
    protectRoute,
    verifyTaskAssignment, // Kiểm tra xem user có được giao task này không
    upload.single('proofImage'), // Dùng multer để xử lý file có tên là 'proofImage'
    submitTaskProof
);

// Admin/Collaborator cập nhật trạng thái task (hoàn thành / đã phạt)
router.patch(
    "/orgs/:orgId/tasks/:taskId/status",
    protectRoute,
    verifyOrgEditorRole, // Kiểm tra xem user có phải admin/collaborator của org không
    updateTaskStatus
);

export default router;