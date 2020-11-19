const fs = require("fs");
const moment = require("moment");

const { wrapExecCmd } = require("./wrapExecCmd");
const {
  githubFolderPath,
  workflowFolderPath,
  userCreateReviewAppPath,
  userRemoveReviewAppPath,
  dataPath,
  configPath,
  logPath,
  gitPath,
  domainPath,
  dataFolderPath,
  frameworkRemoveReviewAppPath,
  frameworkCreateReviewAppPath,
} = require("./paths");
const { stagehandErr, stagehandLog, stagehandSuccess } = require("./logger");

const readlineSync = require("readline-sync");

const createFolder = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
    stagehandSuccess(path, "Stagehand folder created: ");
  }
};

const createWorkflowDir = () => {
  createFolder(githubFolderPath);
  createFolder(workflowFolderPath);
};

const copyGithubActions = (ssg) => {
  fs.copyFileSync(frameworkCreateReviewAppPath(ssg), userCreateReviewAppPath);

  stagehandSuccess("created", "Create review app Github action: ");

  fs.copyFileSync(frameworkRemoveReviewAppPath(ssg), userRemoveReviewAppPath);

  stagehandSuccess("created", "Remove review app Github action: ");
};

const deleteGithubActions = (repo_path) => {
  fs.unlinkSync(repo_path + "/.github/workflows/create_review_app.yml");
  fs.unlinkSync(repo_path + "/.github/workflows/remove_review_app.yml");

  if (
    fs.readdirSync(repo_path + "/.github/workflows").length === 0 &&
    fs.readdirSync(repo_path + "/.github").length === 1
  ) {
    fs.rmdirSync(repo_path + "/.github/workflows");
    fs.rmdirSync(repo_path + "/.github");
  }
};

const isRepo = () => {
  if (!fs.existsSync(gitPath)) return false;
  return wrapExecCmd("git config --get remote.origin.url").then((url) => {
    return !!url;
  });
};

const createDataFile = () => {
  createFolder(dataFolderPath);

  if (!fs.existsSync(dataPath)) {
    writeToDataFile({});
    stagehandSuccess("created", "Stagehand data file: ");
  }
};

const readDataFile = () => {
  const rawUserAppsData = fs.readFileSync(dataPath);
  return JSON.parse(rawUserAppsData);
};

const writeToDataFile = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data));
};

const addToken = () => {
  const github_access_token = readlineSync.question(
    `Please provide a valid github access token (https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token)
    Only permission for access token needed is repo.
    Enter token: `
  );

  writeToConfigFile({ github_access_token: github_access_token });
  stagehandSuccess("saved", "Stagehand configuration: ");
};

const createConfigFile = () => {
  createFolder(dataFolderPath);

  if (!fs.existsSync(configPath)) {
    addToken();
  } else {
    let github_access_token = readConfigFile().github_access_token;

    stagehandSuccess(
      github_access_token,
      `Stagehand is already configured with this token: `
    );

    const input = readlineSync.question(
      "Would you like to replace this token with a new one? (N/Y)"
    );
    if (input.toUpperCase() === "Y") {
      addToken();
    } else {
      stagehandSuccess("not updated", "Stagehand configuration: ");
    }
  }
};

const readConfigFile = () => {
  const rawUserAppsConfig = fs.readFileSync(configPath);
  return JSON.parse(rawUserAppsConfig);
};

const writeToConfigFile = (config) => {
  fs.writeFileSync(configPath, JSON.stringify(config));
};

const writeToLogFile = (command, args) => {
  const timestamp = moment().format("MMMM Do YYYY, h:mm:ss a");
  const data = `${timestamp} > stagehand ${[command].concat(args).join(" ")}`;
  fs.appendFileSync(logPath, `${data}\n`);
};

const createDomainFile = (domain) => {
  const currentDomainPath = domainPath(domain);
  fs.writeFileSync(currentDomainPath, '');
  return currentDomainPath;
}

module.exports = {
  isRepo,
  createFolder,
  createWorkflowDir,
  copyGithubActions,
  createDataFile,
  readDataFile,
  writeToDataFile,
  createConfigFile,
  readConfigFile,
  writeToConfigFile,
  writeToLogFile,
  createDomainFile,
  deleteGithubActions,
};
