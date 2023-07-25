import express from "express";
import * as AuthController from "../controllers/auth.controller";

const router = express.Router();
router.post('/auth/signin-with-google', AuthController.signinWithGoogle)


export default router;