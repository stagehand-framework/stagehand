const { stagehandErr, stagehandSuccess, stagehandWarn } = require("../util/logger");
const { getBucketRoot } = require("../aws/getBucketRoot");
const { wrapExecCmd } = require("../util/wrapExecCmd");
const { readDataFile, writeToDataFile } = require('../util/fs');
const prompts = require("prompts");

const add = async (args) => {
  const userApps = readDataFile();
  const question = {
    type: "text",
    name: "s3",
    message: `What is the s3 bucket name of the existing app?`,
    validate: s3 => !s3.includes('-s3bucket-') ? 'Please enter a valid S3 Bucket name' : true,
  };

  const result = await prompts(question);
  const s3 = result.s3
  
  if (!s3) return stagehandErr('Please provide a bucket name');

  wrapExecCmd(getBucketRoot(s3))
    .then(output => {
      const stackName = s3.split('-s3bucket-')[0];
      const domain = output.match(/0 ([^\.]+\.cloudfront\.net)/)[1];

      if (userApps[stackName]) return stagehandErr(`You already have ${stackName}`);

      const newApp = { 
        [stackName]: {
          s3,
          domain,
          notOwnStack: true
        }
      };

      stagehandWarn(`Adding existing stack to local data...`);
      writeToDataFile({ ...userApps, ...newApp });
      stagehandSuccess('added', `Stack "${stackName}" has been:`);

    }).catch(err => stagehandErr(`You do not have access to bucket ${s3}`));
};

module.exports = { add }