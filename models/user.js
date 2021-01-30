const mongoose = require("mongoose");

const constants = require("../global/constants");

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  loggedLastTime: {
    type: Date,
    default: null,
  }
});

UserSchema.statics.addUser = async (userData) => {
  let user = new User(userData);
  user = await user.save();
  return user;
};

UserSchema.statics.editUser = async (userData) => {
  const user = await User.findOneAndUpdate(
    { _id: userData._id },
    { $set: userData },
    { new: true }
  );
  return user;
};

UserSchema.statics.removeUser = async (_id) => {
  const user = await User.findOneAndDelete({ _id });
  return user;
};

UserSchema.statics.removeManyUsers = async (ids) => {
  const result = await User.deleteMany({ _id: ids });
  return result;
};

UserSchema.statics.getUsers = async () => {
  const users = await User.find();
  return users.map((user, index) => {
    return user;
  });
};

UserSchema.statics.getPageUsers = async (
  countPerPage,
  pageNumber,
  searchQuery
) => {
  let regexp = searchQuery && new RegExp(searchQuery, "i");
  const pageUsers = await User.find(
    searchQuery
      ? {
        $or: [{ name: { $regex: regexp } }, { email: { $regex: regexp } }],
      }
      : {}
  )
    .skip(countPerPage * pageNumber - countPerPage)
    .limit(countPerPage);
  const countOfAllUsers = await User.countDocuments(
    searchQuery
      ? {
        $or: [{ name: { $regex: regexp } }, { email: { $regex: regexp } }],
      }
      : {}
  );
  const countOfPages = Math.ceil(countOfAllUsers / countPerPage);

  const result = { pageUsers, pageNumber, countOfPages, countOfAllUsers };
  return result;
};

// TODO: * is it users or user
const User = mongoose.model("users", UserSchema);
exports.User = User;
