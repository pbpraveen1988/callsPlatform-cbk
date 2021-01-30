
const { SmsHistory } = require("../models/sms-history");
const { Sms } = require("../models/sms-campaign");

const { message } = require("../global/messages");


exports.getStatisticsSms = async (req, res) => {
  let totalSmsCompletedCount = 0;
  let failedCount = 0;
  let totalProcessingCount = 0;
  try {
    const totalData = await Sms.findOne({
      _id: req.query.selectedId,
    })

    const totalSmsCompleted = await SmsHistory.find(
      {
        smsId: req.query.selectedId,
        status: 'success',
      })

    totalSmsCompleted.forEach(async smsCompleted => {
      totalSmsCompletedCount = totalSmsCompletedCount + smsCompleted.numbersCount
    })

    const totalProcessingSms = await SmsHistory.find({
      smsId: req.query.selectedId,
    });
    totalProcessingSms.forEach(async totalProcessing => {
      totalProcessingCount = totalProcessingCount + totalProcessing.numbersCount
    })

    const failedSms = await SmsHistory.find(
      {
        smsId: req.query.selectedId,
        status: 'Failed',
      });
    failedSms.forEach(async failedSm => {
      failedCount = failedCount + failedSm.numbersCount
    })

    return res.status(200).json([
      {
        title: 'Successfully Completed',
        count: totalSmsCompletedCount,
        color: '#00c0ef'
      },
      {
        title: 'Processing',
        count: totalProcessingCount - totalSmsCompletedCount - failedCount,
        color: '#f39c12'
      },
      {
        title: 'Failed',
        count: failedCount,
        color: '#dd4b39'
      },
      {
        title: 'Pending',
        count: totalData && totalData.totalCount - failedCount - totalProcessingCount,
        color: '#00a65a'
      },
    ]);

  } catch (error) {
    console.log("gob: getCampaigns error", error);
    return res.status(500).json({
      message: message.SOMETHING_WENT_WRONG,
      error,
    });
  }
};