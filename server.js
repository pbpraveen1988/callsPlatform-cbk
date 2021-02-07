const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const fs = require('fs');
const cors = require("cors");
const passport = require("passport");
const dotenv = require("dotenv");
const compression = require("compression");
const path = require('path');

const db_connect = require("./tools/db-connect");
const { startCallsCronJob } = require("./crons");
const { PUBLIC_FOLDER_NAME } = require("./global/constants");


const app = express();
const SERVER_PORT = 3012;

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
dotenv.config();

db_connect
  .DBConnectMongoose()
  .then(() => {
    const routes = require("./routes");
    // passport for jwt authentication
    app.use(passport.initialize());
    require("./passport")(passport);

    // bodyParser, parses the request body to be a readable json format
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ limit: "10mb" }));
    app.use(logger('combined', { stream: accessLogStream }));
    

    app.use(compression());
    // app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(PUBLIC_FOLDER_NAME));

    const whitelist = ["*"];
    app.disable("x-powered-by");
    app.options(whitelist, cors());
    app.use(
      cors({
        credentials: true,
        origin(origin, callback) {
          callback(null, true);
        },
      })
    );
    app.get('/ui-logs-download', function(req, res){
      const file = `${__dirname}/access.log`;
      res.download(file); // Set disposition and send it.
    });

    app.get('/ccfuel-logs-download', function(req, res){
      const file = `${__dirname}/public/debug.log`;
      res.download(file); // Set disposition and send it.
    });


    routes.assignRoutes(app);
    app.listen(SERVER_PORT);
    console.log(`Server listening on port ` + SERVER_PORT);
  })
  .catch((err) => {
    console.log("Error: " + err);
  });
