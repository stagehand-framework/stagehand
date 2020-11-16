const { stagehandErr, stagehandLog } = require("../util/logger");
const { dataPath } = require("../util/paths");

module.exports = async function list(args) {
  const rawUserAppsData = fs.readFileSync(dataPath);
  const userApps = JSON.parse(rawUserAppsData);
  const appName = args; // TODO: fix handleArgs so we can grab appName from it

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
  } else if (userApps[appName]) {
    // TODO: Grab info about stack
  } else {
    stagehandLog(`No stagehand with name ${appName} found`);
  }
};
