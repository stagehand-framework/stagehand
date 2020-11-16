const { stagehandErr, stagehandLog } = require('../util/logger');
const { readDataFile } = require('../util/fs');
const { getS3Branches, getAppsForBranch } = require('../aws/getBucketObjects');

module.exports = async function list(args) {
  const userApps = readDataFile();
  const appName = 'testesttest';

  if (args.length === 0) {
    const stackNames = Object.keys(userApps);
    const stackNamesStr = stackNames
      .map((stackName) => {
        return `--- Name: ${stackName}`;
      })
      .join("\n");

    stagehandLog(`Current Active Stagehand Apps
      ---------------------------
      ${stackNamesStr}
      ---------------------------
    `);
  } else if (appName) {
    const branches = getS3Branches(appName)
    console.log(branches);
    console.log(typeof branches);
  } else {
    stagehandLog(`No stagehand with name ${appName} found`);
  }
};
