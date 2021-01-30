"use strict";

const nodeMailer = require("nodemailer");

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465 port, false for other ports
  // TODO: * process.env is not working but the fallback is working
  auth: {
    user: process.env.SUPPORT_EMAIL || "feedback@thinkmelius.com",
    pass: process.env.SUPPORT_EMAIL_PASSWORD || "=h9Pj2>7",
  },
});

exports.sendResetPasswordMail = async (email, host, token) => {
  const mailOptions = {
    from: process.env.SUPPORT_EMAIL,
    to: email,
    subject: "Link to Reset Password",
    text:
      "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
      "Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n" +
      `${host}/reset-password/${token}\n\n` +
      "If you did not request this, please ignore this email and your password will remain unchanged.\n",
  };

  await transporter.sendMail(mailOptions);
};


exports.sendNewUserMail = async (email, username) => {
  const mailOptions = {
    from: process.env.SUPPORT_EMAIL,
    to: email,
    subject: "New User to Calls",
    text:
      "Welcome to our website.\n\n" +
      `Our team hope ${username} get more things from our website.\n\n` +
      "If you have a problem, please give us feedback.\n",
  };

  await transporter.sendMail(mailOptions);
};
