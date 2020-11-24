const prompts = require("prompts");

const { stagehandErr, stagehandHelp } = require("../util/logger");
const { helpLogs, commands } = require("../util/consoleMessages");

async function help() {
  const availableCommands = Object.keys(helpLogs);

  const question = {
    type: "select",
    name: "Help",
    message: `What command would you like help for?`,
    choices: commands,
  };

  const result = await prompts(question);
  const commandRequested = commands[result["Help"]];
  const helpStr = helpLogs[commandRequested];
  stagehandHelp(helpStr);
}

module.exports = { help };
