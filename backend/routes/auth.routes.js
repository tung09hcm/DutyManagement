import express from "express";
import { register, login, refresh, logout} from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/register",register);  //ok
router.post("/login", login);       //ok 
router.post("/refresh", refresh);   //ok

router.post("/logout", logout);     //ok
export default router;

