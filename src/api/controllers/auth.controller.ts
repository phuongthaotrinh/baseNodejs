import 'dotenv/config';
import { Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import AppConfig from '../../configs/app.config';
import { HttpStatusCode } from '../../configs/statusCode.config';
import redisClient from '../../database/redis';
import formatPhoneNumber from '../../helpers/formatPhoneNumber';
import generateOtp from '../../helpers/otpGenerator';
import useCatchAsync from '../../helpers/useCatchAsync';
import { AuthRedisKeyPrefix } from '../../types/redis.type';
import { IUser, UserRoleEnum } from '../../types/user.type';
import '../auth/googlePassport';
import UserModel from '../models/user.model';
import sendSMS from '../services/sms.service';
import { changePassword } from '../services/user.service';

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


export const signinWithPhoneNumber = useCatchAsync(async (req: Request, res: Response) => {
	const user = req.user as Partial<IUser>;
	const accessToken = jwt.sign({ payload: user }, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '1h'
	});
	const refreshToken = jwt.sign({ payload: user }, process.env.REFRESH_TOKEN_SECRET!, {
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
		maxAge: 60 * 60 * 1000 * 24 * 365, // 30 days
		httpOnly: true
		// secure: false,
	});

	return res.status(HttpStatusCode.OK).json({
		user: req.user,
		accessToken: accessToken
	});
});


export const getUser = useCatchAsync(async (req: Request, res: Response) => {
	if (!req.profile) {
		throw createHttpError.NotFound(`Failed to get user's info`);
	}
	return res.status(HttpStatusCode.OK).json(req.profile);
});

export const refreshToken = useCatchAsync(async (req: Request, res: Response) => {
	/**
	 * check refresh token trong redis
	 * không tồn tại -> không cấp token mới
	 * ok -> decode token
	 */
	//
	const storedRefreshToken = await redisClient.get(AuthRedisKeyPrefix.REFRESH_TOKEN + req.cookies.uid);
	if (!storedRefreshToken) {
		throw createHttpError.BadRequest('Invalid refresh token!');
	}
	// decode token
	const decoded = jwt.verify(storedRefreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
	/**
	 * nếu ko có payload -> ko cấp token mới
	 * ok -> tạo token mới
	 */
	if (!decoded.payload) {
		throw createHttpError.Forbidden('Invalid token payload');
	}
	const newAccessToken = jwt.sign(decoded.payload, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '30m'
	});
	// Lưu lại token mới trong redis
	await redisClient.set(AuthRedisKeyPrefix.ACCESS_TOKEN + req.cookies.uid, newAccessToken, {
		EX: 60 * 60 // 1 hour
	});
	res.cookie('access_token', newAccessToken, {
		maxAge: 60 * 60 * 1000 * 24 * 365, // 1 day
		httpOnly: true
		// secure: false,
	});
	return res.status(HttpStatusCode.OK).json({
		refreshToken: newAccessToken,
		statusCode: HttpStatusCode.OK,
		message: 'ok'
	});
});

export const signout = useCatchAsync(async (req: Request, res: Response) => {
	const userRedisTokenKeys = {
		accessToken: AuthRedisKeyPrefix.ACCESS_TOKEN + req.profile._id,
		refreshToken: AuthRedisKeyPrefix.REFRESH_TOKEN + req.profile._id
	};
	const accessToken = await redisClient.get(userRedisTokenKeys.accessToken);

	if (!accessToken)
		return res.status(400).json({
			message: 'Failed to revoke token',
			statusCode: 400
		});
	// Delete user's access & refresh token in Redis
	await Promise.all([
		redisClient.del(userRedisTokenKeys.accessToken),
		redisClient.del(userRedisTokenKeys.refreshToken)
	]);
	// Reset all client's cookies
	req.logout((err) => {
		if (err) throw err;
	});
	res.clearCookie('access_token');
	res.clearCookie('uid');
	res.clearCookie('connect.sid', { path: '/' });

	return res.status(202).json({
		message: 'Signed out!',
		statusCode: 202
	});
});

export const verifyAccount = useCatchAsync(async (req: Request, res: Response) => {
	const token = req.query._token as string;
	if (!token) {
		throw createHttpError.Unauthorized('Access token must be provided!');
	}
	const { auth } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
	const updateUserData =
		req.query._role === UserRoleEnum.TEACHER ? { isVerified: true, employmentStatus: true } : { isVerified: true };
	await UserModel.findOneAndUpdate({ email: auth }, updateUserData, {
		new: true
	});
	res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com");
	res.setHeader('Cross-origin-Embedder-Policy', 'same-origin');
	res.setHeader('Access-Control-Allow-Origin', '*');
	return res.sendFile(path.resolve(path.join(__dirname, '../views/send-mail-response.html')));
});

export const sendOtp = useCatchAsync(async (req: Request, res: Response) => {
	const existedUser = await UserModel.findOne({ phone: req.body.phone });
	if (!existedUser) {
		throw createHttpError.NotFound(`User's phone number does not exist!`);
	}

	const otp = generateOtp();
	await redisClient.set(AuthRedisKeyPrefix.OTP_KEY + existedUser._id, otp, {
		EX: 60 * 60
	});
	console.log('OTP is ', otp);
	const response = await sendSMS({
		to: formatPhoneNumber(req.body.phone),
		text: `Mã xác thực của bạn là ${otp}`
	});
	if (!response) {
		throw createHttpError.InternalServerError('Failed to send sms!');
	}

	return res.status(HttpStatusCode.OK).json(response);
});

export const verifyUserByPhone = useCatchAsync(async (req: Request, res: Response) => {
	if (!req.body.verifyCode) {
		throw createHttpError.BadRequest('Verify code must be provided!');
	}
	const code = await redisClient.get(AuthRedisKeyPrefix.OTP_KEY + req.params.userId);
	if (!code) {
		throw createHttpError.Gone('Code is expired!');
	}
	if (req.body.verifyCode !== code) {
		return res.status(400).json({
			message: 'Incorrect verify code!',
			statusCode: 400
		});
	}
	const accessToken = jwt.sign({ payload: req.params.userId }, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '5m'
	});
	res.cookie('access_token', accessToken, { maxAge: 60 * 1000 * 5 });
	await redisClient.del(AuthRedisKeyPrefix.OTP_KEY + req.params.userId);

	return res.status(HttpStatusCode.OK).json({
		message: 'Ok',
		statusCode: HttpStatusCode.OK,
		data: {
			accessToken,
			isSuccess: true
		}
	});
});

export const resetPassword = useCatchAsync(async (req: Request, res: Response) => {
	if (!req.cookies.access_token) {
		throw createHttpError.Unauthorized('');
	}
	const decoded = jwt.verify(req.cookies.access_token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
	await changePassword(decoded.payload, req.body.newPassword);
	return res.status(HttpStatusCode.OK).json({
		message: 'Ok',
		statusCode: HttpStatusCode.OK
	});
});
