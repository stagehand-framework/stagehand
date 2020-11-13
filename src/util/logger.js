const escape = "\x1b";
const reset = "\x1b[0m";
const red = "[31m";
const yellow = "[33m";

const stagehandErr = (text) => {
  console.log(`Error ${escape}${red}`, text, reset);
};

const stagehandWarn = (text) => {
  console.log(`Warning ${escape}${yellow}`, text, reset);
};

const stagehandLog = (text) => {
  console.log(text);
};

module.exports = {
  stagehandErr,
  stagehandWarn,
  stagehandLog,
};
