const mongoose = require("mongoose");

const timestampPlugin = require('./timestamp');

const SmsSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  userId: {
    type: String,
    required: true,
  },
  smsCampaignName: {
    type: String,
    required: true,
  },
  csvFileName: {
    type: String,
  },
  smsStatus: {
    type: Boolean,
    default: false,
  },
  intervalMinute: {
    type: Number,
    required: true,
  },
  initial_text: {
    type: String
  },
  external_id: {
    type: String,
  },
  numbers: [
    { type: String }
  ],
  final_text: {
    type: String,
  },
  confirm_text: [
    { type: String }
  ],
  lastIndex: {
    type: Number,
    default: 0
  },
  isCalling: {
    type: Boolean,
    default: false
  },
  totalCount: {
    type: Number,
    default: 0
  },
  smsStartDate: {
    type: Date,
  },
  smsEndDate: {
    type: Date,
  },
  smsRepeatCount :{
    type: Number,
    default: 1
  },
  smsDropStatus : {
    type: String,
  }
});

SmsSchema.statics.addSms = async smsData => {
  let sms = new Sms(smsData);
  sms = await sms.save();
  return sms;
};

SmsSchema.statics.editSms = async (smsData) => {

  let sms = await Sms.findOneAndUpdate(
    { _id: smsData._id },
    { $set: smsData },
    { new: true }
  );
  return sms;
};

SmsSchema.statics.removeSms = async (_id) => {
  return await Sms.findOneAndDelete({ _id });
};

SmsSchema.plugin(timestampPlugin);

const Sms = mongoose.model("sms", SmsSchema);
exports.Sms = Sms;
