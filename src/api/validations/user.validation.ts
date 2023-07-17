import Joi from 'joi';
import { IUser, UserGenderEnum } from '../../types/user.type';

const addressSchema = {
		name: Joi.string().required(),
		phone: Joi.string().required(),
		data: Joi.object({
		  city: Joi.object({ value: Joi.number(), text: Joi.string() }).required(),
		  ward: Joi.object({ value: Joi.number(), text: Joi.string() }).required(),
		  street: Joi.object({ value: Joi.number(), text: Joi.string() }).required()
		})
	  
}
export const validateSigninData = (payload: Pick<IUser, 'phone' & 'password'>) => {
	const schema = Joi.object({
		phone: Joi.alternatives()
			.try(
				Joi.string()
					.lowercase()
					.email({
						minDomainSegments: 2,
						tlds: {
							allow: ['com']
						}
					}),
				Joi.string().alphanum().min(3).max(30)
			)
			.required()
			.error(new Error('Invalid email or userName')),

		password: Joi.string().min(6).max(32).required()
	});
	return schema.validate(payload);
};

export const validateNewUser = (payload: any) => {
	const schema = Joi.object({
		email: Joi.string()
			.email()
			.regex(/^[\w.+\-]+@gmail\.com$/)
			.required()
			.messages({
				'string.pattern.base': 'User email must be a valid Gmail address !'
			}),
		password: Joi.string().min(6).max(24),
		displayName: Joi.string().required(),
		phone: Joi.string().min(10).max(11).required(),
		dob: Joi.date().optional(),
		images: Joi.array().optional()
	});
	return schema.validate(payload);
};
  