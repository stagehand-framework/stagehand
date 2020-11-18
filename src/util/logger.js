const fs = require('fs');
const path = require('path');
const escape = "\x1b";
const reset = "\x1b[0m";
const red = "[31m";
const yellow = "[33m";
const green = "[32m";
const help = "[1;36m";

// const { writeToLogFile } = require("./fs");
const logPath = path.join(process.env.HOME, "/.stagehand/log.txt");

const writeToLogFile = (data, start = false) => {
  if (start) {
    fs.appendFileSync(
      logPath,
      `----------------------------------\nCommand: ${data}\n`
    );
  } else {
    fs.appendFileSync(logPath, `\nOutput:\n ${data}\n`);
  }
};

const stagehandErr = (text) => {
  writeToLogFile(text);
  console.log(`Error ${escape}${red}`, text, reset);
};

const stagehandWarn = (text) => {
  writeToLogFile(text);
  console.log(`${escape}${yellow}`, text, reset);
};

const stagehandLog = (text) => {
  writeToLogFile(text);
  console.log(text);
};

const stagehandHelp = (text) => {
  writeToLogFile(text);
  console.log(`${escape}${help}`, text, reset);
};

const stagehandSuccess = (successText, text='') => {
  writeToLogFile(text);
  console.log(`${text}${escape}${green}`, successText, reset);
};

module.exports = {
  stagehandErr,
  stagehandWarn,
  stagehandLog,
  stagehandHelp,
  stagehandSuccess,
};
