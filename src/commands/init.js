const { getStackOutputs } = require("../aws/getStackOutputs");
const { createStack } = require("../aws/createStack");
const { generateRandomStackName } = require("../util/generateRandomStackName");
const { wrapExecCmd } = require('../util/wrapExecCmd');

const {
  createWorkflowDir,
  copyGithubActions,
  createDataFile,
  readDataFile,
  writeToDataFile,
} = require("../util/fs");

const { stagehandErr, stagehandLog } = require("../util/logger");
const { getTemplatePath } = require("../util/paths");
const { parseStackOutputJSON } = require("../util/parseAwsOutputs");
const { stackOutputMessage } = require("../util/consoleMessages");

const SSGS = ["gatsby", "next", "hugo", "react"];

const createStagehandApp = (args) => {
  const templatePath = getTemplatePath(args.ssg, "cfStack");
  const cmd = createStack(templatePath, args.stackName);

  wrapExecCmd(cmd)
    .then(_ => {
      const cmd = getStackOutputs(args.stackName);
      wrapExecCmd(cmd)
    .then(output => {
      const stackOutput = parseStackOutputJSON(output);
      const outputMessage = stackOutputMessage(stackOutput);

      addAppToData(args.stackName, stackOutput);

      stagehandLog(outputMessage);
    });
  });
};

const addAppToData = (name, info) => {
  const userApps = readDataFile();
  const appInfo = {
    s3: info["BucketName"],
    domain: info["Domain"],
    region: info["Region"],
    id: info["DistributionId"]
  };

  writeToDataFile({ ...userApps, [name]: appInfo});
};

const validateStackName = (args) => {
  if (!args["stackName"]) {
    args["stackName"] = generateRandomStackName();
    stagehandLog(
      `You have failed to provide a stack name. Creating a random one: ${args["stackName"]}`
    );
  } else {
    stagehandLog(`The stack name will be ${args["stackName"]}.`);
  }
};

const validateSSG = (args) => {
  if (!SSGS.includes(args["ssg"])) {
    throw new Error(
      `You have failed to provide a valid static site generator! Please use one of the following: ${SSGS.join(
        ", "
      )}.`
    );
  } else {
    stagehandLog(
      `Running stagehand for this repo which uses the ${args["ssg"]} SSG.`
    );
  }
};

const init = async (args) => {
  try {
    validateSSG(args);
    validateStackName(args);
    createWorkflowDir();
    copyGithubActions(args.ssg);
    createDataFile();

    createStagehandApp(args);
  } catch (err) {
    stagehandErr(`Could not initialize app:\n ${err}`);
  }
};

module.exports = { init };
