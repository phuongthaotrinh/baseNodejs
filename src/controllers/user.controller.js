const jwt = require('jsonwebtoken');
const validator = require('validator');

import User from "../models/users.model";
import sendEmail from "../utils/email"


export const register = async (req, res) => {
  try {
    const {email, name, password, phone } = req.body;
    const existEmail = await User.findOne({ email: email }).exec();
    const checkMail = validator.isEmail(email);

    if (existEmail) {
      return res.status(500).json({
        status: 500,
        message: "Email này đã tồn tại",
        object: null
      })
    };
  
    const newUser = await User(req.body).save();
    const accessToken = jwt.sign(newUser.toJSON(), process.env.ACCESS_TOKEN_SECRET);
    
    
    const message = `Đăng ký thành công, vui lòng truy cập vào đường link dưới đây để xác thực tài khoản: `;
    // await sendEmail(newUser.email, "Xác nhận tài khoản", message, `${process.env.CLIENT_URL_ONLINE}/verify?token=${accessToken}`);
    res.status(200).json({
      status: 200, 
      message: `Đăng ký thành công, vui lòng truy cập vào email ${email} để xác thực tài khoản`,
      object: newUser
    });

  } catch (error) {
    res.status(400).json({
      status: 400,
      message: "Đăng ký thất bại",
      object: error
    });
  }
}

export const login = async (req, res) => {
  try {
    const {email, password } = req.body;
    const existUser = await User.findOne({ email: email }).exec();

    if (!existUser) return res.status(400).json({
      status: 400,
      message: "Email không chính xác",
      object: null
    });
    if (!existUser.passwordAuthenticate(password)) return res.status(400).json({
      status: 400,
      message: "Mật khẩu bạn nhập không chính xác",
      object: null
    });

    if(existUser) {
      if(existUser.status === 0) {
          return res.status(400).json({
            status: 400,
            message: "Tài khoản chưa được kích hoạt, vui lòng vào email để xác nhận trước khi đăng nhập",
            object: null
          })
      }
      if(existUser.status === 2) {
        return res.status(400).json({
          status: 400,
          message: "Tài khoản chưa đã bị khóa, vui lòng liên hệ với QTV",
          object: null
        })
      }
    }
    
    const accessToken = jwt.sign(existUser.toJSON(), process.env.ACCESS_TOKEN_SECRET);
    existUser['password'] = null;
    existUser['phone'] = null;
    existUser['salt'] = null;

    res.status(200).json({
      status: 200, 
      message: "Đăng nhập thành công",
      object: {
         accessToken, 
         user: existUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: "Đăng nhập thất bại",
      object: error
    });
  }
}


export const list = async (req, res) => {
  const { status } = req.query;

  try {
    const {limit, skip} = req.query;
    const allUser = await User.find({})
                              .limit(limit)
                              .skip(skip)
                              .sort({createdAt: -1}).exec();

    const users = await User.find({status: status})
                            .limit(limit)
                            .skip(skip)
                            .sort({createdAt: -1}).exec();

    
    users.map((item) => {
      item.password = null,
      item.salt = null
    });


    res.status(200).json({
      status: 200, 
      message: "Lấy danh sách thành công",
      object: {
        users: status ? users : allUser,
        totalPage: status ? users.length : allUser.length,
        skip: skip,
        limit:limit,
        now: status ? users.length : allUser.length
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: "Lấy danh sách thất bại",
      object: error
    });
  }

}
export const read = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).exec();
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(400).json("Lấy danh sách thất bại");
  }

}

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.id });
  
    if (req.body.oldPassword) {
      if (!user.passwordAuthenticate(req.body.oldPassword)) return res.status(400).json({
        status: 400, 
        message: "Mật khẩu cũ của bạn nhập không đúng",
        object: null
      });
    }
    if (user.passwordAuthenticate(req.body.newPassword)) return res.status(400).json({
      status: 400, 
      message:"Mật khẩu mới không được trùng với mật khẩu cũ",
      object: null
    });
    const hashPassword = user.passwordEncode(req.body.newPassword);
    await User.findOneAndUpdate({ _id: user._id }, { password: hashPassword }, { new: true }).exec();
    user.password = null;
    res.status(200).json({
      status: 200, 
      message: "Đổi mật khẩu thành công",
      object: user
    });
  } catch (error) {
    res.status(500).json({
      status: 200, 
      message: "Đổi mật khẩu thất bại",
      object: error
    })
  }
}


export const update = async (req, res) => {
  const {id} = req.params
  try {
    if(!id) {
      res.status(400).json({
        status: 400,
        message: "Không tìm thấy người dùng",
        object: null
      })
    }

    const user = await User.findOneAndUpdate({ _id: id }, req.body, { new: true }).exec();
    res.status(200).json(
      {
        status: 200,
        message: "Cập nhật thành công",
        object: user
      }
    );
  } catch (error) {
    res.status(500).json({
      status: 200, 
      message: "Cập nhật thất bại",
      object: error
    })
  }
}


export const remove = async (req, res) => {
  const {id} = req.params
  try {
    if(!id) {
      res.status(400).json({
        status: 400,
        message: "Không tìm thấy người dùng",
        object: null
      })
    }

    const user = await User.findOneAndUpdate({ _id: req.params.id }, {status: 2}, { new: true }).exec();
    res.status(200).json(
      {
        status: 200,
        message: "Cập nhật thành công",
        object: user
      }
    );
  } catch (error) {
    res.status(500).json({
      status: 200, 
      message: "Cập nhật thất bại",
      object: error
    })
  }
}
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const existUser = await User.findOne({ email: email }).exec();
    const accessToken = jwt.sign(existUser.toJSON(), process.env.ACCESS_TOKEN_SECRET);
    const message = `Chào ${email}, vui lòng truy cập vào đường link dưới đây để đặt lại mật khẩu `;
    await sendEmail(email, "Reset Account Password", message, `${process.env.CLIENT_URL_ONLINE}/reset-password?token=${accessToken}`);
    res.status(200).json({ email, accessToken });
  } catch (error) {
    res.status(400).json(`Có lỗi xảy ra, vui lòng thử lại sau`);
  }
}