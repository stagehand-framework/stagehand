const prompts = require("prompts");
const open = require("open");

const { getAppPathsForS3Bucket } = require("../aws/getBucketObjects");
const { stagehandErr, stagehandLog, stagehandWarn } = require("../util/logger");
const { readDataFile } = require("../util/fs");
const { wrapExecCmd } = require("../util/wrapExecCmd");
const {
  parseBranchesOutput,
  parseReviewAppPaths,
  displayBranchAndCommit,
} = require("../util/parseAwsOutputs");
const {
  displayListMessage,
  noAppFoundMessage,
} = require("../util/consoleMessages");

const selectStack = async (stackNames, userApps) => {
  const selectList = {
    type: "select",
    name: "stackNames",
    message: "Select a stagehand app to see more details on it.",
    choices: stackNames,
  };

  const result = await prompts(selectList);
  const choice = stackNames[result["stackNames"]];
  const appInfo = userApps[choice];

  const cmd = getAppPathsForS3Bucket(appInfo.s3);
  const output = await wrapExecCmd(cmd);
  if (!output) {
    stagehandWarn(
      `No review apps in ${appInfo.s3} detected\n Start by creating a Pull Request`
    );
  } else {
    return selectPath(output, appInfo.domain, choice, stackNames, userApps);
  }
}

const selectPath = async (pathsOutput, domain, stackName, stackNames, userApps) => {
  const paths = parseReviewAppPaths(pathsOutput, domain);
  const pathsObj = displayBranchAndCommit(paths);

  const selectList = {
    type: "select",
    name: "paths",
    message: `Select a review environment from ${stackName}`,
    choices: Object.keys(pathsObj).concat('GO BACK TO APP LIST'),
  };

  const result = await prompts(selectList);
  const choice = Object.keys(pathsObj)[result["paths"]];
  return choice ? pathsObj[choice] : await selectStack(stackNames, userApps);
}

async function list() {
  try {
    const userApps = readDataFile();
    const stackNames = Object.keys(userApps);
  
    if (stackNames.length === 0) {
      stagehandWarn(
        `No stagehand apps have been created or added\n Start with "stagehand help --init"`
      );
    } else {
      const result = await selectStack(stackNames, userApps);

      if (result) {
        await open(result);
      }

      // const selectList = {
      //   type: "select",
      //   name: "stackNames",
      //   message: "Select a stagehand app to see more details on it.",
      //   choices: stackNames,
      // };

      // const result = await prompts(selectList);
      // const choice = stackNames[result["stackNames"]];
      // const appInfo = userApps[choice];

      // const cmd = getAppPathsForS3Bucket(appInfo.s3);
      // const output = await wrapExecCmd(cmd);
      // if (!output) {
      //   stagehandWarn(
      //     `No review apps in ${appInfo.s3} detected\n Start by creating a Pull Request`
      //   );
      // } else {
        // console.log(output);
        // const paths = parseReviewAppPaths(output, appInfo.domain);
        // const pathsObj = displayBranchAndCommit(paths);

        // const selectList = {
        //   type: "select",
        //   name: "paths",
        //   message: "Select a review environment to open it up",
        //   choices: Object.keys(pathsObj),
        // };

        // const result = await prompts(selectList);
        // const choice = pathsObj[result["paths"]];


        // console.log(choice);

        // console.log(pathsObj);
        // displayListMessage(choice, paths);
      // }
    }
  } catch (err) {
    stagehandErr(`Could not list Stagehand apps`);
  }
}
module.exports = { list };
