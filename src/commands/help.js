const { stagehandErr, stagehandHelp } = require("../util/logger");
const { helpLogs } = require("../util/consoleMessages");

const help = (args) => {
  const availableCommands = Object.keys(helpLogs);
  
  const commandRequested = Object.keys(args)[0];
  const helpStr = helpLogs[commandRequested];

// List All Commands
  if (!commandRequested) {    
    stagehandHelp(helpLogs.help);

// List Help for Command
  } else if (helpStr) {
    stagehandHelp(helpStr);

// Invalid Command
  } else {
    stagehandErr(`Unknown command ${commandRequested}`);
    stagehandHelp(helpLogs.help);
  }
}

module.exports = { help }