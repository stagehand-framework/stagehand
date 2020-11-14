const fs = require('fs');
const { exec } = require('child_process');
const { stagehandErr, stagehandLog } = require('../util/logger');
const {
  rootFrameworkPath,
  githubFolderPath,
  workflowFolderPath,
  userCreateReviewAppPath,
  userRemoveReviewAppPath,
  dataPath,
  dataFolderPath,
  frameworkRemoveReviewAppPath,
  frameworkCreateReviewAppPath,
  getTemplatePath,
} = require('../util/paths');
const { createStackOutputMessage, parseStackOutputJSON } = require('../util/parseStackOutputs');

// const stackName = 'stagehand-init-stack2'; This will be gotten from args[1]

const createStackCmd = (templatePath, stackName) => {
  return `aws cloudformation deploy --template-file ${templatePath} --stack-name ${stackName} --capabilities CAPABILITY_IAM`;
};
const getStackOutputs = (stackName) =>
  `aws cloudformation describe-stacks --stack-name ${stackName} --output json`;

// const logCmd = (error, stdout, stderr) => {
//   if (error) {
//     stagehandErr(`error: ${error.message}`);
//     return;
//   }

//   if (stderr) {
//     stagehandErr(`stderr: ${stderr}`);
//     return;
//   }

//   stagehandLog(`stdout: ${stdout}`);
// }

const createStagehand = (ssg, stackName) => {
  return new Promise((resolve, reject) => {
    const templatePath = getTemplatePath(ssg, 'cfStack');

    exec(createStackCmd(templatePath, stackName), (error, stdout, stderr) => {
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

const createWorkflowDir = () => {
  if (!fs.existsSync(githubFolderPath)){
    fs.mkdirSync(githubFolderPath);
  }

  if (!fs.existsSync(workflowFolderPath)) {
    fs.mkdirSync(workflowFolderPath);
  }
}

const createDataFile = () => {
  if (!fs.existsSync(dataFolderPath)){
    fs.mkdirSync(dataFolderPath);
  }

  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({}));
    stagehandLog('Data File created');
  }
}

const copyGithubActions = (ssg) => {
  fs.copyFile(frameworkCreateReviewAppPath(ssg), userCreateReviewAppPath, (err) => {
    if (err) throw err;
    stagehandLog('Create review app action created');
  });
  fs.copyFile(frameworkRemoveReviewAppPath(ssg), userRemoveReviewAppPath, (err) => {
    if (err) throw err;
    stagehandLog('Remove review app action created');
  });
}

const addNewStagehandApp = (info) => {
  const rawUserAppsData = fs.readFileSync(dataPath);
  const userApps = JSON.parse(rawUserAppsData);

  userApps[info['stackName']] = info['bucketName'];

  fs.writeFileSync(dataPath, JSON.stringify(userApps));
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
