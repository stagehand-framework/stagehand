const { init } = require("./init");
const { list } = require("./list");
const { help } = require("./help");
const { destroy } = require("./destroy");
const { access } = require("./access");
const { getId } = require("./getId");
const { helpLogs } = require("../util/consoleMessages")

const { stagehandErr, stagehandLog, stagehandHelp } = require("../util/logger");

module.exports = async function executeCommand(command, args) {
  if (command === "init") {
    init(args);
  } else if (command === "list") {
    list(args);
  } else if (command === "help") {
    help(args);
  } else if (command === "destroy") {
    destroy(args);
  } else if (command === "access") {
    access(args);
  } else if (command === "get-id") {
    getId(args);
  } else {
    if (!command) stagehandErr(`Please provide a command`);
    if (command) stagehandErr(`Command: ${command} is not valid.`);
    stagehandHelp(helpLogs.help);
  }
};
