const { init } = require("./init");
const { list } = require("./list");
const { help } = require("./help");
const { stagehandErr, stagehandLog } = require("../util/logger");

module.exports = async function executeCommand(command, args) {
  if (command === "init") {
    init(args);
  } else if (command === "list") {
    list(args);
  } else if (command === "help") {
    help(args);
  } else {
    stagehandErr(`Command: ${command} is not valid.`);
  }
};
