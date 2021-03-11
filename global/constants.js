exports.LOCAL_URL = "http://localhost:3002";
exports.LOCAL_CALLBACK_URL = 'http://localhost:3012';
exports.CALLBACK_URL = "http://138.68.245.156:3012"
exports.PROD_URL = "http://138.68.245.156:3002";
exports.EXPIRE_TIME_LONG = "48h";
exports.EXPIRE_TIME_SHORT = "48h";
exports.LOGOUT_EVENT = "logout";
exports.EXPIRE_FORGOT_PASSWORD_EMAIL = 3600000; // ms
exports.SEED_PASSWORD = "$2a$10$9Lhg6hMiBNJ4FX9fenFJ6eQlUp2W9FDs75/3vCrMT.r9wO/1kKu1i";
exports.CRON_SCHEDULE_CALLS = '* * * * *';
exports.PUBLIC_FOLDER_NAME = "public";
exports.ASSET_FOLDER_PATH = "/assets/";
exports.AUDIO_FOLDER_PATH = '/audio/';
exports.LEAD_PHONENUMBER = "5094965534";
exports.CALLBACK_PATH = "/callback";
exports.MISSED_CALL_NUMBER = 3644440461; //2162134537;
// exports.API_KEY = "520a300c-140a-43e9-a54d-960bb9616669";     //dev 
exports.API_KEY = "734bdfd5-8f13-4cbb-a154-6cb7242a6dff "; //prod
exports.SMS_TOKEN = "e40d4b59-d003-437a-be9d-fc834486cb24";
exports.TELNYX_TOKEN = "KEY017428C01D4C703E58AE8E6605CB258C_djaPqOCFKcTrm49ROfo54e";
exports.VMDROP_URL = "http://159.203.146.215:50001/rvm";
//exports.ASTERISKSERVER_URL = "http://138.68.245.156:8400/api/sendVM/";


exports.TRUERINGLESS_URL = 'http://localhost:8400/api/';
exports.ASTERISKSERVER_URL = "http://localhost:8400/api/sendVM/";
exports.ASTERISKSERVER_URL_MULTIPLE = "http://localhost:8400/api/sendVM/multiple"
exports.TELNYX_URL = "https://api.telnyx.com/v2/number_lookup/";
exports.SMSDROP_URL = "https://broadcastnexus.com/api/sms";
//ccfuel
exports.CCFUEL_API_URL = "dev01.dev1.ccfuel.com:50001/rvm/";
exports.CCFUEL_API_KEY = "3afbf8e1-bcc8-48e4-882e-a4e8249cba92 ";

exports.CONNECT_EVENT = "connection";
exports.DISCONNECT_EVENT = "disconnect";
exports.unitCount = 5;

exports.MYSQL_HOST = '134.209.41.87';
exports.MYSQL_USERNAME = 'asteriskUser';
exports.MYSQL_PASSWORD = 'mySqlAsterisk@2021';
exports.MYSQL_DB = 'lrn_data';

// exports.MYSQL_HOST = 'localhost';
// exports.MYSQL_USERNAME = 'root';
// exports.MYSQL_PASSWORD = '123456';
// exports.MYSQL_DB = 'lrn_data';




let mysqlCon;
exports.MYSQLDB = (connection) => {
    if (mysqlCon) {
        return mysqlCon;
    } else {
        mysqlCon = connection;
        return mysqlCon;
    }
}

let dbConnection;
exports.RinglessDB = (dbvalues) => {
    if (dbConnection) {
        return dbConnection;
    } else {
        dbConnection = dbvalues;
        return dbConnection;
    }
}

