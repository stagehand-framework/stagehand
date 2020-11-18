#!/usr/bin/env node

const executeCommand = require("../src/commands/executeCommand");
const { handleArgs } = require("../src/util/handleArgs");
const { stagehandErr, stagehandLog } = require("../src/util/logger");
const { writeToLogFile } = require("../src/util/fs");

const [, , command, ...args] = process.argv;

(async () => {
  try {
    const cmd = `stagehand ${[command].concat(args).join(" ")}`;
    writeToLogFile(cmd, true);
    const filteredArgs = handleArgs(args);
    await executeCommand(command, filteredArgs);
  } catch (err) {
    stagehandErr(err);
  }
})();
