const { stagehandErr, stagehandLog } = require("../util/logger");
const keys = ["ssg", "stackName"]; // move to individual command files or one large commands file

function handleArgs(args) {
  const filteredArgs = {};

  args = args
    .join(" ")
    .split("--")
    .slice(1)
    .map((elements) => elements.trim());

  args.map((arg) => {
    const [key, val] = arg.split(" ");
    filteredArgs[key] = val;
  });

  return filteredArgs;
}

module.exports = { handleArgs };
