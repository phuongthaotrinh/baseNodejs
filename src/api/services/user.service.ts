import { genSaltSync, hashSync } from 'bcrypt';
import createHttpError from 'http-errors';
import removeVietnameseTones from '../../helpers/vnFullTextSearch';
import { IUser } from '../../types/user.type';
import UserModel from '../models/user.model';
import { UserRoleEnum } from './../../types/user.type';


export const createUser = async (payload: Partial<IUser> & Array<Partial<IUser>>) => {
	if (Array.isArray(payload) && payload.every((user) => user.role === UserRoleEnum.ADMIN)) {
		const hasExistedUser = await UserModel.exists({ email: { $in: payload.map((user) => user.email) } });
		if (hasExistedUser) throw createHttpError.Conflict('Admin account already existed!');
		return await UserModel.insertMany(payload);
	}
	// Add a new teacher user
	if (payload.role === UserRoleEnum.USER) {
		const existedClient = await UserModel.findOne({
			email: payload.email,
			role: UserRoleEnum.USER
		});
		if (existedClient) {
			throw createHttpError.BadRequest('Client account already existed!');
		}

		return await new UserModel(payload).save();
	}
};

// Users update them self account's info
export const updateUserInfo = async (authId: string, payload: Partial<IUser>) => {
	return await UserModel.findOneAndUpdate({ _id: authId }, payload, {
		new: true
	});
};
