const { init } = require('./init');
const { stagehandErr, stagehandLog } = require('../util/logger')

module.exports = async function executeCommand(command, args) {
  if (command === 'init') {
    stagehandLog('initializing');
  } else {
    stagehandErr(`Command: ${command} is not valid.`);
  }
};
