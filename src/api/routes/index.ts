import express from "express";
import userRoute from "./user.route";
import authRoute from "./auth.route";



const router = express.Router();

const appRouters = [
	userRoute,
	authRoute
];


appRouters.forEach((route) => router.use(route));

export default router;