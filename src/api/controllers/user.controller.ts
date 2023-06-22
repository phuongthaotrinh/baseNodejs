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


export const createTeacherAccount = useCatchAsync(async (req: Request, res: Response) => {
    
});

