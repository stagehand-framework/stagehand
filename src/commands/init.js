const prompts = require('prompts');

const { getStackOutputs } = require("../aws/getStackOutputs");
const { createStack } = require("../aws/createStack");
const { addDomainFileToS3 } = require("../aws/addDomainFileToS3");
const { generateRandomStackName } = require("../util/generateRandomStackName");
const { wrapExecCmd } = require("../util/wrapExecCmd");
const {
  createWorkflowDir,
  copyGithubActions,
  createDataFile,
  readDataFile,
  writeToDataFile,
  createConfigFile,
  createDomainFile,
  isRepo,
  injectBuildInfoToGithubActions,
  copyStagehandClientFilesToRepo,
} = require("../util/fs");
const { startSpinner, stopSpinner } = require("../util/spinner");

const {
  stagehandErr,
  stagehandLog,
  stagehandSuccess,
  stagehandWarn,
} = require("../util/logger");
const { cloudformationTemplatePath } = require("../util/paths");
const { parseStackOutputJSON } = require("../util/parseAwsOutputs");
const { stackOutputMessage, welcomeToStagehand } = require("../util/consoleMessages");
const {
  addGithubSecrets,
  validateGithubConnection,
} = require("../util/addGithubSecrets");

let spinner;

const createStagehandApp = async (stackName) => {
  stackName = stackName.replace(/\s/g, '');

  const createCmd = createStack(cloudformationTemplatePath, stackName);

  stagehandWarn(
    `Provisioning AWS infrastructure. This may take a few minutes\n Grab a coffee while you wait`
  );
  spinner = startSpinner();

  await wrapExecCmd(createCmd);
  
  stopSpinner(spinner);
  stagehandSuccess("created", "AWS infrastructure:");

  const outputCmd = getStackOutputs(stackName);
  const output = await wrapExecCmd(outputCmd, 'Could not retrieve stack outputs');
  const stackOutput = parseStackOutputJSON(output);

  addAppToData(stackName, stackOutput);
  addGithubSecrets(stackOutput);

  const path = createDomainFile(stackOutput["Domain"]);

  await wrapExecCmd(addDomainFileToS3(path, stackOutput["BucketName"]))
  stagehandSuccess("added", "S3 domain file:");
  stagehandLog(welcomeToStagehand());
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

const validateStackName = (name) => {
  const userApps = readDataFile() || {};
  const stackNames = Object.keys(userApps);

  if (stackNames.includes(name)) {
    return 'Name is taken already';
  } else if (name.trim().length === 0) {
    return 'Please provide a name';
  } else {
    return true;
  }
};

const getBuildInfo = async () => {
  let confirm;
  let results;
  let result;

  const questions = [
    {
      type: "text",
      name: "stackName",
      message: `What do you want to name your Stagehand app?`,
      validate: validateStackName,
    },
    {
      type: "text",
      name: "setupCmd",
      message: `What is your app's setup command?\n (ex: npm install, brew install hugo)`,
      validate: cmd => cmd.trim().length === 0 ? 'Please enter a setup command' : true,
    },
    {
      type: "text",
      name: "buildCmd",
      message: `What is your app's build command?\n (ex: npm run-script build, hugo)`,
      validate: cmd => cmd.trim().length === 0 ? 'Please enter a build command' : true,
    },
    {
      type: "text",
      name: "buildPath",
      message: `What is the path of the static assets after build?\n (ex: public, out, build)`,
      validate: cmd => cmd.trim().length === 0 ? 'Please enter a build path' : true,
    },
  ];

  const confirmQuestion = {
    type: 'confirm',
    name: 'confirm',
    message: 'Are these correct?',
    initial: true
  }

  while (!confirm) {
    confirm = undefined;
    results = await prompts(questions);
    Object.keys(results).forEach(info => stagehandSuccess(results[info], `\t${info}: `));
    
    result = await prompts(confirmQuestion);
    confirm = result["confirm"];
    if (confirm === undefined) throw 'Exited initialization process';
  }
  
  return results;  
}

const getRoutingType = async () => {
  const questions = [
    {
      type: "confirm",
      name: "STAGEHAND_IS_SPA",
      message: `Is your app a Single Page Application? (ex: React)`,
      initial: true,
    },
    {
      type: prev => prev ? null : "confirm",
      name: "STAGEHAND_INDEX_ROUTES",
      message: `Are all your static routes served from "path/index.html"?\n (as opposed to "path.html")`,
      initial: true,
    },
  ];

  const results = await prompts(questions);
  return results;
};

const init = async (args) => {
  try {
    if (!isRepo()) {
      throw `Current directory is not a git repository or it is not tied to a GitHub Origin`;
    }

    await createConfigFile();
    createDataFile();
    await validateGithubConnection();
    const buildInfo = await getBuildInfo();

    createWorkflowDir();
    copyGithubActions();
    injectBuildInfoToGithubActions(buildInfo);

    const routingType = await getRoutingType();
    copyStagehandClientFilesToRepo(routingType);

    await createStagehandApp(buildInfo["stackName"]);


  } catch (err) {
    if (spinner) stopSpinner(spinner);
    stagehandErr(`Could not initialize app:\n${err}`);
  }
};

module.exports = { init };
