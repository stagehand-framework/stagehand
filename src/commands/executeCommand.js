module.exports = async function executeCommand(command, args) {
  if (command === 'init') {
    console.log('initializing');
  } else {
    console.log(`Command: ${command} is not valid.`);
  }
};
