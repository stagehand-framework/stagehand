const { init } = require("./init");
const { list } = require("./list");
const { stagehandErr, stagehandLog } = require("../util/logger");

module.exports = async function executeCommand(command, args) {
  if (command === "init") {
    init(args);
  } else if (command === "list") {
    stagehandLog("listing");
    list(args);
  } else {
    stagehandErr(`Command: ${command} is not valid.`);
  }
};
