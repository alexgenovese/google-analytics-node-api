/*
https://www.tgwilkins.co.uk/using-the-google-analytics-management-api-with-node.js.html

Essentially, we are grabbing all goals, custom dimensions and custom metrics from our template account, 
and then for each child account we are:

Retrieving all current goals/dimensions/metrics
Checking to see if the action required is an 'update' or 'insert' based on what the child account 
currently has, for each goal/dimension/metric we want to copy over

Building a request body from the template and either adding to, or updating the corresponding 
goal/dimension/metric in the child account
*/

(async function() {
  // creating an async IIFE to make use of async await
  const analytics = require("./google-analytics-management.js");
  const templateAccount = {
    // the account to copy settings from
    accountId: "123456789",
    webPropertyId: "UA-XXXXXXXX-1",
    profileId: "123456789"
  };
  const childAccounts = [
    // the accounts to copy settings to
    {
      accountId: "123456789",
      webPropertyId: "UA-YYYYYYYYY-1",
      profileId: "123456789"
    },
    {
      accountId: "123456789",
      webPropertyId: "UA-ZZZZZZZZZ-1",
      profileId: "123456789"
    }
  ];
  // retrieving goals, dimensions and metrics from the template account
  const { items: goals } = await analytics.listGoals(templateAccount);
  const { items: Dimension } = await analytics.listCustomProperties(
    "Dimension",
    templateAccount
  );
  const { items: Metric } = await analytics.listCustomProperties(
    "Metric",
    templateAccount
  );
  /* 
  putting dimensions and metrics into an object we can iterate through
  because the logic to update them can be shared
  */
  const customProperties = {
    Dimension,
    Metric
  };
  // iterating through the child accounts to copy to
  for (let i = 0; i < childAccounts.length; i++) {
    const account = childAccounts[i];
    // getting current goals
    const { items: currentGoals } = await analytics.listGoals(account);

    // iterating through our template goals
    for (let j = 0; j < goals.length; j++) {
      // copying config, excluding template account info using the helper function
      const requestBody = analytics.copyConfiguration(goals[j]);
      // checking if a goal exists for this id and assigning the right action
      const action = currentGoals.some(goal => goal.id === requestBody.id)
        ? "update"
        : "insert";
      // making the request
      const res = await analytics.editGoal(
        action,
        account,
        requestBody.id,
        requestBody
      );
      // logging the result to the console
      console.log(action, "goal", res.id, res.webPropertyId);
    }

    const propertyKeys = Object.keys(customProperties);
    // making an array from our customProperties object to iterate through
    for (let j = 0; j < propertyKeys.length; j++) {
      const key = propertyKeys[j];
      // retrieving the current custom dimensions/metrics for the child account
      const { items: currentProps } = await analytics.listCustomProperties(
        key,
        account
      );
      // iterating through custom dimensions/metrics from the template
      for (let k = 0; k < customProperties[key].length; k++) {
        const customProp = customProperties[key][k];
        // building the requestBody with the helper function
        const requestBody = analytics.copyConfiguration(customProp);
        // assigning the appropriate action
        const action = currentProps.some(prop => prop.id === requestBody.id)
          ? "update"
          : "insert";
        // making the request
        const res = await analytics.editCustomProperty(
          action,
          key,
          account,
          requestBody.index,
          requestBody
        );
        // logging the result to the console
        console.log(action, res.id, res.webPropertyId);
      }
    }
  }
})();