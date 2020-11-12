module.exports = async function executeCommand(command, args) {
  if (command === 'init') {
    // initialize command
  } else {
    console.log(`Command: ${command} is not valid.`);
  }
};