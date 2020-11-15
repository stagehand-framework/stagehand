const { stagehandErr, stagehandLog } = require("../util/logger");
const ssgs = ["gatsby", "next", "hugo", "react"];
const keys = ["ssg", "stackName"];

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
};

const generateRandomStackName = (len) => {
  let i = 0;
  result = "";

  while (i < len) {
    result += String.fromCharCode(getRandomIntInclusive(97, 122));
    i += 1;
  }

  return result;
};

module.exports = function handleArgs(args) {
  const filteredArgs = {};

  args.map((arg, idx) => {
    const key = keys[idx];
    const val = arg.replace(/-/g, "");
    filteredArgs[key] = val;
  });

  if (filteredArgs.length === 0) {
    throw new Error("You have failed to provide any arguments!");
  }

  if (!ssgs.includes(filteredArgs["ssg"])) {
    throw new Error(
      "You have failed to provide a valid static site generator!"
    );
  }

  if (!filteredArgs["stackName"]) {
    filteredArgs["stackName"] = generateRandomStackName(10);
    stagehandLog(
      `You have failed to provide a stack name. Creating a random one: ${filteredArgs["stackName"]}`
    );
  }

  stagehandLog(
    `Running stagehand for this repo which uses the ${filteredArgs["ssg"]} SSG. The stack name will be ${filteredArgs["stackName"]}.`
  );

  return filteredArgs;
};
