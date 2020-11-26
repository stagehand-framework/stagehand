#!/usr/bin/env node

const { init } = require("../src/commands/init");
const { list } = require("../src/commands/list");
const { help } = require("../src/commands/help");
const { destroy } = require("../src/commands/destroy");
const { access } = require("../src/commands/access");
const { add } = require("../src/commands/add");

const prompts = require("prompts");
const { program } = require("commander");

const version = require("../package.json").version;
program.version(version).description("Stagehand Framework");

// Init
program
  .command("init")
  .alias("i")
  .description("Create a stagehand application")
  .action(init);

// List
program
  .command("list")
  .alias("l")
  .description("Lists stagehand applications")
  .action(list)
  .helpInformation('more info');

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
  .description("Deletes a stagehand application")
  .action(destroy);

// Access
program
  .command("access")
  .alias("ac")
  .description("Apply or view access controls for a stagehand application")
  .action(access);

// Add
program
  .command("add")
  .alias("a")
  .description("Add an existing stagehand application")
  .action(add);

program.parse(process.argv);

