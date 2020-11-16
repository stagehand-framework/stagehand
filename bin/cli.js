#!/usr/bin/env node

const executeCommand = require("../src/commands/executeCommand");
const { handleArgs } = require("../src/util/handleArgs");
const { stagehandErr, stagehandLog } = require("../src/util/logger");

const [, , command, ...args] = process.argv;

(async () => {
  try {
    const filteredArgs = handleArgs(args);
    await executeCommand(command, filteredArgs);
  } catch (err) {
    stagehandErr(err);
  }
})();
