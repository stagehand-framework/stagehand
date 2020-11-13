const { exec } = require("child_process");
const { stagehandErr, stagehandLog } = require("../util/logger");
const parseStackOutputs = require("../util/parseStackOutputs");

// const stackName = 'stagehand-init-stack2'; This will be gotten from args[1]

const getTemplatePath = (ssg) =>
  `./templates/${ssg}/cloudformation_template.yml`;

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
    exec(
      createStackCmd(getTemplatePath(ssg), stackName),
      (error, stdout, stderr) => {
        if (error) {
          stagehandErr(`error: ${error.message}`);
          return;
        }

        if (stderr) {
          resolve(stagehandErr(`stderr: ${stderr}`));
          return;
        }

        resolve(stagehandLog(`stdout: ${stdout}`));
      }
    );
  });
};

const init = async (args) => {
  try {
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

        const outputs = parseStackOutputs(stdout);
        stagehandLog(outputs);
      });
    });
  } catch (err) {
    stagehandErr(`Error: ${err}`);
  }
};

module.exports = { init };
