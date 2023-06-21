import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import process from "process";
const path = require("path");

const options = {
  viewEngine: {
    extename: ".handlebars",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    },
    layoutsDir: __dirname + "/views/layouts/",
    defaultLayout: false,
    partialsDir: __dirname + "/views/layouts/"
  },
  viewPath: __dirname + "/views/layouts/",
  extName: '.handlebars'
}

const sendEmail = async (email, subject, text, url, orders) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: 587,
      securee: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      }
    });
    await new Promise((resolve, reject) => {
      // verify connection configuration
      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Server is ready to take our messages");
          resolve(success);
        }
      });
    });
    transporter.use("compile", hbs(options));
    const mailData = {
      from: "SunCinema",
      to: email,
      subject: subject,
      template: "main",
      attachments: orders ? [{
        filename: 'image.png',
        path: orders[0].qrCode,
        cid: 'unique@nodemailer.com' //same cid value as in the html img src
      }] : "",
      context: {
        text: text,
        header: subject,
        url: url,
        orders: orders
      }
    }
    await new Promise((resolve, reject) => {
      // send mail
      transporter.sendMail(mailData, (err, info) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(info);
          resolve(info);
        }
      });
    });
  } catch (error) {
    console.log(error)
  }
}
export default sendEmail;