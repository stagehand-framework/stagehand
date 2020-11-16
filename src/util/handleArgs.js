const { stagehandErr, stagehandLog } = require("../util/logger");
const ssgs = ["gatsby", "next", "hugo", "react"];
const keys = ["ssg", "stackName"];

function handleArgs(args) {
  const filteredArgs = {};

  args = args
    .join(" ")
    .split("--")
    .slice(1)
    .map((elements) => elements.trim());

  args.map((arg) => {
    const [key, val] = arg.split(" ");
    if (!keys.includes(key)) {
      throw new Error(
        `The argument of ${key} is invalid. Please use one of the following: ${keys}.`
      );
    }

    filteredArgs[key] = val;
  });

  return filteredArgs;
}

module.exports = { handleArgs, ssgs };
