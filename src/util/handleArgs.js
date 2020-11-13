const { stagehandErr, stagehandLog } = require("../util/logger");
const ssgs = ["gatsby", "next", "hugo"];

module.exports = function handleArgs(args) {
  const filteredArgs = args.map((arg) => {
    return arg.replace(/-/g, "");
  });

  if (filteredArgs.length === 0) {
    throw new Error("You have failed to provide any arguments!");
  }

  if (!ssgs.includes(filteredArgs[0])) {
    throw new Error(
      "You have failed to provide a valid static site generator!"
    );
  }

  stagehandLog(
    `Building stagehand for this repo which uses the ${filteredArgs[0]} SSG`
  );

  return filteredArgs;
};
