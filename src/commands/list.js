const prompts = require("prompts");

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
  if (appName === undefined) {
    const stackNames = Object.keys(userApps);
    stackNames.splice(stackNames.indexOf("to_delete"), 1);

    if (stackNames.length === 0) {
      stagehandWarn(
        `No stagehand apps have been created or added\n Start with "stagehand help --init"`
      );
    } else {
      const obj = {
        type: "select",
        name: "stackNames",
        message: "Pick a stagehand app to see more details on it.",
        choices: stackNames,
        initial: 1,
      };
      console.log(stackNames);
      const result = await prompts(obj);
      console.log(result);
      // displayListMessage("List of Current Stagehand Apps", stackNames);
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
        console.log(domains);
        //displayListMessage(appName, domains);
      }
    });

    // Invalid App Name
  } else {
    stagehandWarn(noAppFoundMessage(appName));
  }
}

module.exports = { list };
