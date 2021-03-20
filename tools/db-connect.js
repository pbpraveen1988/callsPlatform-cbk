const mongoose = require("mongoose");
const { MongoClient } = require('mongodb');
const { RinglessDB, MYSQLDB } = require('../global/constants');
const { MYSQL_HOST, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DB } = require('../global/constants');
//const mysql = require('mysql');
const mysql = require('mysql2');
const PoolManager = require('mysql-connection-pool-manager');

let db;
let _db;

let mysqldbConnection;

exports.MYSQLDBConnect = function () {
  return new Promise(function (resolve, reject) {
    if (mysqldbConnection) {
      MYSQLDB(mysqldbConnection);
      return resolve(mysqldbConnection);
    }


    const mySql = {
      host: MYSQL_HOST,
      user: MYSQL_USERNAME,
      password: MYSQL_PASSWORD,
      database: MYSQL_DB,
    }

    // Pool manager settings
    const poolManager = {
      idleCheckInterval: 1000,
      maxConnextionTimeout: 30000,
      idlePoolTimeout: 3000,
      errorLimit: 5,
      preInitDelay: 50,
      sessionTimeout: 60000,
      mySQLSettings: mySql
    }

    const mySQLPool = PoolManager(poolManager);





    //   pool.query("SELECT field FROM atable", function(err, rows, fields) {
    //     // Connection is automatically released when query resolves
    //  })


    // var connection = mysql.createConnection({
    //   host: MYSQL_HOST,
    //   user: MYSQL_USERNAME,
    //   password: MYSQL_PASSWORD,
    //   database: MYSQL_DB
    // });
    //connection.connect();
    mysqldbConnection = mySQLPool;
    MYSQLDB(mySQLPool);
    return resolve(mySQLPool);
  })
}



exports.DBConnectMongoose = function () {
  return new Promise(function (resolve, reject) {
    mongoose.Promise = global.Promise;

    if (db && _db) {
      RinglessDB = _db;
      return resolve({ calls: db, ringless: _db });
    }
    // dev branch -> should add the mongo url 

    const mongo_uri = "mongodb://localhost:27017/Calls";
    const mongo_rm = "mongodb://127.0.0.1:27017/RinglessVM";
    const mongoDB = "RinglessVM";
    mongoose
      .connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
      .then(async () => {
        db = mongoose.connection;
        console.log("mongo connection created");
        // const _conn = await MongoClient.connect(mongo_rm, { useNewUrlParser: true, poolSize: 60 });
        // _db = _conn.db(mongoDB);
        // console.log("Ringless connection created");
        // RinglessDB(_db);
        resolve({ calls: db });

      })
      .catch((error) => {
        console.log("ray : [tools db-connect] error => ", error);
        reject(error);
      });
  });
};
