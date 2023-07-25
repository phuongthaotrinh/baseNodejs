import { Model, ObjectId } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

export enum UserGenderEnum {
    MALE = 'Nam',
    FEMALE = 'Nữ'
}




export enum UserRoleEnum {
    USER = 'User',
    ADMIN = 'Admin'
}

export interface IAddress extends Document {
    name: string;
    phone: string;
    isMain: boolean;
    _id: string;
    address: {
        province: { key: string; value: string; children: string };
        district: { key: string; value: string; children: string };
        ward: { key: string; value: string; children: string };
        desc: string;
        _id: string | ObjectId
    };
}
export interface IAvatar extends Document {
    url: string,
    uuid: string
}

export interface IUser extends Document {
    _id: string | ObjectId;
    email: string;
    displayName: string;
    password?: string;
    address: Array<IAddress>;
    dob: Date;
    gender: UserGenderEnum;
    phone: string;
    role: UserRoleEnum;
    isVerified: boolean;
    images: Array<IAvatar> | any;
    employmentStatus: boolean;
    verifyPassword: (password: string) => boolean;
}

export interface IUserDocument extends IUser, Omit<SoftDeleteDocument, '_id'> { }
export type TUserModel = Model<IUserDocument>;
export type TSoftDeleteUserModel = SoftDeleteModel<IUserDocument, TUserModel>;
