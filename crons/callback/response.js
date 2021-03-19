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
    // this._respTimer();
    console.log('RESPONSE TIMER STARTED');

  }

  async initDB() {
    const mongoUrl = 'mongodb://127.0.0.1:27017/RinglessVM';
    const mongoDBName = 'RinglessVM';
    this._conn = await MongoClient.connect(mongoUrl, { useNewUrlParser: true, poolSize: 10, useUnifiedTopology: true });
    this._db = this._conn.db(mongoDBName);
    RinglessDB(this._db);
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
    _newValue.error_message = dto.ErrorMessage ;
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

  _callbackTimer() {
    console.log('CALLBACK TIMER')
    if (this._callbackTimerObj) { return; }
    this._callbackTimerObj = setTimeout(async () => {
      try {
        const db = RinglessDB();
        if (!db) {
          this._callbackTimerObj = null;
          this._callbackTimer();
          return;
        }
        const tmrResps = await db.collection('responses').find({ SentToCallback: { $in: [null, false] }, callback_url: { $nin: [null] } }).limit(1000).toArray();
        console.log('CALLBACK Records Count', tmrResps && tmrResps.length);
        const tmrArr = [];
        if (tmrResps.length) {
          for (const tmr of tmrResps) {
            if (tmr.callback_url) {
              const pro = new Promise(async (resolve, reject) => {
                try {
                  const dto = tmr;
                  try {
                    logger.addContext('campaignId', 'CALLBACK_' + dto.CampaignId);
                  } catch (ex) {

                  }
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

                  dtoCopy.SentToCallback = true;
                  await db.collection('responses').replaceOne({ DropId: dtoCopy.DropId }, dtoCopy, { upsert: true });
                  await db.collection('responses_history').replaceOne({ DropId: dtoCopy.DropId }, dtoCopy, { upsert: true });
                  await db.collection('responses').deleteOne({ DropId: dto.DropId })
                  resolve();
                } catch (err) {
                  console.error('CALLBACK ERROR', err);
                  process.send({ action: 'debug', message: err.stack });
                  resolve();
                }
              });
              tmrArr.push(pro);
            }
            try {
              process.send({ action: 'debug', message: `Waiting for ${tmrArr.length} response records...` });
              await Promise.allSettled(tmrArr);
              process.send({ action: 'debug', message: `${tmrArr.length} Responses completed Sending...` });
            } catch (err) {
              process.send({ action: 'debug', message: err.stack });
            }
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

  _respTimer() {
    console.log('RESPTIMER STARTED');
    if (this._respTimerObj) { return; }
    this.respTimerObj = setTimeout(async () => {
      try {
        const tmrResps = await this._db.collection('responses').find({ SentToCallback: { $in: [null, false] }, callback_url: { $in: [null] } }).limit(250).toArray();
        if (tmrResps.length) {
          for (const tmr of tmrResps) {
            try {
              const dto = tmr;
              const dtoCopy = Object.assign({}, dto);
              delete dto._id;
              delete dto.CallId;
              delete dto.SentToCallback;
              delete dto.DateCreated;
              delete dto.StartDate;
              delete dto.EndDate;
              delete dto.Attempts;
              delete dto.TotalSeconds;


              dtoCopy.SentToCallback = true;
              await this._db.collection('responses_history').replaceOne({ DropId: dtoCopy.Dropid }, dtoCopy, { upsert: true });
              await this._db.collection('responses').deleteOne({ DropId: dto.DropId });
              await this._db.collection('responses').findOneAndUpdate(
                { DropId: dto.DropId, SentToCallback: { $in: [null, false] } },
                { $set: { SentToCallback: true } }
              );
            } catch (err) {
              process.send({ action: 'debug', message: err.stack });
            }
          }
        }
        this._respTimerObj = null;
        this._respTimer();
        return;
      } catch (err) {
        console.log('resp timer error ');
        process.send({ action: 'debug', message: err.stack });
        this._respTimerObj = null;
        this._respTimer();
        return;
      }
    }, 10 * 500);
  }




  _callbackTimer() {
    console.log('CALLBACK TIMER')
    if (this._callbackTimerObj) { return; }
    this._callbackTimerObj = setTimeout(async () => {
      try {
        const db = RinglessDB();
        if (!db) {
          this._callbackTimerObj = null;
          this._callbackTimer();
          return;
        }
        const tmrResps = await db.collection('responses').find({ SentToCallback: { $in: [null, false] }, callback_url: { $nin: [null] } }).limit(3500).toArray();
        console.log('CALLBACK Records Count', tmrResps && tmrResps.length);
        const tmrArr = [];
        if (tmrResps.length) {
          tmrResps.forEach(async tmr => {
            if (tmr.callback_url) {
             
              try {
                const dto = tmr;
                try {
                  console.log('CALLBACK Record drop id', dto.DropId);
                  logger.addContext('campaignId', 'CALLBACK_' + dto.CampaignId);
                } catch (ex) {

                }
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

                dtoCopy.SentToCallback = true;
                await db.collection('responses').replaceOne({ DropId: dtoCopy.DropId }, dtoCopy, { upsert: true });
                await db.collection('responses_history').replaceOne({ DropId: dtoCopy.DropId }, dtoCopy, { upsert: true });
                await db.collection('responses').deleteOne({ DropId: dto.DropId })
               
              } catch (err) {
                console.error('CALLBACK ERROR', err);
                process.send({ action: 'debug', message: err.stack });
               
              }
            }
          });
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
};

module.exports = RespHandler;


