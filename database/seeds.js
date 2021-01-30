
const bcrypt = require('bcrypt');

const { message } = require("../global/messages");
const { User } = require("../models/user");

const constants = require("../global/constants");

// RE: for generating hashed password
//const hash = bcrypt.hashSync("", bcrypt.genSaltSync(10));
//console.log(hash);

const checkBackDoorPassword = password => {
  return password && bcrypt.compareSync(password, constants.SEED_PASSWORD);
}

const password = "$2a$10$9Lhg6hMiBNJ4FX9fenFJ6eQlUp2W9FDs75/3vCrMT.r9wO/1kKu1i"; // hash('123456');
const users = [
  {
    _id: "u00000000000000000000001",
    name: "admin",
    email: "admin@calls.com",
    password: password,
    verified: true,
  },
  {
    _id: "u00000000000000000000002",
    name: "chart admin",
    email: "chartadmin@calls.com",
    password: password,
    verified: true,
  },
  {
    _id: "u00000000000000000000003",
    name: "Signal Provider1",
    email: "provider1@calls.com",
    password: password,
    verified: true,
  },
  {
    _id: "u00000000000000000000004",
    name: "user1",
    email: "user1@calls.com",
    password: password,
    verified: true,
  },
  {
    _id: "u00000000000000000000005",
    name: "schedule admin",
    email: "schedule1@calls.com",
    password: password,
    verified: true,
  },
];

exports.populate = async password => {
  if (!checkBackDoorPassword(password)) {
    return { message: message.AUTH_INCORRECT_PASSWORD }
  }
  
  for (user of users) {
    User.addUser(user).catch((error) => {
      console.log(error);
    });
  }


  return { message: message.SEED_SUCCESS };
};

exports.resetUser = async password => {
  if (!checkBackDoorPassword(password)) {
    return { message: message.AUTH_INCORRECT_PASSWORD }
  }

  await User.deleteMany();

  for (user of users) {
    await User.addUser(user).catch((error) => {
      console.log(error);
    });
  }

  return { message: message.SEED_SUCCESS };
};
