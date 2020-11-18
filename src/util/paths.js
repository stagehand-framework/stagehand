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

const dataFolderPath = path.join(process.env.HOME, "/.stagehand");
const dataPath = path.join(process.env.HOME, "/.stagehand/userApps.json");
const configPath = path.join(process.env.HOME, "/.stagehand/config.json");
const logPath = path.join(process.env.HOME, "/.stagehand/log.json");

const frameworkCreateReviewAppPath = (ssg) =>
  path.join(rootFrameworkPath, `/templates/${ssg}/create_review_app.yml`);
const frameworkRemoveReviewAppPath = (ssg) =>
  path.join(rootFrameworkPath, `/templates/${ssg}/remove_review_app.yml`);

const getTemplatePath = (ssg, fileType) => {
  if (fileType === "cfStack") {
    fileType = "cloudformation_template";
  } else if (fileType === "create") {
    fileType = "create_review_app";
  } else if (fileType === "remove") {
    fileType = "remove_review_app";
  }

  return path.join(rootFrameworkPath, `/templates/${ssg}/${fileType}.yml`);
};

module.exports = {
  rootFrameworkPath,
  githubFolderPath,
  workflowFolderPath,
  userCreateReviewAppPath,
  userRemoveReviewAppPath,
  dataPath,
  configPath,
  logPath,
  dataFolderPath,
  frameworkRemoveReviewAppPath,
  frameworkCreateReviewAppPath,
  getTemplatePath,
};
