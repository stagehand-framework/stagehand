const fs = require("fs");
const moment = require("moment");
const prompts = require("prompts");

const { wrapExecCmd } = require("./wrapExecCmd");
const {
  githubFolderPath,
  workflowFolderPath,
  userCreateReviewAppPath,
  userRemoveReviewAppPath,
  userStagehandFolderPath,
  dataPath,
  configPath,
  logPath,
  gitPath,
  domainPath,
  dataFolderPath,
  frameworkRemoveReviewAppPath,
  frameworkCreateReviewAppPath,
  frameworkStagehandFolderPath,
} = require("./paths");
const { stagehandErr, stagehandLog, stagehandSuccess } = require("./logger");
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

const copyGithubActions = () => {
  fs.copyFileSync(frameworkCreateReviewAppPath, userCreateReviewAppPath);

  stagehandSuccess("created", "Create review app Github action: ");

  fs.copyFileSync(frameworkRemoveReviewAppPath, userRemoveReviewAppPath);

  stagehandSuccess("created", "Remove review app Github action: ");
};

const injectBuildInfoToGithubActions = (info) => {
  let createReviewAppFile = fs.readFileSync(userCreateReviewAppPath, 'utf8');

  createReviewAppFile = createReviewAppFile.replace('STAGEHAND_SOURCE_DIR', info["buildPath"])
  createReviewAppFile = createReviewAppFile.replace('STAGEHAND_SETUP_CMD', info["setupCmd"])
  createReviewAppFile = createReviewAppFile.replace('STAGEHAND_BUILD_CMD', info["buildCmd"])

  fs.writeFileSync(userCreateReviewAppPath, createReviewAppFile);
}

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

const deleteStagehandRepoFolder = (repo_path) => {
  fs.rmdirSync(repo_path + "/.github/stagehand", { recursive: true });
}

const copyStagehandClientFilesToRepo = (routeTypeInfo) => {
  createFolder(userStagehandFolderPath);

  ['/stagehand.html', '/stagehand.js', '/stagehand_sw.js'].forEach(file => {
    fs.copyFileSync(frameworkStagehandFolderPath + file, userStagehandFolderPath + file);
  });

  let stagehandJs = fs.readFileSync(userStagehandFolderPath + '/stagehand.js', 'utf8');

  const isSPA = routeTypeInfo["STAGEHAND_IS_SPA"] ? 'true' : 'false';
  const isIndexRoutes = routeTypeInfo["STAGEHAND_INDEX_ROUTES"] ? 'true' : 'false';

  stagehandJs = stagehandJs.replace('STAGEHAND_IS_SPA', isSPA);
  stagehandJs = stagehandJs.replace('STAGEHAND_INDEX_ROUTES', isIndexRoutes);

  fs.writeFileSync(userStagehandFolderPath + '/stagehand.js', stagehandJs);
}

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
  return rawUserAppsData && JSON.parse(rawUserAppsData);
};

const writeToDataFile = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data));
};

const addToken = async () => {
  const question = {
      type: "text",
      name: "githubToken",
      message: `Please provide a valid github access token
 (https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token)
 Only permission for access token needed is repo.
 Enter token: `,
  };

  const result = await prompts(question);

  writeToConfigFile({ github_access_token: result["githubToken"] });
  stagehandSuccess("saved", "Stagehand configuration: ");
};

const createConfigFile = async () => {
  createFolder(dataFolderPath);

  if (!fs.existsSync(configPath)) {
    await addToken();
  } else {
    let github_access_token = readConfigFile().github_access_token;
    
    const question = {
      type: "confirm",
      name: "useToken",
      message: `Would you like to use existing Github config token?`,
      initial: true,
    };

    const result = await prompts(question);

    if (!result.useToken) {
      await addToken();
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
  injectBuildInfoToGithubActions,
  copyStagehandClientFilesToRepo,
  deleteStagehandRepoFolder,
};
