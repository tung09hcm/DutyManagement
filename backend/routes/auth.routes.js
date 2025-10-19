import express from "express";
import { register, login, refresh, logout, checkAuth} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/register",register);  //ok
router.post("/login", login);       //ok 
router.post("/refresh", refresh);   //ok

router.post("/logout", logout);     //ok
router.get("/check", protectRoute, checkAuth);
export default router;

