const { getAppPathsForS3Bucket } = require('../aws/getBucketObjects');

const { stagehandErr, stagehandLog } = require('../util/logger');
const { readDataFile } = require('../util/fs');
const { wrapExecCmd } = require('../util/wrapExecCmd');
const { parseBranchesOutput, parseReviewAppPaths } = require('../util/parseAwsOutputs');
const { listMessage, noAppFoundMessage } = require('../util/consoleMessages');

async function list(args) {
  const userApps = readDataFile();
  const appName = args["stackName"];
  const appInfo = userApps[appName];

// List All Apps
  if (Object.keys(args).length === 0) {
    const stackNames = Object.keys(userApps);
    
    stagehandLog(listMessage('List of Current Stagehand Apps', stackNames));

// List Domains for App
  } else if (appInfo) {
    const cmd = getAppPathsForS3Bucket(appInfo.s3);

    wrapExecCmd(cmd).then(output => {
      const domains = parseReviewAppPaths(output, appInfo.domain);

      stagehandLog(listMessage(appName, domains));
    });

// Invalid App Name
  } else {
    stagehandLog(noAppFoundMessage(appName));
  }
};

module.exports = { list };