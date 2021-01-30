
const seeds = require("../database/seeds");
exports.seedAll = (req, res) => {

  // seed database
  const result = seeds.populate(req.query.password);
  return res.status(200).send(result);
};

exports.resetUser = async (req, res) => {
  const result = await seeds.resetUser(req.query.password);
  return res.status(200).send(result);
};

