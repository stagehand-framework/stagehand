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

// Init
program
  .command("init")
  .alias("i")
  .description("Create stagehand application")
  .action(init);

// List
program
  .command("list")
  .alias("l")
  .description("Lists stagehand application(s)")
  .action(list);

// Help
program
  .command("help")
  .alias("h")
  .description("Shows help information for a command")
  .action(help);

// Destroy
program
  .command("destroy")
  .alias("d")
  .description("Destroy's stagehand application")
  .action(destroy);

// Access
program
  .command("access")
  .alias("ac")
  .description("Access a stagehand application's permissions")
  .action(access);

// Add
program
  .command("add")
  .alias("a")
  .description("Create stagehand application")
  .action(add);

program.parse(process.argv);
