const { stagehandErr, stagehandLog } = require("../util/logger");
const readlineSync = require("readline-sync");
const { readDataFile, writeToDataFile } = require("../util/fs");
const userApps = readDataFile();
const { deleteStack } = require("../aws/deleteStack");
const { wrapExecCmd } = require("../util/wrapExecCmd");

const validateDestroy = (args) => {
  stagehandLog("Are you sure you want to destroy ths app?");
  const answer = readlineSync.question(
    "Type the stack name if you are sure:  "
  );

  return Object.keys(userApps).includes(answer);
};

const deleteAppFromDataFile = (stackName) => {
  delete userApps[stackName];
};

const deleteStackResources = (stackName) => {
  const cmd = deleteStack(stackName);

  wrapExecCmd(cmd).then((_) => {
    deleteAppFromDataFile(stackName);
  });
};

const destroy = async (args) => {
  if (validateDestroy(args.stackName)) {
    deleteStackResources(args.stackName);
  }
};

module.exports = { destroy };
