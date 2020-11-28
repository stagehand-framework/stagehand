const prompts = require("prompts");

const {
  stagehandErr,
  stagehandWarn,
  stagehandSuccess,
} = require("../util/logger");
const {
  readDataFile,
  writeToDataFile,
  deleteGithubActions,
  deleteStagehandRepoFolder,
} = require("../util/fs");

const { validateGithubConnection } = require("../util/addGithubSecrets");
const { deleteGithubSecrets } = require("../util/deleteGithubSecrets");

const { deleteStack } = require("../aws/deleteStack");
const { emptyBucket } = require("../aws/emptyBucket");
const { wrapExecCmd } = require("../util/wrapExecCmd");

const deleteAppFromDataFile = (stackName, userApps) => {
  delete userApps[stackName];
  writeToDataFile(userApps);
};

const deleteStackResources = async (stackName, userApps) => {
  stagehandWarn(`Deleting stack resources`);

  const bucketName = userApps[stackName].s3;
  const deleteCmd = deleteStack(stackName);
  const emptyCmd = emptyBucket(bucketName);
  const repo_path = userApps[stackName].repo_path;

  stagehandWarn("Emptying S3 bucket...");

  await wrapExecCmd(emptyCmd)
  stagehandSuccess("emptied", " S3 Bucket:");
  stagehandWarn("Removing AWS stack infrastructure...");

  await wrapExecCmd(deleteCmd)
  stagehandSuccess("removed", " AWS stack infrastructure:");

  stagehandWarn("Deleting repo Stagehand folder");
  deleteStagehandRepoFolder(repo_path);
  stagehandSuccess("deleted", " Stagehand folder:");
  
  stagehandWarn("Deleting GitHub actions...");
  deleteGithubActions(repo_path);
  stagehandSuccess("deleted", " GitHub actions:");

  deleteData(stackName);
};

const deleteData = (stackName, userApps) => {
  stagehandWarn("Removing stack data locally...");
  deleteAppFromDataFile(stackName, userApps);
  stagehandSuccess("removed", " Stack data:");
};

const destroy = async () => {
  try {
    const userApps = readDataFile();
    const stackNames = Object.keys(userApps);
    
    if (stackNames.length === 0) {
      stagehandWarn(
        `No stagehand apps have been created or added\n Start with "stagehand help --init"`
      );
    } else {
      const questions = [
        {
          type: "select",
          name: "stackName",
          message: "Pick a stagehand app to destroy.",
          choices: stackNames,
        },
        {
          type: "confirm",
          name: "validate",
          message: `Are you sure you want to destroy this app?`,
          initial: false,
        },
      ];

      const result = await prompts(questions);
      const stackName = stackNames[result["stackName"]];
      if (!result["validate"]) {
        throw `Will not delete ${stackName}`;
      }

      await validateGithubConnection();
      const stack = userApps[stackName];

      if (stack.notOwnStack) return deleteData(stackName, userApps);

      await deleteStackResources(stackName, userApps);
      await deleteGithubSecrets();
    }
  } catch (err) {
    stagehandErr(err);
  }
};

module.exports = { destroy };
