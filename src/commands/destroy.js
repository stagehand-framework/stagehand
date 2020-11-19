const {
  stagehandErr,
  stagehandLog,
  stagehandWarn,
  stagehandSuccess,
} = require("../util/logger");
const readlineSync = require("readline-sync");
const {
  readDataFile,
  writeToDataFile,
  deleteGithubActions,
} = require("../util/fs");
const userApps = readDataFile();
const { deleteStack } = require("../aws/deleteStack");
const { emptyBucket } = require("../aws/emptyBucket");
const { wrapExecCmd } = require("../util/wrapExecCmd");
const { deleteGithubSecrets } = require("../util/deleteGithubSecrets");

const validateDestroy = (stackName) => {
  stagehandWarn("Are you sure you want to destroy this stack?");
  const answer = readlineSync.question(
    " Type the stackName again to confirm:  "
  );

  return stackName === answer.trim();
};

const deleteAppFromDataFile = (stackName) => {
  delete userApps[stackName];
  writeToDataFile(userApps);
};

const deleteStackResources = (stackName) => {
  stagehandWarn(`Deleting stack resources`);

  const bucketName = userApps[stackName].s3;
  const deleteCmd = deleteStack(stackName);
  const emptyCmd = emptyBucket(bucketName);
  const repo_path = userApps[stackName].repo_path;

  stagehandWarn("Emptying S3 bucket...");

  wrapExecCmd(emptyCmd).then((_) => {
    stagehandSuccess("S3 Bucket emptied");
    stagehandWarn("Removing AWS stack infrastructure...");

    wrapExecCmd(deleteCmd).then((_) => {
      stagehandSuccess("AWS stack infrastructure removed");

      stagehandWarn("Deleting GitHub actions...");
      deleteGithubActions(repo_path);
      stagehandSuccess("GitHub actions deleted.");

      stagehandWarn("Removing stack data...");
      deleteAppFromDataFile(stackName);
      stagehandSuccess("Stack data Removed");
    });
  });
};

const destroy = async (args) => {
  try {
    const stackName = args.stackName;
    if (!stackName)
      return stagehandWarn(
        'Please provide a stackName: "stagehand destroy --stackName <name>"'
      );
    if (!userApps[stackName])
      return stagehandWarn(`No stack with name ${stackName} found`);

    if (validateDestroy(stackName)) {
      deleteStackResources(stackName);
      deleteGithubSecrets();
    } else {
      throw `Could not delete stack ${stackName}`;
    }
  } catch (err) {
    stagehandErr(err);
  }
};

module.exports = { destroy };
