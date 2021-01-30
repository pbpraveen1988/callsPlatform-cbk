const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const validateRegisterInput = require("../validation/register");
const {
  validateLoginInput
} = require("../validation/login");
const { User } = require("../models/user");

const utils = require("../utils");

const { message } = require("../global/messages");
const constants = require("../global/constants");

exports.register = async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  const { name, email, password } = req.body;
  // check input validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  // check if already exists
  const registeredUser = await User.findOne({
    email: {
      $regex: new RegExp("^" + req.body.email.toLowerCase() + "$", "i"),
    },
  });
  if (registeredUser) {
    return res.status(400).json({
      email: "Email already exists",
    });
  }
  const avatar = gravatar.url(req.body.email, {
    s: "200",
    r: "pg",
    d: "mm",
  });

  const token = crypto.randomBytes(20).toString("hex");
  const newUser = new User({
    _id: utils.generateRandomId(),
    name,
    email,
    password,
    avatar,
    verified: true,
    resetPasswordToken: token,
  });

  try {
    const salt = await bcrypt.genSalt(10);
    if (!salt) {
      console.error("bcrypt genSalt error", err);
    } else {
      const hash = await bcrypt.hash(newUser.password, salt);
      if (!hash) {
        console.error("bcrypt hash error", err);
      } else {
        newUser.password = hash;
        const user = await newUser.save();
        if (user) {
          res.status(200).json(user);
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      error
    });
  }
};

exports.login = async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  const { email, password } = req.body;
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const getToken = (userInfo) => {
    const token = jwt.sign(userInfo, "secret", {
      expiresIn: constants.EXPIRE_TIME_LONG
    });
    return token;
  };

  try {
    let user = await User.findOne({
      email: {
        $regex: new RegExp("^" + email.toLowerCase() + "$", "i"),
      },
    });

    if (!user) {
      errors.email = message.AUTH_USER_NOT_FOUND;
      return res.status(404).json(errors);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const userInfo = utils.getUserInfo(user);
      const token = getToken(userInfo);
      const time = Date.now();
      const id = user._id;

      User.findByIdAndUpdate(
        id,
        { loggedLastTime: time },
        { new: true },
        (err, model) => {
          console.log("update result: ", err, model);
        }
      );

      return res.json({
        id: user._id,
        success: true,
        token: `Bearer ${token}`,
      });
    } else {
      errors.password = message.AUTH_INCORRECT_PASSWORD;
      return res.status(400).json(errors);
    }
  } catch (error) {
    console.log("ray : [auth route login] error => ", error);
    return res.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      error
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email, host } = req.body;
  let errors = {};
  const user = await User.findOne({
    email: { $regex: new RegExp("^" + email.toLowerCase() + "$", "i") },
    verified: true,
  });
  if (!user) {
    errors.email = message.AUTH_USER_NOT_FOUND;
    return res.status(404).json(errors);
  }
  const token = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + constants.EXPIRE_FORGOT_PASSWORD_EMAIL;
  try {
    await user.save();
    await sendResetPasswordMail(email, host, token);
  } catch (error) {
    console.log("dav : [auth routes exports.forgotPassword] error => ", error);
    return res.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      error
    });
  }

  return res
    .status(200)
    .json({ message: message.AUTH_PASSWORD_RESET_EMAIL_SENT, success: true });
};

exports.me = (req, res) => {
  return res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
};
