import 'dotenv/config';
import passport from 'passport';
import UserModel from '../models/user.model';
const GoogleStrategy = require('passport-google-oauth20').Strategy;

function findUserByEmail(email) {
    return UserModel.findOne({ email: email }).exec();
}

// Cấu hình Passport.js
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: '/api/auth/google/callback',
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, profile, done) {
            findUserByEmail(profile?.email[0].value)
                .then((user) => {
                    if (user) {
                        done(null, user);
                    }
                    else {
                        done(null, false);
                    }
                })
                .catch(err => {
                    done(err)
                })
        }
    )
);

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user!));