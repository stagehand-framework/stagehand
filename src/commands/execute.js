const { init } = require("./init");
const { list } = require("./list");
const { help } = require("./help");
const { destroy } = require("./destroy");
const { access } = require("./access");
const { getId } = require("./getId");
const { add } = require("./add");
const { cleanup } = require("./cleanup");
const prompts = require("prompts");
const { program } = require("commander");

const version = require("../../package.json").version;
program.version(version).description("Stagehand Framework");

// List Command
program
  .command("list")
  .alias("l")
  .description("Lists stagehand application(s)")
  .action(() => {
    const questions = [
      {
        type: "text",
        name: "choice",
        message: "Do you want to see a specific app's info? (N/Y)",
      },
      {
        type: (prev) => (prev.toUpperCase() === "Y" ? "text" : null),
        name: "stackName",
        message:
          "Please specify the stack name of the app whose info you want.",
      },
    ];

    (async () => {
      const inputs = await prompts(questions);
      list(inputs);
    })();
  });

program.parse(process.argv);
