const { getAppPathsForS3Bucket } = require("../aws/getBucketObjects");

const { stagehandErr, stagehandLog, stagehandWarn } = require("../util/logger");
const { readDataFile } = require("../util/fs");
const { wrapExecCmd } = require("../util/wrapExecCmd");
const {
  parseBranchesOutput,
  parseReviewAppPaths,
} = require("../util/parseAwsOutputs");
const {
  displayListMessage,
  noAppFoundMessage,
} = require("../util/consoleMessages");

async function list(args) {
  const userApps = readDataFile();
  const appName = args["stackName"];
  const appInfo = userApps[appName];

  // List All Apps
  if (Object.keys(args).length === 0) {
    const stackNames = Object.keys(userApps);

    if (stackNames.length === 0) {
      stagehandWarn(
        `No stagehand apps have been created or added\n Start with "stagehand help --init"`
      );
    } else {
      displayListMessage("List of Current Stagehand Apps", stackNames);
    }

    // List Domains for App
  } else if (appInfo) {
    const cmd = getAppPathsForS3Bucket(appInfo.s3);

    wrapExecCmd(cmd).then((output) => {
      if (!output) {
        stagehandWarn(
          `No review apps in ${appInfo.s3} detected\n Start by creating a Pull Request`
        );
      } else {
        const domains = parseReviewAppPaths(output, appInfo.domain);

        displayListMessage(appName, domains);
      }
    });

    // Invalid App Name
  } else {
    stagehandWarn(noAppFoundMessage(appName));
  }
}

module.exports = { list };
