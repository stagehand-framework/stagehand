const fs = require('fs');
const {
  githubFolderPath,
  workflowFolderPath,
  userCreateReviewAppPath,
  userRemoveReviewAppPath,
  dataPath,
  dataFolderPath,
  frameworkRemoveReviewAppPath,
  frameworkCreateReviewAppPath,
} = require('./paths');
const { stagehandErr, stagehandLog } = require('../util/logger');

const createFolder = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

const createWorkflowDir = () => {
  createFolder(githubFolderPath);
  createFolder(workflowFolderPath);
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

const createDataFile = () => {
  createFolder(dataFolderPath);

  if (!fs.existsSync(dataPath)) {
    writeToDataFile({});
    stagehandLog('Data File created');
  }
}

const readDataFile = () => {
  const rawUserAppsData = fs.readFileSync(dataPath);
  return JSON.parse(rawUserAppsData);
}

const writeToDataFile = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data));
}

module.exports = {
  createFolder,
  createWorkflowDir,
  copyGithubActions,
  createDataFile,
  readDataFile,
  writeToDataFile,
}