const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');

const { Sms } = require('../models/sms-campaign');
const { SmsHistory } = require('../models/sms-history');
const { PUBLIC_FOLDER_NAME, ASSET_FOLDER_PATH, SMSDROP_URL, SMS_TOKEN, LOCAL_URL, PROD_URL } = require('../global/constants');
const { generateRandomId } = require('../utils');
const { unitCount } = require('../global/constants');

exports.runSmsCampagins = async timer => {
  console.log('Gobil==> cron job SMS Drop start count ', timer)
  const Smss = await Sms.find({ smsStatus: true });

  Smss.forEach(sms => {
    if (!sms.smsStatus || sms.isCalling ||
      !(new Date().getTime() > sms.smsStartDate.getTime() && new Date().getTime() < sms.smsEndDate.getTime())) {
      console.log('Gobil Time is up ===>', (new Date().getTime() > sms.smsStartDate.getTime() && new Date().getTime() < sms.smsEndDate.getTime()))
      Sms.editSms({
        _id: sms._id,
        smsStatus: false
      });
      return;
    }

    Sms.editSms({
      _id: sms._id,
      isCalling: true
    });
    let counter = 0;
    let numbers = [];
    // https://ourcodeworld.com/articles/read/278/how-to-split-an-array-into-chunks-of-the-same-size-easily-in-javascript
    fs.createReadStream(PUBLIC_FOLDER_NAME + ASSET_FOLDER_PATH + sms.csvFileName)
      .pipe(csv())
      .on('data', data => {
        if (counter++ >= sms.lastIndex && counter <= sms.lastIndex + sms.intervalMinute) {
          numbers.push(data[Object.keys(data)[0]]);
        }
      })
      .on('end', async () => {
        Sms.editSms({
          _id: sms._id,
          totalCount: counter
        });

        const numbersCollections = chunkArray(numbers, unitCount)
                // API call 
        numbersCollections.forEach(async numbersCollection => {
          const params = {
            numbers: numbersCollection,
            external_id: sms.smsCampaignName,
            initial_text: sms.initial_text,
            final_text: sms.final_text,
            confirm_text: sms.confirm_text
          };
          // console.log('Gobil: makeSMSDropRequest Params=>', params);
          await makeSMSDropRequest(params, sms._id, numbersCollection.length);
        });
        // API call 
        const lastIndex = (sms.lastIndex + sms.intervalMinute > counter) ? 0 : sms.lastIndex + sms.intervalMinute;
        if (sms.lastIndex + sms.intervalMinute > counter) {
          console.log("Gobil lstIndex Limit===>", (sms.lastIndex + sms.intervalMinute > counter))
          Sms.editSms({
            _id: sms._id,
            smsStatus: false,
            smsRepeatCount: sms.smsRepeatCount + 1
          });
        }
        Sms.editSms({
          _id: sms._id,
          lastIndex,
          isCalling: false
        });
      });
  });
}


const makeSMSDropRequest = async (params, smsId, numbersCount) => {
  axios.post(SMSDROP_URL, params,
    {
      headers: {
        'Authorization': `Bearer ${SMS_TOKEN}`
      }
    })
    .then(response => {
      console.log('Gobil: makeSMSDrop response=>', response.data);
      const history = {
        _id: generateRandomId(),
        smsId,
        numbersCount : numbersCount,
        error_message: response.data.error_message || response.data.message,
        status: response.data.status,
      };

      SmsHistory.addSmsHistory(history);
    })
    .catch(error => {
      const history = {
        _id: generateRandomId(),
        smsId,
        numbersCount : numbersCount,
        status: 'Failed',
      };
      SmsHistory.addSmsHistory(history);
      console.log('Gobil: make SMS Response error response', error.data);
    });
}

const chunkArray = (myArray, chunk_size) => {
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];

  for (index = 0; index < arrayLength; index += chunk_size) {
    myChunk = myArray.slice(index, index + chunk_size);
    tempArray.push(myChunk);
  }
 
  return tempArray;
}
