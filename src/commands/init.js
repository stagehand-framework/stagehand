const fs = require('fs');
const { exec } = require('child_process');

const { getStackOutputs } = require('../aws/getStackOutputs');
const { createStack } = require('../aws/createStack');

const {
  createWorkflowDir,
  copyGithubActions,
  createDataFile,
  readDataFile,
  writeToDataFile,
} = require('../util/fs');

const { stagehandErr, stagehandLog } = require('../util/logger');
const { getTemplatePath } = require('../util/paths');
const { createStackOutputMessage, parseStackOutputJSON } = require('../util/parseStackOutputs');

const createStagehand = (ssg, stackName) => {
  return new Promise((resolve, reject) => {
    const templatePath = getTemplatePath(ssg, 'cfStack');

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
  })
}

const addNewStagehandApp = (info) => {
  const userApps = readDataFile();

  userApps[info['stackName']] = info['bucketName'];

  writeToDataFile(userApps);
}

const init = async (args) => {
  try {
    createWorkflowDir();
    copyGithubActions(args["ssg"]);
    createDataFile();

    createStagehand(args["ssg"], args["stackName"]).then(resolve => {
      exec(getStackOutputs(args["stackName"]), (error, stdout, stderr) => {
        if (error) {
          stagehandErr(`error: ${error.message}`);
          return;
        }

        if (stderr) {
          stagehandErr(`stderr: ${stderr}`);
          return;
        }

        const stackOutputJSON = parseStackOutputJSON(stdout);
        const outputMessage = createStackOutputMessage(stackOutputJSON);

        addNewStagehandApp({ 
          bucketName: stackOutputJSON['BucketName'],
          stackName: args["stackName"]
        });

        stagehandLog(outputMessage);
      });
    });
  } catch (err) {
    stagehandErr(`Error: ${err}`);
  }
};

module.exports = { init };
