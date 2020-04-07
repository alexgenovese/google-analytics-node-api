// authentication
// https://www.tgwilkins.co.uk/using-the-google-analytics-management-api-with-node.js.html
module.exports = {
  checkStatus: function(res) {
    return new Promise(function(resolve, reject) {
      if (res.status === 200) {
        resolve(res.data);
      } else {
        reject(res.status);
      }
    });
  },
  getPropertyLabel: function(dimensionMetric) {
    return "custom" + dimensionMetric + "s";
  },
  getCustomProperty: async function(dimensionMetric, account, index) {
    const { accountId, webPropertyId } = account;
    const property = this.getPropertyLabel(dimensionMetric);
    const res = await analytics.management[property].get({
      accountId,
      webPropertyId,
      [`custom${dimensionMetric}Id`]: `ga:${dimensionMetric +
        index}`.toLowerCase()
    });
    return this.checkStatus(res);
  },
  listCustomProperties: async function(dimensionMetric, account) {
    const { accountId, webPropertyId } = account;
    const property = this.getPropertyLabel(dimensionMetric);
    const res = await analytics.management[property].list({
      accountId,
      webPropertyId
    });
    return this.checkStatus(res);
  },
  getGoal: async function(account, goalId) {
    const { accountId, webPropertyId, profileId } = account;
    const res = await analytics.management.goals.get({
      accountId,
      webPropertyId,
      profileId,
      goalId
    });
    return this.checkStatus(res);
  },
  listGoals: async function(account) {
    const { accountId, webPropertyId, profileId } = account;
    const res = await analytics.management.goals.list({
      accountId,
      webPropertyId,
      profileId
    });
    return this.checkStatus(res);
  },
  // read methods as above, then...
  editCustomProperty: async function(
    action,
    dimensionMetric,
    account,
    requestBody
  ) {
    const { accountId, webPropertyId } = account;
    const property = this.getPropertyLabel(dimensionMetric);
    const res = await analytics.management[property][action]({
      accountId,
      webPropertyId,
      requestBody
    });
    return this.checkStatus(res);
  },
  editGoal: async function(action, account, requestBody) {
    const { accountId, webPropertyId, profileId } = account;
    const res = await analytics.management.goals[action]({
      accountId,
      webPropertyId,
      profileId,
      requestBody
    });
    return this.checkStatus(res);
  },
  copyConfiguration: function(config) {
    const result = {};
    const excludeKeys = [
      "accountId",
      "webPropertyId",
      "profileId",
      "parentLink",
      "selfLink",
      "internalWebPropertyId",
      "created",
      "updated"
    ];
    for (let key in config) {
      if (!excludeKeys.includes(key)) result[key] = config[key];
    }
    return result;
  }
};
