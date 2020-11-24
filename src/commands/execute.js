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
  .action(list);

program.parse(process.argv);
