const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { stagehandErr, stagehandLog } = require('../util/logger');
const parseStackOutputs = require('../util/parseStackOutputs');

// const stackName = 'stagehand-init-stack2'; This will be gotten from args[1]

const getTemplatePath = (ssg, fileType) => {
  if (fileType === 'cfStack') {
    fileType = 'cloudformation_template';
  } else if (fileType === 'create') {
    fileType = 'create_review_app';
  } else if (fileType === 'remove') {
    fileType = 'remove_review_app';
  }

  return `./templates/${ssg}/${fileType}.yml`;
}

const createStackCmd = (templatePath, stackName) => {
  return `aws cloudformation deploy --template-file ${templatePath} --stack-name ${stackName} --capabilities CAPABILITY_IAM`;
};
const getStackOutputs = (stackName) =>
  `aws cloudformation describe-stacks --stack-name ${stackName}`;

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
  fs.copyFile(`./templates/${ssg}/create_review_app.yml`, path.join(process.cwd(), '/.github/workflows/create_review_app.yml'), (err) => {
    if (err) throw err;
    console.log('copy completed');
  });
  fs.copyFile(`./templates/${ssg}/remove_review_app.yml`, path.join(process.cwd(), '/.github/workflows/remove_review_app.yml'), (err) => {
    if (err) throw err;
    console.log('copy completed');
  });
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

        const outputs = parseStackOutputs(stdout);
        stagehandLog(outputs);
      });
    });
  } catch (err) {
    stagehandErr(`Error: ${err}`);
  }
};

module.exports = { init };
