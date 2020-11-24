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

async function list() {
  const userApps = readDataFile();

  const stackNames = Object.keys(userApps);
  stackNames.splice(stackNames.indexOf("to_delete"), 1);

  if (stackNames.length === 0) {
    stagehandWarn(
      `No stagehand apps have been created or added\n Start with "stagehand help --init"`
    );
  } else {
    const questions = {
      type: "select",
      name: "stackNames",
      message: "Pick a stagehand app to see more details on it.",
      choices: stackNames,
      initial: 1,
    };

    const result = await prompts(questions);
    const choice = stackNames[result["stackNames"]];
    const appInfo = userApps[choice];

    const cmd = getAppPathsForS3Bucket(appInfo.s3);
    const output = await wrapExecCmd(cmd);
    if (!output) {
      stagehandWarn(
        `No review apps in ${appInfo.s3} detected\n Start by creating a Pull Request`
      );
    } else {
      const domains = parseReviewAppPaths(output, appInfo.domain);
      displayListMessage(choice, domains);
    }
  }
}
module.exports = { list };
