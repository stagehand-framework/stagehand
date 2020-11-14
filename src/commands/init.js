const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { stagehandErr, stagehandLog } = require('../util/logger');
const { createStackOutputMessage, parseStackOutputJSON } = require('../util/parseStackOutputs');

// const stackName = 'stagehand-init-stack2'; This will be gotten from args[1]

const rootFrameworkPath = path.join(__dirname, '/../..');

const getTemplatePath = (ssg, fileType) => {
  if (fileType === 'cfStack') {
    fileType = 'cloudformation_template';
  } else if (fileType === 'create') {
    fileType = 'create_review_app';
  } else if (fileType === 'remove') {
    fileType = 'remove_review_app';
  }

  return path.join(rootFrameworkPath, `/templates/${ssg}/${fileType}.yml`);
}

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
  const githubPath = path.join(process.cwd(), '/.github')
  if (!fs.existsSync(githubPath)){
    fs.mkdirSync(githubPath);
  }

  const workflowPath = path.join(process.cwd(), '/.github/workflows')
  if (!fs.existsSync(workflowPath)) {
    fs.mkdirSync(workflowPath);
  }
}

const copyGithubActions = (ssg) => {
  fs.copyFile(path.join(rootFrameworkPath, `/templates/${ssg}/create_review_app.yml`), path.join(process.cwd(), '/.github/workflows/create_review_app.yml'), (err) => {
    if (err) throw err;
    console.log('copy completed');
  });
  fs.copyFile(path.join(rootFrameworkPath, `/templates/${ssg}/remove_review_app.yml`), path.join(process.cwd(), '/.github/workflows/remove_review_app.yml'), (err) => {
    if (err) throw err;
    console.log('copy completed');
  });
}

const addNewStagehandApp = (info) => {
  const dataPath = path.join(rootFrameworkPath, '/data/userApps.json');
  const rawUserAppsData = fs.readFileSync(dataPath);
  const userApps = JSON.parse(rawUserAppsData);

  userApps[info['stackName']] = info['bucketName'];

  fs.writeFileSync(dataPath, JSON.stringify(userApps));
}

const init = async (args) => {
  try {
    createWorkflowDir();
    copyGithubActions(args["ssg"]);
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
