const { stagehandErr, stagehandLog } = require("../util/logger");
const readlineSync = require("readline-sync");
const { readDataFile, writeToDataFile } = require("../util/fs");
const userApps = readDataFile();

userApps.stack2 = {
  s3: "mystack-s3bucket-7koqeoo104jn",
  domain: "d135hwjxj512vl.cloudfront.net",
  region: "us-east-1",
  id: "E1R75VSQK790XS",
};

const validateDestroy = (args) => {
  stagehandLog(args);
  stagehandLog("Are you sure you want to destroy ths app?");

  const answer = readlineSync.question(
    "Type the stack name if you are sure:  "
  );

  if (Object.keys(userApps).includes(answer)) {
    deleteAppFromDataFile(answer);
  }

  stagehandLog(userApps);
};

const deleteAppFromDataFile = (stackName) => {
  delete userApps[stackName];
};

const destroy = async (args) => {
  stagehandLog(userApps);
  validateDestroy(args);
};

module.exports = { destroy };
