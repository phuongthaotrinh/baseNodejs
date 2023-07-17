import bcrypt, { genSaltSync } from 'bcrypt';
import 'dotenv/config';
import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';
import mongooseAutoPopulate from 'mongoose-autopopulate';

import { TSoftDeleteUserModel, IUser, IUserDocument, UserGenderEnum, UserRoleEnum } from '../../types/user.type';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
const AdressSchema = new mongoose.Schema({
	name: { type: String },
	phone: { type: String },
	isMain: { type: Boolean, default: false },
	data: {
		province: { value: { type: String }, text: { type: String } },
		district: { value: { type: String }, text: { type: String } },
		ward: { value: { type: String }, text: { type: String } },
		desc: { type: String }
	}
});
const AvatarSchema = new mongoose.Schema({
	url: { type: String },
	uuid: { type: String }
});
const UserSchema = new mongoose.Schema<IUser>(
	{
		email: {
			type: String,
			trim: true,
			unique: true
		},
		phone: {
			type: String,
			require: true,
			unique: true
		},
		displayName: {
			type: String,
			require: true,
			trim: true
		},
		dob: {
			type: Date,
			require: true
		},
		address: [AdressSchema],
		gender: {
			type: String,
			require: true,
			enum: Object.values(UserGenderEnum)
		},
		images: [AvatarSchema],
		role: {
			type: String,
			trim: true,
			require: true,
			enum: Object.values(UserRoleEnum)
		},
		isVerified: {
			type: Boolean,
			default: false
		},
		employmentStatus: {
			type: Boolean,
			default: false
		},
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: { virtuals: true },
		autoIndex: true
	}
);
UserSchema.index({ displayName: 'text' });

UserSchema.virtual('userStatusText').get(function () {
	switch (true) {
		case this.isVerified === false:
			return 'Chưa kích hoạt';
		case this.employmentStatus && this.isVerified:
			return 'Đang sử dụng';
		case this.employmentStatus === false:
			return 'Đã khóa';
	}
});

UserSchema.methods.verifyPassword = function (password: string) {
	if (!password) return false;
	return bcrypt.compareSync(password, this.password);
};

UserSchema.pre('save', function (next) {
	if (this.password) {
		this.password = bcrypt.hashSync(this.password, genSaltSync(+process.env.SALT_ROUND!));
	}
	next();
});

UserSchema.plugin(mongooseDelete, {
	overrideMethods: ['find', 'findOne', 'findOneAndUpdate'],
	deletedAt: true
});
UserSchema.plugin(mongooseLeanVirtuals);
UserSchema.plugin(mongooseAutoPopulate);

const UserModel = mongoose.model<IUserDocument, TSoftDeleteUserModel>('Users', UserSchema);
UserModel.createIndexes()
  .then(() => {
    console.log('Indexes created successfully');
  })
  .catch((error) => {
    console.error('Error creating indexes:', error);
  });

export default UserModel;
