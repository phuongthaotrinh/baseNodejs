import express from "express";
import * as  UserController from '../controllers/user.controller';

const router = express.Router();

router.post('/users/create-admin', UserController.createAdminAccount);
router.get('/users', UserController.getListUser);
export default router;
