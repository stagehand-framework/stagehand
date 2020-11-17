const { getStackOutputs } = require("../aws/getStackOutputs");
const { createStack } = require("../aws/createStack");
const { generateRandomStackName } = require("../util/generateRandomStackName");
const { wrapExecCmd } = require("../util/wrapExecCmd");
const {
  createWorkflowDir,
  copyGithubActions,
  createDataFile,
  readDataFile,
  writeToDataFile,
  createConfigFile,
} = require("../util/fs");

const { stagehandErr, stagehandLog } = require("../util/logger");
const { getTemplatePath } = require("../util/paths");
const { parseStackOutputJSON } = require("../util/parseAwsOutputs");
const { stackOutputMessage } = require("../util/consoleMessages");
const { addGithubSecrets } = require("../util/addGithubSecrets");

const BUILDS = ["gatsby", "next", "hugo", "react"];

const createStagehandApp = (args) => {
  const templatePath = getTemplatePath(args.build, "cfStack");
  const cmd = createStack(templatePath, args.stackName);

  wrapExecCmd(cmd).then((_) => {
    const cmd = getStackOutputs(args.stackName);
    wrapExecCmd(cmd).then((output) => {
      const stackOutput = parseStackOutputJSON(output);
      addGithubSecrets(stackOutput);
      // const outputMessage = stackOutputMessage(stackOutput);

      addAppToData(args.stackName, stackOutput);

      // stagehandLog(outputMessage);
    });
  });
};

const addAppToData = (name, info) => {
  const userApps = readDataFile();
  const appInfo = {
    s3: info["BucketName"],
    domain: info["Domain"],
    region: info["Region"],
    id: info["DistributionId"],
    repo_path: process.cwd(),
  };

  writeToDataFile({ ...userApps, [name]: appInfo });
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

const validateBuild = (args) => {
  if (!BUILDS.includes(args["build"])) {
    throw new Error(
      `You have failed to provide a valid build type! Please use one of the following: ${BUILDS.join(
        ", "
      )}.`
    );
  } else {
    stagehandLog(
      `Running stagehand for this repo which uses the ${args["build"]} build.`
    );
  }
};

const init = async (args) => {
  try {
    createConfigFile();
    validateBuild(args);
    validateStackName(args);
    createWorkflowDir();
    copyGithubActions(args.build);
    createDataFile();

    createStagehandApp(args);
  } catch (err) {
    stagehandErr(`Could not initialize app:\n ${err}`);
  }
};

module.exports = { init };
