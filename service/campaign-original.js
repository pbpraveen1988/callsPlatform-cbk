const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');

const { Campaign } = require('../models/campaign');
const { CallHistory } = require('../models/call-history');
const { PUBLIC_FOLDER_NAME, ASSET_FOLDER_PATH, VMDROP_URL, API_KEY, LOCAL_URL, PROD_URL, CALLBACK_PATH } = require('../global/constants');
const { generateRandomId, isEmpty } = require('../utils');

const makeCampaignCallParams = (campaign, number) => {
  return {
    // audio_url: LOCAL_URL + ASSET_FOLDER_PATH + campaign.audioFileName, // TODO,hard coded
    audio_url: PROD_URL + ASSET_FOLDER_PATH + campaign.audioFileName,
    lead_phone: number,
    missed_call: campaign.missedCalls,
    missed_call_pool: campaign.missedCallPool,
    forward: campaign.callCenterNumber,
    // callback_url: LOCAL_URL + CALLBACK_PATH, //TODO, hard coded
    callback_url: PROD_URL + CALLBACK_PATH,
    external_id1: campaign.campaignName,
    external_id2: campaign._id,
    external_id3: "3",
    external_id4: new Date()
  };
};

exports.runCampagins = async timer => {
  console.log('Gobil==> cron job VM Drop start count ', timer)
  const campaigns = await Campaign.find({
    campaignStatus: true,
    isCalling: false
  });

  campaigns.forEach(async campaign => {
    // if first calling is not completed
    if (campaign.campaignRepeatCount <= 1) {
      // check date range
      if (!(new Date().getTime() > campaign.campaignStartDate.getTime() && new Date().getTime() < campaign.campaignEndDate.getTime())) {
        Campaign.editCampaign({
          _id: campaign._id,
          campaignStatus: false
        });
        return;
      }

      // set calling flag to true to prevent duplicated calling
      Campaign.editCampaign({
        _id: campaign._id,
        isCalling: true
      });

      // read numbers from csv
      let counter = 0;
      let numbers = [];

      fs.createReadStream(PUBLIC_FOLDER_NAME + ASSET_FOLDER_PATH + campaign.csvFileName)
        .pipe(csv())
        .on('data', data => {
          if (counter++ >= campaign.lastIndex && counter <= campaign.lastIndex + campaign.intervalMinute) {
            numbers.push(data[Object.keys(data)[0]]);
          }
        })
        .on('end', () => {
          console.log('Gobil numbers length ===> ', numbers.length)
          numbers.forEach(number => {
            const params = makeCampaignCallParams(campaign, number);
            makeVMDropRequest(params, campaign._id, number);
          });
          // update campaign
          const isCallCompleted = campaign.lastIndex + campaign.intervalMinute > counter ? true : false;
          Campaign.editCampaign({
            _id: campaign._id,
            totalCount: counter,
            lastIndex: isCallCompleted ? 0 : campaign.lastIndex + campaign.intervalMinute,
            isCalling: false,
            campaignStatus: !isCallCompleted,
            campaignRepeatCount: isCallCompleted ? campaign.campaignRepeatCount + 1 : campaign.campaignRepeatCount,
            lastCompletedCallDate: Date.now()
          });
        });
    } else {
      // set calling flag to true to prevent duplicated calling
      Campaign.editCampaign({
        _id: campaign._id,
        isCalling: true
      });
      const failedHistories = await CallHistory.find(
        {
          campaignId: campaign._id,
          status: 'Failed',
          createdAt: { $lt: campaign.lastCompletedCallDate }
        }).sort({ createdAt: -1 }).limit(campaign.intervalMinute); // REVIEW_CODE

      console.log('Gobil failedHistories==>', failedHistories)

      failedHistories.forEach(history => {
        const params = makeCampaignCallParams(campaign, history.number);
        makeVMDropRequestByHistory(params, campaign._id, history.number, history._id);
      });

      Campaign.editCampaign({
        _id: campaign._id,
        isCalling: false,
        campaignStatus: isEmpty(failedHistories) // REVIEW_CODE
      });
    }
  });
}

const makeVMDropRequest = async (params, campaignId, number) => {
  axios.post(VMDROP_URL + "/?apikey=" + API_KEY, params)
    .then(response => {
      console.log('Gobil: makeVMDropRequest response=>', response.data);
      const history = {
        _id: generateRandomId(),
        campaignId,
        uuid: response.data.uuid, // TODO
        number: response.data.number,
        number_type: response.data.number_type,
        error_message: response.data.error_message || response.data.message,
        status: response.data.status,
        carrier: response.data.carrier
      };
      CallHistory.addCallHistory(history);
    })
    .catch(error => {
      const history = {
        _id: generateRandomId(),
        campaignId,
        uuid: '', // TODO
        number: number,
        number_type: '',
        error_message: error,
        status: 'Failed',
        carrier: ''
      };
      CallHistory.addCallHistory(history);
      console.log('Gobil: makeVMDropRequest error response', error.data);
    });
}

const makeVMDropRequestByHistory = async (params, campaignId, number, historyId) => {
  axios.post(VMDROP_URL + "/?apikey=" + API_KEY, params)
    .then(response => {
      console.log('Gobil: makeReDialVMDropRequest response=>', response.data);
      const history = {
        _id: historyId,
        campaignId,
        uuid: response.data.uuid, // TODO
        number: response.data.number,
        number_type: response.data.number_type,
        error_message: response.data.error_message || response.data.message,
        status: response.data.status,
        carrier: response.data.carrier
      };
      CallHistory.editCallHistory(history);
    })
    .catch(error => {
      const history = {
        _id: history._id,
        timestamp: Date.now() // REVIEW_CODE
      };
      CallHistory.editCallHistory(history);
      console.log('Gobil: makeReDialVMDropRequest error response', error.data);
    });
}