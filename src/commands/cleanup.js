const {
  stagehandErr,
  stagehandSuccess,
  stagehandWarn,
} = require("../util/logger");
const { wrapExecCmd } = require("../util/wrapExecCmd");
const { readDataFile, writeToDataFile } = require("../util/fs");
const { deleteLambda } = require("../aws/deleteLambda");
const { lambdaDeleteErrorMessage } = require("../util/consoleMessages");

const cleanup = (args) => {
  const userApps = readDataFile();
  const lambdas = userApps["to_delete"];

  lambdas.forEach((lambda) => {
    wrapExecCmd(deleteLambda(lambda))
      .then((output) => {
        stagehandSuccess(lambda, "Lambda deleted");
        userApps["to_delete"].splice(userApps["to_delete"].indexOf(lambda), 1);
        writeToDataFile(userApps);
      })
      .catch((error) => {
        console.log(error);
        stagehandErr(lambdaDeleteErrorMessage(lambda));
      });
  });
};

module.exports = { cleanup };
