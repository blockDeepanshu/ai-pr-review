#!/usr/bin/env node

const { Command } = require("commander");
const review = require("../src/reviewer");

const program = new Command();

program
  .command("review")
  .description("Review current PR")
  .action(async () => {
    await review();
  });

program.parse();
