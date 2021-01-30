
const { CallHistory } = require("../models/call-history");
const { Campaign } = require("../models/campaign");

const { message } = require("../global/messages");

exports.getStatisticsCall = async (req, res) => {
  try {
   
    const totalData = await Campaign.findOne({
      _id: req.query.selectedId,
      createdAt: {
        $gte: new Date(req.query.startDate),
        $lt: new Date(req.query.endDate)
      }
    })
    
    const _totalCallHistory = await (await CallHistory.find(
      {
        campaignId: req.query.selectedId,
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lt: new Date(req.query.endDate)
        }
      }));
    

    const totalCallsCompletedCount = await (await CallHistory.find(
      {
        campaignId: req.query.selectedId,
        status: { $in: ['Success', 'success'] },
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lt: new Date(req.query.endDate)
        }
      })).length;

    //const totalCallsCompletedCount = _totalCallHistory.filter(x => x.status === 'Success' || x.status === 'status').length;

    const totalProcessingCount = await (
      await CallHistory.find({
        campaignId: req.query.selectedId,
        status: { $in: ['Success', 'success'] },
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lt: new Date(req.query.endDate)
        }
      })).length;

     
    const totalPendingCount = await (
      await CallHistory.find({
        campaignId: req.query.selectedId,
        status: { $in: ['Pending', 'pending'] },
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lt: new Date(req.query.endDate)
        }
      })).length;
    // const totalPendingCount = _totalCallHistory.filter(x => x.status === 'Pending' || x.status === 'pending').length;




    const failedCount = await (await CallHistory.find(
      {
        campaignId: req.query.selectedId,
        status: 'Failed',
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lt: new Date(req.query.endDate)
        }
      })).length;

    //const failedCount = _totalCallHistory.filter(x => x.status === 'Failed').length;



    const dropFailedCount = await (await CallHistory.find(
      {
        campaignId: req.query.selectedId,
        drop_result: 'failed',
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lt: new Date(req.query.endDate)
        }
      })).length;
    //const dropFailedCount = _totalCallHistory.filter(x => x.status === 'failed').length;
    let _lastindex = 0;
    if (totalData && totalData.lastIndex) {
      _lastindex = totalData.lastIndex;
    }

    return res.status(200).json([
      {
        title: 'Successfully Completed',
        count: totalCallsCompletedCount,
        color: '#00c0ef'
      },
      {
        title: 'Processing',
        // count: (totalProcessingCount - totalCallsCompletedCount - dropFailedCount) < 0
        //   ? 0
        //   : (totalProcessingCount - totalCallsCompletedCount - dropFailedCount),
        //count: totalData && totalData.totalCount - _lastindex - ((failedCount || 0) + (dropFailedCount || 0) + (totalCallsCompletedCount || 0) + (totalPendingCount || 0)),
        //count :  totalData.campaignStatus ? totalData && totalData.totalCount - _lastindex : 0,
        count: totalData && totalData.campaignStatus ? (totalData && totalData.totalCount) - _lastindex : 0,
        color: '#f39c12'
      },
      {
        title: 'Failed',
        count: failedCount + dropFailedCount,
        color: '#dd4b39'
      },
      {
        title: 'Pending',
        count: (totalData && totalData.campaignStatus) ? _lastindex - (failedCount + dropFailedCount + totalCallsCompletedCount) : 
                totalData && totalData.totalCount - (_lastindex + dropFailedCount +  failedCount + totalCallsCompletedCount),
        //count: totalData && totalData.totalCount - (failedCount + dropFailedCount) - (totalProcessingCount - totalCallsCompletedCount - dropFailedCount),
        //count: totalPendingCount + (_lastindex - ((totalData && totalData.responseIndex) || 0)),
        //count: totalData.campaignStatus ? _lastindex - (dropFailedCount + failedCount + totalCallsCompletedCount) : totalPendingCount,
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