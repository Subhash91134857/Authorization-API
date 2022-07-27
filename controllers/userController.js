const UserModal = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter=require('../config/emailConfig')
// const { isObjectIdOrHexString, default: mongoose } = require("mongoose");

module.exports = class Usercontroller {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await UserModal.findOne({ email: email });
    if (user) {
      res.send({ status: "failed", message: "Email already exists" });
    } else {
      if (name && email && password && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new UserModal({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            await doc.save();
            const saved_user = await UserModal.findOne({ email: email });

            // Generate JWT Token
            const Token = jwt.sign(
              { userId: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "2d" }
            );
            res.status(201).send({
              status: "success",
              message: "Registration Successful",
              token: { Token },
            });
          } catch (error) {
            console.log(error);
          }
        } else {
          res.send({
            status: "failed",
            message: "Password and Confirm Password doesn't match!",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required!" });
      }
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModal.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            // Generate token
            const Token = jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "2d" }
            );
            res.send({
              status: "Success",
              message: "login Success",
              token: Token,
            });
          } else {
            res.send({
              status: "failed",
              message: "Email or Passwprd is not valid",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You have not registered yet!",
          });
        }
      } else {
        res.send({
          status: "failed",
          message: "All fields are required!",
        });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable To Login" });
    }
  };
  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message: "Password and Password_confirmation doesn't match!",
        });
      } else {
        // crypting
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        await UserModal.findByIdAndUpdate(req.user._id, {
          $set: { password: hashPassword },
        });
        res.send({
          status: "success",
          message: "Password Change Successfully",
        });
      }
    } else {
      res.send({
        status: "failed",
        message: "All fields are required!",
      });
    }
  };
  static logedUser = async (req, res) => {
    res.send({ user: req.user });
  };
  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await UserModal.findOne({ email: email });
      if (user && user !== null) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        // Generating seperate token for link:
        const token = jwt.sign({ userId: user._id }, secret, {
          expiresIn: "15m",
        });
        console.log(token);
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
        // The above link is from front-end
        /* /api/user/reset/:id/:token */
        // Sending EMail
        let info = await transporter.sendMail({
          from:"Subhashpanday91134857@gmail.com",
          to: user.email,
          subject: "APP password reset link",
          html:`<a href="${link}">Click here to reset your password</a>`
        })
        console.log(link);
        res.send({ status: "Success", message: `Link has send  ${info.response}` });
      } else {
        res.send({ status: "failed", message: "Email is not registered!" });
      }
    } else {
      res.send({ status: "failed", message: "Email field is required" });
    }
  };
  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    console.log(token);
    console.log(id);
    const user = await UserModal.findById(id);
    console.log(user._id,user.email)
    console.log(user._id);
    const new_Secret = user._id + process.env.JWT_SECRET_KEY;
    // const newToken=jwt.sign({ userId: user._id }, new_Secret, {
    //       expiresIn: "10s",
    // });
    console.log(newToken)
    try {
      jwt.verify(token, new_Secret);
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          res.send({
            status: "failed",
            message: "New Password and New Confirm Password doesn't match!",
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          await UserModal.findByIdAndUpdate(user._id, {
            $set: { password: newHashPassword },
          });
          res.send({
            status: "Success",
            message: "Password Changed Successfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required!" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Invalid token" });
    }
  };
};
