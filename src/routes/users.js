const express = require("express");
import { forgotPassword, list, login, read, register, remove, update, updatePassword } from "../controllers/user.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", list);
router.get("/users/:id", read);
router.patch("/users/:id/updatte", update);
router.patch("/users/:id/remove", remove);
router.patch("/users/update_password", updatePassword);
router.post("/users/forgot_password", forgotPassword);

export default router;