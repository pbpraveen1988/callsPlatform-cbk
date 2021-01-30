
const mongoose = require("mongoose");

const timestampPlugin = require('./timestamp');

const CampaignSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  userId: {
    type: String,
    required: true,
  },
  campaignName: {
    type: String,
    required: true,
  },
  csvFileName: {
    type: String,
  },
  audioFileName: {
    type: String,
  },
  intervalMinute: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
  },
  campaignStatus: {
    type: Boolean,
    default: false,
  },
  callCenterNumber: {
    type: Number,
  },
  missedCalls: {
    type: Boolean,
    default: true,
  },
  missedCallPool: {
    type: String,
  },
  campaignStartDate: {
    type: Date,
  },
  campaignEndDate: {
    type: Date,
  },
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
  campaignRepeatCount: {
    type: Number,
    default: 1
  },
  lastCompletedCallDate: {
    type: Date
  },
  ccfuelAPI: {
    type: Boolean,
    default: true
  },
  leadPhoneNumber: {
    type: Number,
  },
  responseIndex: {
    type: Number,
    default: 0
  }
});

CampaignSchema.statics.addCampaign = async campaignData => {
  let campaign = new Campaign(campaignData);
  campaign = await campaign.save();
  return campaign;
};

CampaignSchema.statics.editCampaign = async (campaignData) => {

  let campaign = await Campaign.findOneAndUpdate(
    { _id: campaignData._id },
    { $set: campaignData },
    { new: true }
  );
  return campaign;
};

CampaignSchema.statics.removeCampaign = async (_id) => {
  return await Campaign.findOneAndDelete({ _id });
};

CampaignSchema.plugin(timestampPlugin);

const Campaign = mongoose.model("campaign", CampaignSchema);
exports.Campaign = Campaign;
