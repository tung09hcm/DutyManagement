import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { verifyAdminRole } from "../middleware/verifyAdminRole.middleware.js";
import upload from "../middleware/upload.js"; // Middleware multer của bạn

import {
    createOrganization,
    generateInviteLink,
    joinOrganization,
    editUserRole,
    editOrganizationDetails,
    editOrganizationImages
} from "../controllers/organization.controller.js";

const router = express.Router();

// Bất kỳ user nào đã đăng nhập cũng có thể tạo tổ chức mới
router.post("/create", protectRoute, createOrganization);

// Bất kỳ user nào có token mời hợp lệ đều có thể tham gia
router.post("/join", protectRoute, joinOrganization);

// --- Các route sau đây yêu cầu quyền ADMIN của tổ chức ---

// Tạo link mời
router.post("/:orgId/invite", protectRoute, verifyAdminRole, generateInviteLink);

// Sửa vai trò của thành viên
router.put("/:orgId/members/:userId/role", protectRoute, verifyAdminRole, editUserRole);

// Sửa thông tin name, description
router.put("/:orgId/details", protectRoute, verifyAdminRole, editOrganizationDetails);

// Sửa ảnh avatar, background
router.put(
    "/:orgId/images", 
    protectRoute, 
    verifyAdminRole, 
    upload.fields([ // Dùng upload.fields để nhận nhiều loại file
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 1 }
    ]), 
    editOrganizationImages
);

// Kick một thành viên (yêu cầu quyền ADMIN)
router.delete("/:orgId/members/:userId", protectRoute, verifyAdminRole, kickMember);


export default router;