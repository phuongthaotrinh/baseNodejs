import { genSaltSync, hashSync } from 'bcrypt';
import createHttpError from 'http-errors';
import removeVietnameseTones from '../../helpers/vnFullTextSearch';
import { IUser } from '../../types/user.type';
import UserModel from '../models/user.model';
import { UserRoleEnum } from './../../types/user.type';


export const createUser = async (payload: Partial<any> & Array<Partial<any>>) => {
	if (Array.isArray(payload) && payload.every((user) => user.role === UserRoleEnum.USER)) {
		const hasExistedUser = await UserModel.exists({ email: { $in: payload.map((user) => user.email) } });
		if (hasExistedUser) throw createHttpError.Conflict('User account already existed!');
		return await UserModel.insertMany(payload);
	}
	// Add a new admin user
	if (payload.role === UserRoleEnum.ADMIN) {
		const existedTeacher = await UserModel.findOne({
			email: payload.email,
			role: UserRoleEnum.ADMIN
		});
		if (existedTeacher) {
			throw createHttpError.BadRequest('Admin account already existed!');
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



export const getList = async() => {
	return await UserModel.find({}).exec()
}

export const changePassword = async (userId: string, newPassword: string) => {
	const encryptedNewPassword = hashSync(newPassword, genSaltSync(+process.env.SALT_ROUND!));

	return await UserModel.findOneAndUpdate({ _id: userId }, { password: encryptedNewPassword }, { new: true });
};