const fs = require("fs");
const {
  githubFolderPath,
  workflowFolderPath,
  userCreateReviewAppPath,
  userRemoveReviewAppPath,
  dataPath,
  configPath,
  dataFolderPath,
  frameworkRemoveReviewAppPath,
  frameworkCreateReviewAppPath,
} = require("./paths");
const { stagehandErr, stagehandLog } = require("./logger");

const readlineSync = require("readline-sync");

const createFolder = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

const createWorkflowDir = () => {
  createFolder(githubFolderPath);
  createFolder(workflowFolderPath);
};

const copyGithubActions = (ssg) => {
  fs.copyFile(
    frameworkCreateReviewAppPath(ssg),
    userCreateReviewAppPath,
    (err) => {
      if (err) throw err;
      stagehandLog("Create review app action created");
    }
  );

  fs.copyFile(
    frameworkRemoveReviewAppPath(ssg),
    userRemoveReviewAppPath,
    (err) => {
      if (err) throw err;
      stagehandLog("Remove review app action created");
    }
  );
};

const createDataFile = () => {
  createFolder(dataFolderPath);

  if (!fs.existsSync(dataPath)) {
    writeToDataFile({});
    stagehandLog("Data File created");
  }
};

const readDataFile = () => {
  const rawUserAppsData = fs.readFileSync(dataPath);
  return JSON.parse(rawUserAppsData);
};

const writeToDataFile = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data));
};

const createConfigFile = () => {
  createFolder(dataFolderPath);

  if (!fs.existsSync(configPath)) {
    const github_access_token = readlineSync.question(
      "Please provide the github access token (https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token): "
    );

    // wrapExecCmd("git config --get remote.origin.url").then((url) => {
    //   const parts = url.split("/");
    //   const owner = parts[parts.length - 2];
    //   const repo = parts[parts.length - 1].slice(0, -5);

    //   const obj = {
    //     github_access_token: github_access_token,
    //     owner: owner,
    //     repo: repo,
    //   };
    //   console.log(obj);
    //   writeToConfigFile(obj);
    //   stagehandLog("Config File created");
    // });

    writeToConfigFile({ github_access_token: github_access_token });
    stagehandLog("Config File created");
  } else {
    let github_access_token = readConfigFile().github_access_token;
    stagehandLog(
      `Config File already exists with this github access token: ${github_access_token}`
    );
  }
};

const readConfigFile = () => {
  const rawUserAppsConfig = fs.readFileSync(configPath);
  return JSON.parse(rawUserAppsConfig);
};

const writeToConfigFile = (config) => {
  fs.writeFileSync(configPath, JSON.stringify(config));
};

module.exports = {
  createFolder,
  createWorkflowDir,
  copyGithubActions,
  createDataFile,
  readDataFile,
  writeToDataFile,
  createConfigFile,
  readConfigFile,
  writeToConfigFile,
};
