import 'dotenv/config';
import { Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { HttpStatusCode } from '../../configs/statusCode.config';
import useCatchAsync from '../../helpers/useCatchAsync';
import { IUser, UserRoleEnum } from '../../types/user.type';
import getVerificationEmailTemplate from '../../helpers/verifyUserEmail';
import { sendVerificationEmail } from '../services/mail.service';
import * as UserService from '../services/user.service';
import { validateNewUser } from '../validations/user.validation';


export const createAdminAccount = useCatchAsync(async (req: Request, res: Response) => {
	const { error } = validateNewUser(req.body);
	if (error) {
		throw createHttpError.BadRequest(error.message);
	}
	const newUser = (await UserService.createUser({ ...req.body, role: UserRoleEnum.ADMIN })) as any;
	const token = jwt.sign({ auth: newUser.email }, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '7d'
	});
	const domain = req.protocol + '://' + req.get('host');
	await sendVerificationEmail({
		to: req.body.email,
		subject: 'Kích hoạt tài khoản đăng nhập hệ thống',
		template: getVerificationEmailTemplate({
			redirectDomain: domain,
			user: { ...req.body, role: UserRoleEnum.ADMIN },
			token
		})
	});
	
	return res.status(HttpStatusCode.CREATED).json(newUser);
});

export const createUserAccount = useCatchAsync(async (req: Request, res: Response) => {
	const { error } = validateNewUser(req.body);
	if (error) {
		throw createHttpError.BadRequest(error.message);
	}
	const newUser = (await UserService.createUser({ ...req.body, role: UserRoleEnum.USER })) as any;
	const token = jwt.sign({ auth: newUser.email }, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '7d'
	});
	const domain = req.protocol + '://' + req.get('host');
	await sendVerificationEmail({
		to: req.body.email,
		subject: 'Kích hoạt tài khoản đăng nhập hệ thống',
		template: getVerificationEmailTemplate({
			redirectDomain: domain,
			user: { ...req.body, role: UserRoleEnum.ADMIN },
			token
		})
	});
	
	return res.status(HttpStatusCode.CREATED).json(newUser);
});


export const getListUser  = useCatchAsync(async(req:Request, res: Response) => {
	let users = await UserService.getList();
	return res.status(HttpStatusCode.OK).json(users)
})