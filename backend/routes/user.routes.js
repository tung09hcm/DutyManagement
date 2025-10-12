import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {verifyOrgMembership} from "../middleware/verifyOrgMembership.middleware.js";
import { 
    editProfile, 
    editAvatarImage, 
    getUsersByOrg,
    getUserRoleInOrg,
    getUserById,
    searchUserByName,
    getUsersByTask
} from "../controllers/user.controller.js";
import upload from '../middleware/upload.js';

const router = express.Router();
router.put("/editProfile", protectRoute, editProfile);
router.put("/uploadAvatar", protectRoute, upload.single('avatar'), editAvatarImage);

router.get("/by-org/:orgId", protectRoute, verifyOrgMembership, getUsersByOrg);
router.get("/role-in-org/:orgId", protectRoute, verifyOrgMembership, getUserRoleInOrg);
router.get("/orgs/:orgId/tasks/:taskId/users", protectRoute, verifyOrgMembership, getUsersByTask);
router.get("/search/:name", protectRoute, searchUserByName);
router.get("/:userId", protectRoute, verifyOrgMembership, getUserById);


export default router;

