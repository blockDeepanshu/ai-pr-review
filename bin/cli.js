#!/usr/bin/env node

const { Command } = require("commander");
const review = require("../src/reviewer");
const { createGlobalConfig } = require("../src/config");

const program = new Command();

program
  .name("ai-pr-review")
  .description("🤖 AI-powered Pull Request reviewer")
  .version("1.0.0");

program
  .command("review")
  .description("🔍 Review current branch changes with AI")
  .option("-b, --base <branch>", "Base branch to compare against (e.g., main, origin/main, develop)")
  .option("-m, --model <model>", "AI model to use (default: gpt-4o-mini)")
  .option("--provider <provider>", "AI provider (default: openai)")
  .option("-v, --verbose", "Show detailed output")
  .action(async (options) => {
    // Show a nice header
    const { default: chalk } = await import("chalk");
    console.log(chalk.blue.bold("\n🤖 AI PR Review"));
    console.log(chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
    
    await review(options);
  });

program
  .command("config")
  .description("⚙️  Set up global configuration")
  .option("-m, --model <model>", "Default AI model to use")
  .option("-b, --base <branch>", "Default base branch")
  .option("--provider <provider>", "Default AI provider")
  .action(async (options) => {
    const { default: chalk } = await import("chalk");
    
    if (Object.keys(options).length === 0) {
      console.log(chalk.yellow("Please specify configuration options:"));
      console.log(chalk.gray("  ai-pr-review config --model gpt-4o-mini --base main"));
      console.log(chalk.gray("  ai-pr-review config --provider openai"));
      return;
    }

    try {
      const configPath = createGlobalConfig(options);
      console.log(chalk.green("✅ Global configuration saved!"));
      console.log(chalk.gray(`   Config file: ${configPath}`));
      
      if (options.model) console.log(chalk.blue(`   Default model: ${options.model}`));
      if (options.provider) console.log(chalk.blue(`   Default provider: ${options.provider}`));
      if (options.base) console.log(chalk.blue(`   Default base branch: ${options.base}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to save configuration: ${error.message}`));
    }
  });

program
  .command("batch")
  .description("🔄 Review large repositories in batches to avoid rate limits")
  .option("--dry-run", "Show what would be reviewed without actually running AI review")
  .option("--frontend", "Optimize batching for frontend projects (React, Vue, Angular)")
  .option("--batch-size <number>", "Number of files per batch (default: 8)", "8")
  .action(async (options) => {
    const { default: chalk } = await import("chalk");
    console.log(chalk.blue.bold("\n🔄 Batch AI Review"));
    console.log(chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
    
    try {
      const { spawn } = require('child_process');
      const path = require('path');
      const batchScriptPath = path.join(__dirname, '..', 'batch-review.js');
      
      const args = [batchScriptPath];
      if (options.dryRun) {
        args.push('--dry-run');
      }
      if (options.frontend) {
        args.push('--frontend');
      }
      if (options.batchSize) {
        args.push('--batch-size', options.batchSize);
      }
      
      const child = spawn('node', args, { stdio: 'inherit' });
      child.on('close', (code) => {
        if (code !== 0) {
          console.error(chalk.red(`\n❌ Batch review exited with code ${code}`));
        }
      });
    } catch (error) {
      console.error(chalk.red(`❌ Failed to run batch review: ${error.message}`));
    }
  });

// Also support direct usage without subcommand
program
  .option("-b, --base <branch>", "Base branch to compare against")
  .option("-m, --model <model>", "AI model to use")
  .option("--provider <provider>", "AI provider")  
  .option("-v, --verbose", "Show detailed output")
  .action(async (options) => {
    // If no specific command was run, default to review
    if (process.argv.length > 2 && !process.argv.includes('review')) {
      const { default: chalk } = await import("chalk");
      console.log(chalk.blue.bold("\n🤖 AI PR Review"));
      console.log(chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
      await review(options);
    }
  });

program.parse();
