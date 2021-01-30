
const cron = require('node-cron');
const { runCampagins } = require('../service/campaign-ccfuel');
const  {runSmsCampagins} = require ('../service/sms')
const constants = require('../global/constants');

const MAX_TIMER_VALUE = 100000;
let timer = 0;

const createCronJob = () => {
  return cron.schedule(constants.CRON_SCHEDULE_CALLS, async () => {
    try {
      // TEST_CODE
      await runCampagins(timer);
      await runSmsCampagins(timer);
      if (timer++ > MAX_TIMER_VALUE) {
        timer = 0;
      }
    } catch (error) {
      console.log('[ERROR]:cron-job Calls', error);
    }
  });
}

exports.startCallsCronJob = () => {
  const cronJob = createCronJob();
  cronJob.start();
};
