const Validator = require("validator");

const { isEmpty } = require("../utils");

module.exports = function validateResetPassword(data) {
  let errors = {};

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  if (Validator.isEmpty(data.passwordConfirm)) {
    errors.passwordConfirm = "Password confirm is required";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must have more than 6 chars";
  }

  if (!Validator.equals(data.password, data.passwordConfirm)) {
    errors.passwordConfirm = "Password and Confirm Password must match";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
