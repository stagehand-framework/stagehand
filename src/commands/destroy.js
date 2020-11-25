const {
  stagehandErr,
  stagehandLog,
  stagehandWarn,
  stagehandSuccess,
} = require("../util/logger");
const readlineSync = require("readline-sync");
const prompts = require("prompts");
const {
  readDataFile,
  writeToDataFile,
  deleteGithubActions,
} = require("../util/fs");
const { validateGithubConnection } = require("../util/addGithubSecrets");
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
  // userApps["to_delete"] ||= [];
  // userApps["to_delete"].push(userApps[stackName]["viewer_request_lambda"]);
  // userApps["to_delete"].push(userApps[stackName]["origin_request_lambda"]);
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
    stagehandSuccess("emptied", " S3 Bucket:");
    stagehandWarn("Removing AWS stack infrastructure...");

    wrapExecCmd(deleteCmd).then((_) => {
      stagehandSuccess("removed", " AWS stack infrastructure:");

      stagehandWarn("Deleting GitHub actions...");
      deleteGithubActions(repo_path);
      stagehandSuccess("deleted", " GitHub actions:");

      deleteData(stackName);
    });
  });
};

const deleteData = (stackName) => {
  stagehandWarn("Removing stack data locally...");
  deleteAppFromDataFile(stackName);
  stagehandSuccess("removed", " Stack data:");
};

const destroy = async () => {
  try {
    const userApps = readDataFile();
    const stackNames = Object.keys(userApps);
    stackNames.splice(stackNames.indexOf("to_delete"), 1);
    console.log(stackNames);
    if (stackNames.length === 0) {
      stagehandWarn(
        `No stagehand apps have been created or added\n Start with "stagehand help --init"`
      );
    } else {
      const questions = [
        {
          type: "select",
          name: "stackNames",
          message: "Pick a stagehand app to destroy.",
          choices: stackNames,
        },
        {
          type: "text", // (prev) => (stackNames.includes(prev) ? "text" : null)
          name: "validate",
          message: `Are you sure you want to destroy this app? (N/Y)`,
        },
      ];

      const result = await prompts(questions);
      const stackName = stackNames[result["stackNames"]];
      if (!result["validate"]) {
        throw `Will not delete ${stackName}`;
      }

      validateGithubConnection();

      const validationStatus = result["validate"].toUpperCase() === "Y";
      const stack = userApps[stackName];

      if (stack.notOwnStack) return deleteData(stackName);

      deleteStackResources(stackName);
      deleteGithubSecrets();
    }
  } catch (err) {
    stagehandErr(err);
  }
};

module.exports = { destroy };
