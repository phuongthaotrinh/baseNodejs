import express from "express";
import { createAdminAccount, getListUser } from '../controllers/user.controller';

const router = express.Router();

router.post('/users', createAdminAccount);
router.get('/users', getListUser);
export default router;
