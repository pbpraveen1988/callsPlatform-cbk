const bcrypt = require("bcryptjs");
const { ObjectID } = require("bson");

exports.isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  );
};

exports.getUserInfo = (user) => {

  const userInfo = {
    id: user._id,
    name: user.name,
    avatar: user.avatar,
    email: user.email
  };

  return userInfo;
};

exports.generateRandomId = () => {
  return new ObjectID().toString();
};
