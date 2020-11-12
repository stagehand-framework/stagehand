#!/usr/bin/env node

const executeCommand = require('../src/commands/executeCommand');

const [,, command, ...args] = process.argv;

(async () => {
  try {
    await executeCommand(command, args);
  } catch (err) {
    console.log(err)
  }
})();