const Validator = require("validator");

const utils = require("../utils");

exports.validateLoginInput = (data) => {
  let errors = {};
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  return {
    errors,
    isValid: utils.isEmpty(errors),
  };
};

