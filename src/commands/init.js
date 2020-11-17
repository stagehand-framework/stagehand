const fs = require("fs");
const { exec } = require("child_process");

const { getStackOutputs } = require("../aws/getStackOutputs");
const { createStack } = require("../aws/createStack");
const { generateRandomStackName } = require("../util/generateRandomStackName");

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

const ssgs = ["gatsby", "next", "hugo", "react"];

const createStagehand = (ssg, stackName) => {
  return new Promise((resolve, reject) => {
    const templatePath = getTemplatePath(ssg, "cfStack");

    exec(createStack(templatePath, stackName), (error, stdout, stderr) => {
      if (error) {
        stagehandErr(`error: ${error.message}`);
        return;
      }

      if (stderr) {
        resolve(stagehandErr(`stderr: ${stderr}`));
        return;
      }

      resolve(stagehandLog(`stdout: ${stdout}`));
    });
  });
};

const addNewStagehandApp = (name, info) => {
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
  if (!ssgs.includes(args["ssg"])) {
    throw new Error(
      `You have failed to provide a valid static site generator! Please use one of the following: ${ssgs.join(
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
    copyGithubActions(args["ssg"]);
    createDataFile();

    createStagehand(args["ssg"], args["stackName"]).then((resolve) => {
      exec(getStackOutputs(args["stackName"]), (error, stdout, stderr) => {
        if (error) {
          stagehandErr(`error: ${error.message}`);
          return;
        }

        if (stderr) {
          stagehandErr(`stderr: ${stderr}`);
          return;
        }

        const stackOutput = parseStackOutputJSON(stdout);
        const outputMessage = stackOutputMessage(stackOutput);

        addNewStagehandApp(args["stackName"], stackOutput);

        stagehandLog(outputMessage);
      });
    });
  } catch (err) {
    stagehandErr(`Error: ${err}`);
  }
};

module.exports = { init };
