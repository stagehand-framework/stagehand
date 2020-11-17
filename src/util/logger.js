const escape = "\x1b";
const reset = "\x1b[0m";
const red = "[31m";
const yellow = "[33m";
const green = "[32m";
const help = "[1;36m";

const stagehandErr = (text) => {
  console.log(`Error ${escape}${red}`, text, reset);
};

const stagehandWarn = (text) => {
  console.log(`Warning ${escape}${yellow}`, text, reset);
};

const stagehandLog = (text) => {
  console.log(text);
};

const stagehandHelp = (text) => {
  console.log(`${escape}${help}`, text, reset);
};

const stagehandSuccess = (text) => {
  console.log(`${escape}${green}`, text, reset);
};

module.exports = {
  stagehandErr,
  stagehandWarn,
  stagehandLog,
  stagehandHelp,
  stagehandSuccess,
};
