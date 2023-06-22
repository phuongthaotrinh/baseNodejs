import express, { Router } from 'express';

const rootRouters: Array<Router> = [
	
];

const router = express.Router();

rootRouters.forEach((route) => {
	router.use(route);
});

export default router;