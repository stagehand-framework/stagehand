const { exec } = require('child_process');
const { stagehandErr, stagehandLog } = require('../util/logger')

const stackName = 'init-stack2';
const templatePath = './templates/nextjs/cloudformation_template_nextjs.yaml';

const createStackCmd = `aws cloudformation deploy --template-file ${templatePath} --stack-name ${stackName} --capabilities CAPABILITY_IAM`;
const getStackOutputs = `aws cloudformation describe-stacks --stack-name ${stackName}`;

const logCmd = (error, stdout, stderr) => {
  if (error) {
    stagehandErr(`error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    stagehandErr(`stderr: ${stderr}`);
    return;
  }
  
  stagehandLog(`stdout: ${stdout}`);
}

const createStagehand = () => {
  return new Promise((resolve, reject) => {
    exec(createStackCmd, (error, stdout, stderr) => {
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

const init = async (directory, args) => {
  try {
    createStagehand().then(resolve => {
      exec(getStackOutputs, logCmd);
    });
  } catch (err) {
    stagehandErr(`Error: ${err}`);
  }
};

module.exports = { init };