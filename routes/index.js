const passport = require("passport");
const quote = require("./quote");

const auth = require("./auth");
const campaign = require("./campaign");
const callHistory = require("./call-history");
const smsHistory = require("./sms-history");
const sms = require("./sms");

exports.assignRoutes = (app) => {

  app.post("/api/register", auth.register);  // auth
  
  app.post("/api/login", auth.login);

  app.post("/api/forgot-password", auth.forgotPassword);

  app.get("/api/seed/all", quote.seedAll); //seed

  app.get("/api/seed/user", quote.resetUser);

  app.post(
    "/api/upload-campaign",
    // passport.authenticate("jwt", { session: false }),
    campaign.uploadFiles,
    campaign.uploadCampaign,
  );
  app.get('/api/statistics',
    // passport.authenticate("jwt", { session: false }),
    callHistory.getStatisticsCall);
  app.get("/api/campaigns",
    // passport.authenticate("jwt", { session: false }),
    campaign.getCampaigns);
  app.post(
    "/api/campaigns",
    // passport.authenticate("jwt", { session: false }),
    campaign.addCampaign,
  );
  app.put("/api/campaigns", campaign.editCampaign);

  app.delete("/api/campaigns", campaign.deleteCampaign);

  //SMS 
  app.post(
    "/api/upload-sms",
    // passport.authenticate("jwt", { session: false }),
    sms.uploadFiles,
    sms.uploadSms,
  );

  app.get("/api/sms",
    // passport.authenticate("jwt", { session: false }),
    sms.getSmsCampaigns);

  app.post(
    "/api/sms",
    // passport.authenticate("jwt", { session: false }),
    sms.addSmsCampaign,
  );

  app.put("/api/sms", sms.editSmsCampaign);

  app.delete("/api/sms", sms.deleteSmsCampaign);

  app.get('/api/sms-statistics',
    // passport.authenticate("jwt", { session: false }),
    smsHistory.getStatisticsSms);

  app.post(
    "/callback",
    campaign.callback
  );
}

