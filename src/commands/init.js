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
  isRepo,
} = require("../util/fs");
const { startSpinner, stopSpinner } = require("../util/spinner");

const { stagehandErr, stagehandLog, stagehandSuccess, stagehandWarn } = require("../util/logger");
const { getTemplatePath } = require("../util/paths");
const { parseStackOutputJSON } = require("../util/parseAwsOutputs");
const { stackOutputMessage } = require("../util/consoleMessages");
const { addGithubSecrets } = require("../util/addGithubSecrets");

const BUILDS = ["gatsby", "next", "hugo", "react"];

const createStagehandApp = (args) => {
  const templatePath = getTemplatePath(args.build, "cfStack");
  const cmd = createStack(templatePath, args.stackName);

  stagehandWarn(`Provisioning AWS infrastructure. This may take a few minutes\n Grab a coffee while you wait`);
  const spinner = startSpinner();

  wrapExecCmd(cmd).then((_) => {
    stopSpinner(spinner);
    stagehandSuccess('created', 'AWS infrastructure:');

    const cmd = getStackOutputs(args.stackName);
    wrapExecCmd(cmd).then((output) => {
      const stackOutput = parseStackOutputJSON(output);
      addGithubSecrets(stackOutput);

      addAppToData(args.stackName, stackOutput);
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
    stagehandLog(args["stackName"], `Generating random stack name:`);
  } else {
    stagehandSuccess(args["stackName"], "Stack name:");
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
    stagehandSuccess(args["build"], "Creating Github action files for:");
  }
};

const init = async (args) => {
  try {
    if (!isRepo()) {
      throw `Current directory is not a git repository or it is not tied to a GitHub Origin`;
    }
    createConfigFile();
    validateBuild(args);
    validateStackName(args);
    createWorkflowDir();
    copyGithubActions(args.build);
    createDataFile();

    createStagehandApp(args);
  } catch (err) {
    stagehandErr(`Could not initialize app:\n${err}`);
  }
};

module.exports = { init };
