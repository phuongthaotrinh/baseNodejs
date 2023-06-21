const crypto = require("crypto");
const mongoose  = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const mongoosePaginate = require('mongoose-paginate-v2');
import {nameValidator, phoneValidator} from "../validator/user"
import Address from "./address.model"

const userSchema = mongoose.Schema({
  fullname: { type: String },
  googleId: { type: String,unique: true },
  name: { type: String, validate: nameValidator },
  email: { type: String, required: true,unique: true,  },
  password: { type: String, required: true, minLength: [6, 'Must be at least 6, got {VALUE}'] },
  images: { type: Array },
  phone: {  type: String, validate:phoneValidator},
  address: { type: Array},
  gender: { type: Number, default: 0 },// 0 : nam, 1: nư
  role: { type: Number, default: 0 }, // 0 : user, 1: admin
  salt: { type: String },
  status: { type: Number, default: 0 }, // 0 : chưa kích hoạt | 1: đã kích hoạt | 2 : đang khóa
  dob: { type: Date }
}, { timestamps: true });

userSchema.methods = {
  passwordAuthenticate(password) {
    return this.password === this.passwordEncode(password);
  },
  passwordEncode(password) {
    if (!password) return
    try {
      return crypto.createHmac("sha256", this.salt).update(password).digest('hex');
    } catch (error) {
      console.log(error);
    }
  }
}

userSchema.pre("save", function (next) {
  this.salt = uuid.v4();
  this.password = this.passwordEncode(this.password);
  next();
});
userSchema.plugin(mongoosePaginate);
export default mongoose.model("User", userSchema)