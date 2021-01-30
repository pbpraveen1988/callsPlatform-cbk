const mongoose = require("mongoose");

let db;

exports.DBConnectMongoose = function () {
  return new Promise(function (resolve, reject) {
    mongoose.Promise = global.Promise;

    if (db) {
      return resolve(db);
    }
    // dev branch -> should add the mongo url 

    const mongo_uri = "mongodb://localhost:27017/Calls";
    mongoose
      .connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true,  useFindAndModify: false })
      .then(() => {
        db = mongoose.connection;
        console.log("mongo connection created");
        resolve(db);
      })
      .catch((error) => {
        console.log("ray : [tools db-connect] error => ", error);
        reject(error);
      });
  });
};
