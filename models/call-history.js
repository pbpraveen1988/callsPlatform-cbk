const mongoose = require("mongoose");

const timestampPlugin = require('./timestamp');

const CallHistorySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },

  campaignId: {
    type: String,
    required: true,
  },

  uuid: {
    type: String,
  },

  number: {
    type: String,
  },
  
  carrier: {
    type: String,
  },

  number_type: {
    type: String,
  },

  status: {
    type: String,
    default: ""
  },

  error_message: {
    type: String,
    default: ""
  },

  drop_result: {
    type: String,
  },

  drop_message: {
    type: String,
  },

  drop_callerid: {
    type: String,
  },

  drop_timestamp: {
    type: Date,
  },
  timestamp: {
    type: Date,
  },
  
  external_id1: {
    type: String,
  },
  
  external_id2: {
    type: String,
  },
  
  external_id3: {
    type: String,
  },
  
  external_id4: {
    type: String,
  },
});


CallHistorySchema.statics.addCallHistory = async historyData => {
  let history = new CallHistory(historyData);
  return await history.save();
};

CallHistorySchema.statics.editCallHistoryByUuid = async historyData => {

  let history = await CallHistory.findOneAndUpdate(
    { uuid: historyData.uuid },
    { $set: historyData },
    { new: true }
  );
  return history;
};

CallHistorySchema.statics.editCallHistory = async historyData => {

  let history = await CallHistory.findOneAndUpdate(
    { _id: historyData._id },
    { $set: historyData },
    { new: true }
  );
  return history;
};

CallHistorySchema.statics.removeCallHistory = async _id => {
  return await CallHistory.findOneAndDelete({ _id });
};

CallHistorySchema.plugin(timestampPlugin);

const CallHistory = mongoose.model("callHistory", CallHistorySchema);
exports.CallHistory = CallHistory;
