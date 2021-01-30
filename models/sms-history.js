const mongoose = require("mongoose");

const timestampPlugin = require('./timestamp');

const SmsHistorySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  smsId: {
    type: String,
    required: true,
  },
  number: {
    type: String,
  },
  numbersCount : {
    type : Number
  },
  status: {
    type: String,
    default: ""
  },

  error_message: {
    type: String,
    default: ""
  },

  drop_message: {
    type: String,
  },

  timestamp: {
    type: Date,
  }
});


SmsHistorySchema.statics.addSmsHistory = async historyData => {
  let history = new SmsHistory(historyData);
  return await history.save();
};

SmsHistorySchema.statics.editSmsHistory = async historyData => {

  let history = await SmsHistory.findOneAndUpdate(
    { uuid: historyData.uuid },
    { $set: historyData },
    { new: true }
  );
  return history;
};

SmsHistorySchema.statics.removeSmsHistory = async _id => {
  return await SmsHistory.findOneAndDelete({ _id });
};

SmsHistorySchema.plugin(timestampPlugin);

const SmsHistory = mongoose.model("smsHistory", SmsHistorySchema);
exports.SmsHistory = SmsHistory;
