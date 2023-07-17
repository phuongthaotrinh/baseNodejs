import userRoute from "./user.route";
import express from "express";


const router = express.Router();

const appRouters = [
	userRoute
];


appRouters.forEach((route) => router.use(route));

export default router;