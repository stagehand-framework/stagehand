const { stagehandErr, stagehandLog } = require("../util/logger");
const readlineSync = require("readline-sync");
const {
  createWorkflowDir,
  copyGithubActions,
  createDataFile,
  readDataFile,
  writeToDataFile,
} = require("../util/fs");
const data = readDataFile();

data.stack2 = {
  s3: "mystack-s3bucket-7koqeoo104jn",
  domain: "d135hwjxj512vl.cloudfront.net",
  region: "us-east-1",
  id: "E1R75VSQK790XS",
};

const validateDestroy = () => {
  stagehandLog("Are you sure you want to destroy ths app?");

  const answer = readlineSync.question(
    "Type the stack name if you are sure:  "
  );

  if (Object.keys(data).includes(answer)) {
    deleteApp(answer);
  }

  stagehandLog(data);
};

const deleteApp = (stackName) => {
  delete data[stackName];
};

const destroy = async () => {
  stagehandLog(data);
  validateDestroy();
};

module.exports = { destroy };
