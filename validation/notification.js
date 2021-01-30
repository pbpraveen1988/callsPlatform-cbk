const Validator = require("validator");

exports.validateNotification = (data) => {
  let errors = [];

  if (Validator.isEmpty(data.message)) {
    errors = [...errors, "Message is required"];
  }

  if (Validator.isEmpty(data.type)) {
    errors = [...errors, "Type is required"];
  }

  if (Validator.isEmpty(data.accessRoleValues + "")) {
    errors = [...errors, "Access roles are required"];
  }

  return {
    errors,
    isValid: errors.length === 0,
  };
};
