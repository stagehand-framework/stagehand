const { stagehandErr, stagehandLog } = require("../util/logger");
const readlineSync = require("readline-sync");
const { readDataFile, writeToDataFile } = require("../util/fs");
const userApps = readDataFile();
const { deleteStack } = require("../aws/deleteStack");
const { emptyBucket } = require("../aws/emptyBucket");
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
  writeToDataFile(userApps);
};

const deleteStackResources = (stackName) => {
  const bucketName = userApps[stackName].s3;
  const deleteCmd = deleteStack(stackName);
  const emptyCmd = emptyBucket(bucketName);

  wrapExecCmd(emptyCmd).then((_) => {
    wrapExecCmd(deleteCmd).then((_) => {
      deleteAppFromDataFile(stackName);
    });
  });
};

const destroy = async (args) => {
  if (validateDestroy(args.stackName)) {
    deleteStackResources(args.stackName);
  }
};

module.exports = { destroy };
