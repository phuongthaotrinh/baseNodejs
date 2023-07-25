import express from 'express';
import passport from 'passport';
import {getUser, refreshToken,resetPassword, sendOtp, signinWithGoogle, signinWithPhoneNumber, signout, verifyAccount, verifyUserByPhone}  from '../controllers/auth.controller';
import AppConfig from '../../configs/app.config';
// import  } from '../middlewares/authGuard.middleware';

const router = express.Router();
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: `${AppConfig.CLIENT_URL}/signin` }), signinWithGoogle);
router.get('/auth/signout', signout);
router.get('/auth/user', getUser);
router.get('/auth/verify-account', verifyAccount);
router.get('/auth/refresh-token', refreshToken);
router.post('/auth/send-otp', sendOtp);

export default router;