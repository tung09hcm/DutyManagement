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
    getUsersByTask,
    getOrgByUserId
} from "../controllers/user.controller.js";
import upload from '../middleware/upload.js';

const router = express.Router();

router.get("/getOrgByUser", protectRoute, getOrgByUserId);
router.put("/editProfile", protectRoute, editProfile);                                              //ok
router.put("/uploadAvatar", protectRoute, upload.single('avatar'), editAvatarImage);                //ok

router.get("/by-org/:orgId", protectRoute, verifyOrgMembership, getUsersByOrg);                     //ok
router.get("/role-in-org/:orgId", protectRoute, verifyOrgMembership, getUserRoleInOrg);             //ok  
router.get("/orgs/:orgId/tasks/:taskId/users", protectRoute, verifyOrgMembership, getUsersByTask);
router.get("/search/:name", protectRoute, searchUserByName);                                        //ok
router.get("/:userId/:orgId", protectRoute, verifyOrgMembership, getUserById);                      //ok


export default router;

