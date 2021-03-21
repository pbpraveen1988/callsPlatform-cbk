const { ObjectID } = require('mongodb');
const axios = require('axios');
const moment = require('moment');
const log4js = require('log4js');
const logger = log4js.getLogger('Callback');
const { RinglessDB } = require('../../global/constants');
const { MongoClient } = require('mongodb');
class RespHandler {
  constructor() {
    this._respTimerObj = null;
    this._callbackTimerObj = null;
    this.initDB();
    this._callbackTimer();
    this.__updateRecords();
    this.needToUpdate = [];
    this.updateGoing = null;
    // this._respTimer();
    console.log('RESPONSE TIMER STARTED');
    this.selectedNumbers = [];
  }

  async initDB() {
    const mongoUrl = 'mongodb://127.0.0.1:27017/RinglessVM';
    const mongoDBName = 'RinglessVM';
    this._conn = await MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, poolSize: 400 });
    const db = this._conn.db(mongoDBName);
    RinglessDB(db);
  }


  getResponseValues(dto) {
    if (dto.Carrier) {
      switch (dto.Carrier) {
        case 'CINGULAR':
          dto.Carrier = 'att';
          break;
        case 'T-MOBILE':
          dto.Carrier = 'tmobile';
          break;
        case 'VERIZON':
          dto.Carrier = 'verizon'
          break;
      }
    }



    const _newValue = {};
    _newValue.uuid = dto.uuid;
    _newValue.carrier = dto.Carrier;
    _newValue.status = dto.isError ? 'failed' : 'success';
    _newValue.timestamp = new Date();
    _newValue.number = dto.PhoneTo;
    _newValue.drop_callerid = dto.PhoneFrom;
    _newValue.error_message = dto.ErrorMessage;
    if (_newValue.error_message != undefined && _newValue.error_message != '') {
      _newValue.status = 'failed';
    }
    _newValue.drop_method = dto.drop_method;
    _newValue.drop_result = dto.CallStatus;
    if (dto.CallStatus === 'completed') {
      _newValue.drop_result = 'success';
    } else {
      _newValue.drop_result = 'failed';
    }

    // if (_newValue.status === 'failed' && _newValue.carrier == 'UNSUPPORTED CARRIER') {
    //   _newValue.drop_message = 'VM Failure';
    // }

    _newValue.number_type = dto.number_type;
    _newValue.drop_timestamp = dto.DateAddedToQueue;
    _newValue.external_id1 = dto.external_id1;
    _newValue.external_id2 = dto.external_id2;
    _newValue.external_id3 = dto.external_id3;
    _newValue.external_id4 = dto.external_id4;
    _newValue.number_type = dto.number_type;
    return _newValue;
  }


  // CURRENTLY USING THIS FUNCTION FOR CALLBACK 
  _callbackTimer() {
    console.log('CALLBACK TIMER', moment().format("h:mm:ss a"))
    if (this._callbackTimerObj || this.updateGoing) { return; }
    this._callbackTimerObj = setTimeout(async () => {
      try {
        const tmrResps = await this._conn.db('RinglessVM').collection('responses').find({ DropId: { $nin: this.selectedNumbers }, SentToCallback: { $in: [null, false] }, callback_url: { $nin: [null, false] } }).limit(200).toArray();
        console.log('CALLBACK Records Count', tmrResps && tmrResps.length, this.selectedNumbers.length);
        const tmrArr = [];
        if (tmrResps && tmrResps.length) {
          tmrResps && tmrResps.forEach(async tmr => {
            if (tmr.callback_url) {
              this.selectedNumbers.push(tmr.DropId);
              const pro = new Promise(async (resolve, reject) => {
                try {
                  const dto = tmr;
                  try {
                    logger.addContext('campaignId', 'CALLBACK_' + dto.CampaignId);
                  } catch (ex) { }
                  const _callbackResponse = this.getResponseValues(dto);
                  const dtoCopy = Object.assign({}, dto);
                  delete dtoCopy._id;
                  delete dto._id;
                  delete dto.CallId;
                  delete dto.SentToCallback;
                  delete dto.DateCreated;
                  delete dto.StartDate;
                  delete dto.EndDate;
                  delete dto.Attempts;
                  delete dto.TotalSeconds;
                  axios.post(tmr.callback_url, _callbackResponse).catch(err => {
                    console.error(err);
                    logger.debug('ERROR ON CALLBACK', typeof (err) === 'object' ? JSON.stringify(err) : err);
                    return undefined;
                  });

                  try {
                    logger.debug('Success Request payload', typeof (_callbackResponse) === 'object' ? JSON.stringify(_callbackResponse) : _callbackResponse);
                  } catch (ex) {
                    logger.debug('SUCCESS ON CALLBACK', "ERROR ON CALLBACK LOG with payload", JSON.stringify(_callbackResponse));
                  }


                  // if (config.isDebugMode) { process.send({ action: 'debug', message: `DropId: ${dto.DropId} response sent to callbackUrl` }); }
                  dtoCopy.SentToCallback = true;
                  this.needToUpdate.push(dtoCopy);

                  resolve();
                } catch (err) {
                  console.error('CALLBACK ERROR', err);
                  process.send({ action: 'debug', message: err.stack });
                  // await session.commitTransaction();
                  resolve();
                }
              });
              tmrArr.push(pro);
            }
          });
          try {
            process.send({ action: 'debug', message: `Waiting for ${tmrArr.length} response records...` });
            Promise.allSettled(tmrArr);
            process.send({ action: 'debug', message: `${tmrArr.length} Responses completed Sending...` });
          } catch (err) {
            process.send({ action: 'debug', message: err.stack });
          }
        }

        this._callbackTimerObj = null;
        this._callbackTimer();
        return;
      } catch (err) {
        process.send({ action: 'debug', message: err.stack });
        this._callbackTimerObj = null;
        this._callbackTimer();
        return;
      }
    }, 1000);
  }

  async __updateRecords() {
    if (this.updateGoing) {
      return;
    }

    if (this.needToUpdate.length > 1000) {

      console.log('MORE THAN  1000');
      const selectedNumbers = [...this.selectedNumbers];
      const updatedNumber = [...this.needToUpdate];
      this.needToUpdate = [];
      this.selectedNumbers = [];

      this.updateGoing = true;
      const db = RinglessDB();
      await db.collection('responses').deleteMany({ DropId: { $in: selectedNumbers } });
      updatedNumber.forEach(async dtoCopy => {
        // await this._conn.db('RinglessVM').collection('responses').replaceOne({ DropId: dtoCopy.DropId }, dtoCopy, { upsert: true });
        await db.collection('responses_history').replaceOne({ DropId: dtoCopy.DropId }, dtoCopy, { upsert: true });
        //await this._conn.db('RinglessVM').collection('responses').deleteOne({ DropId: dto.DropId })
      });
      this.updateGoing = null;
      console.log('MAKING NULL');
      this._callbackTimer()
      this.__updateRecords();
    } else {
      this._callbackTimer()
      this.__updateRecords();
    }
  }




};

module.exports = RespHandler;


