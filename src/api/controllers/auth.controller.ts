import "dotenv/config";
import useCatchAsync from '../../helpers/useCatchAsync';
import { Request, Response } from 'express';
import { IUser } from './../../types/user.type';
import AppConfig from './../../configs/app.config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import redisClient from './../../database/redis';
import { AuthRedisKeyPrefix } from '../../types/redis.type';


export const signinWithGoogle = useCatchAsync(async (req: Request, res: Response) => {
	const user = req.user as Partial<IUser>;
	if (!user) {
		return res.redirect(AppConfig.CLIENT_URL + '/signin');
	}
	const accessToken = jwt.sign({ payload: req.user }, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '1h'
	});

	const refreshToken = jwt.sign({ payload: req.user }, process.env.REFRESH_TOKEN_SECRET!, {
		expiresIn: '30d'
	});

	await Promise.all([
		redisClient.set(AuthRedisKeyPrefix.ACCESS_TOKEN + user._id, accessToken, {
			EX: 60 * 60 // 1 hour
		}),
		redisClient.set(AuthRedisKeyPrefix.REFRESH_TOKEN + user._id, refreshToken, {
			EX: 60 * 60 * 24 * 30 // 1 month
		})
	]);

	res.cookie('access_token', accessToken, {
		maxAge: 60 * 60 * 1000 * 24 * 365, // 1 day
		httpOnly: true
		// secure: false,
	});

	res.cookie('uid', user?._id?.toString().trim(), {
		maxAge: 60 * 60 * 1000 * 24 * 30, // 30 days
		httpOnly: true
		// secure: false,
	});

	return res.redirect(AppConfig.CLIENT_URL + '/signin/success');
});