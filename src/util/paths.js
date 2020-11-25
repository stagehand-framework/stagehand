const path = require("path");

const rootFrameworkPath = path.join(__dirname, "/../..");
const githubFolderPath = path.join(process.cwd(), "/.github");
const workflowFolderPath = path.join(process.cwd(), "/.github/workflows");

const userCreateReviewAppPath = path.join(
  process.cwd(),
  "/.github/workflows/create_review_app.yml"
);
const userRemoveReviewAppPath = path.join(
  process.cwd(),
  "/.github/workflows/remove_review_app.yml"
);
const userStagehandFolderPath = path.join(githubFolderPath, '/stagehand');

const dataFolderPath = path.join(process.env.HOME, "/.stagehand");
const dataPath = path.join(process.env.HOME, "/.stagehand/userApps.json");
const configPath = path.join(process.env.HOME, "/.stagehand/config.json");
const logPath = path.join(process.env.HOME, "/.stagehand/log.txt");
const gitPath = path.join(process.cwd(), "/.git");

const domainPath = (domain) => path.join(process.cwd(), `/${domain}`);

const frameworkCreateReviewAppPath =
  path.join(rootFrameworkPath, `/templates/create_review_app.yml`);
const frameworkRemoveReviewAppPath =
  path.join(rootFrameworkPath, `/templates/remove_review_app.yml`);
const cloudformationTemplatePath = 
  path.join(rootFrameworkPath, `/templates/cloudformation_template.yml`)
const frameworkStagehandFolderPath = path.join(rootFrameworkPath, '/templates/stagehand');

module.exports = {
  rootFrameworkPath,
  githubFolderPath,
  workflowFolderPath,
  userCreateReviewAppPath,
  userRemoveReviewAppPath,
  userStagehandFolderPath,
  dataPath,
  configPath,
  logPath,
  gitPath,
  dataFolderPath,
  domainPath,
  frameworkRemoveReviewAppPath,
  frameworkCreateReviewAppPath,
  cloudformationTemplatePath,
  frameworkStagehandFolderPath,
};
