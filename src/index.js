import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cloudinary from "cloudinary"
import multer from "multer"
import streamifier from "streamifier";
import jwt from "jsonwebtoken";
import path from "path";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
import cookieSession from "cookie-session";


import userRouter from "./routes/users";
import User from "./models/users.model";
import attributeRouter from "./routes/attribute";



dotenv.config({ path: __dirname + "/configs/settings.env" });
cloudinary.v2.config({
  cloud_name: "duongtaph13276",
  api_key: "831576174189758",
  api_secret: "myuzqZ6y2rWll-TVIT6LO2aS43w",
});
const fileUpload = multer();

const app = express();
app.use(morgan("tiny"));
app.use(express.json({ limit: "50mb" }));

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY]
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use('/docs', express.static(path.join(__dirname, 'docs')));

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser((id, done) => {
  User.findById({ _id: id }).then(user => done(null, user))
})

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://cinema-manager-vol3.vercel.app/auth/google/callback",
  passReqToCallback: true
},
  function (request, accessToken, refreshToken, profile, done) {
    if (profile.id) {
      User.findOne({ email: profile.emails[0].value }).then((existUser) => {
        if (existUser) {
          User.findOneAndUpdate({ _id: existUser._id }, { status: 1, googleId: profile.id, avatar: [profile.photos[0].value] }, { new: true }).then(user => done(null, user));
        } else {
          new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            fullname: profile.name.familyName + ' ' + profile.name.givenName,
            password: "no-password",
            avatar: [profile.photos[0].value],
            status: 1
          }).save().then(user => done(null, user));
        }
      })
    }
  }
));
app.get("/api/auth/google", passport.authenticate("google", {
  scope: ["email", "profile"]
}));
app.get("/auth/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL_ONLINE}/loading`);
  }
);

app.get('/api/current_user', (req, res) => {
  const accessToken = jwt.sign(req.user.toJSON(), process.env.ACCESS_TOKEN_SECRET);
  res.status(200).json({ user: req.user, accessToken });
});

// test commit jirra aasdasd
app.use("/api", userRouter);
app.use("/api", attributeRouter);





app.post("/api/upload/images", fileUpload.array("images", 8), function (req, res, next) {
  let streamUpload = (file) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.v2.uploader.upload_stream(
        (error, result) => {
          if (result) {
            resolve(result.secure_url)
          } else {
            reject(error)
          }
        }
      )
      streamifier.createReadStream(file.buffer).pipe(stream);
    });

  };
  async function upload(req) {
    try {
      const urls = [];
      const files = req.files;
      for (const file of files) {
        let result = await streamUpload(file);
        urls.push(result);
      }
      res.status(200).json(urls);
    } catch (error) {
      console.log(error)
    }
  }
  upload(req);
});
const swaggerJSDocs = YAML.load(__dirname + "/configs/api.yaml")
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJSDocs))

mongoose
  .connect(process.env.MONGODB_LOCAL)
  .then(() => console.log("Kết nối MongoDB thành công"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log("Hệ thống đang chạy trên cổng: ", PORT);
});
