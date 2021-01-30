const multer = require('multer');
const path = require('path');
const fs = require('fs')

const utils = require("../utils");
const { Sms } = require("../models/sms-campaign");
const { message } = require("../global/messages");
const constants = require("../global/constants");
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

const storage = multer.diskStorage({
  destination: constants.PUBLIC_FOLDER_NAME + constants.ASSET_FOLDER_PATH,
  filename: function (req, file, cb) {
    cb(null, file.fieldname + utils.generateRandomId() + path.extname(file.originalname));
  }
});

const CSV_FILE_FIELD = "csv-file";

exports.uploadFiles = multer({
  storage: storage,
  limits: { fileSize: 9000000000 },
}).fields([{
  name: CSV_FILE_FIELD, maxCount: 1
}])

exports.getSmsCampaigns = async (req, res) => {
  try {
    const smsCampaigns = await Sms.find();
    return res.status(200).json(smsCampaigns);

  } catch (error) {
    console.log("gob: getCampaigns error", error);
    return res.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      error,
    });
  }
};

exports.uploadSms = async function (req, res, next) {
  try {
    const data = {
      CSV_FILE_FIELD: req.files[CSV_FILE_FIELD] && req.files[CSV_FILE_FIELD][0].filename,
    };

    return res.status(200).json(data);

  } catch (error) {
    console.log("gob : [campaign route exports.upload files] error => ", error);
    return res.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      error,
    });
  }
};

exports.addSmsCampaign = async (req, res) => {

  try {
    const smsData = {
      _id: utils.generateRandomId(),
      userId: req.body.userId,
      smsCampaignName: req.body.smsCampaignName,
      csvFileName: req.body.csvFileName,
      intervalMinute: req.body.intervalMinute,
      initial_text: req.body.initial_text,
      final_text: req.body.final_text,
      confirm_text: req.body.confirm_text,
      smsStartDate: req.body.smsStartDate,
      smsEndDate: req.body.smsEndDate
    }
    const sms = await Sms.addSms(smsData);
    return res.status(200).json(sms);
  }

  catch (error) {
    console.log("gob : [campaign route exports.addCampaign] error => ", error);
    return res.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      error,
    });
  }
};

exports.editSmsCampaign = async (req, res) => {
  try {
    const oldSms = await Sms.findOne({ _id: req.body._id })
    const fileDirectory = fs.realpathSync('public/assets');
    const sms = await Sms.editSms(req.body);

    if (req.body.csvFileName && oldSms.csvFileName !== req.body.csvFileName) {
      const csvFilePath = path.join(fileDirectory, oldSms.csvFileName);
      await unlinkAsync(csvFilePath);
    }

    return res.status(200).json(sms);
  } catch (error) {
    console.log("gob: editCampaign error", error);
    return res.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      error,
    });
  }
};

exports.deleteSmsCampaign = async (req, res) => {

  try {
    const sms = await Sms.findOne({ _id: req.query.id })
    const fileDirectory = fs.realpathSync('public/assets');
    await Sms.removeSms(req.query.id);

    if (sms.csvFileName) {
      const csvFilePath = path.join(fileDirectory, sms.csvFileName);
      await unlinkAsync(csvFilePath);
    }

    return res.status(200).json({ message: message.REMOVE_SUCCESS });

  } catch (error) {
    console.log("gob: deleteSms error", error);

    return res.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      error,
    });
  }
};


