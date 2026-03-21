const { getDiff, getChangedFiles, readFiles, getCurrentBranch, checkBranchExists, detectBaseBranch } = require("./git");
const { buildPrompt } = require("./prompt");
const { runAI } = require("./ai");
const { getConfig } = require("./config");

async function review(options = {}) {
  const { default: ora } = await import("ora");
  const { default: chalk } = await import("chalk");
  
  const spinner = ora("🤖 AI is analyzing your code changes...").start();

  try {
    // Merge config with CLI options
    const baseConfig = getConfig();
    const config = {
      ...baseConfig,
      ...(options.provider && { provider: options.provider }),
      ...(options.model && { model: options.model })
    };

    // Determine base branch: CLI option > config file > auto-detection
    let baseBranch = options.base || config.baseBranch;
    
    if (!baseBranch) {
      if (options.verbose) console.log(chalk.gray("🔍 Auto-detecting base branch..."));
      baseBranch = await detectBaseBranch();
    }

    // Get current git status  
    const currentBranch = await getCurrentBranch();
    const baseBranchExists = await checkBranchExists(baseBranch);

    console.log(chalk.blue(`\n📊 Analyzing changes on branch: ${chalk.bold(currentBranch)}`));
    if (options.verbose || !baseBranchExists) {
      console.log(chalk.gray(`   Comparing against: ${baseBranch} ${baseBranchExists ? '✓' : '❌'}`));
    }

    const diff = await getDiff(baseBranch);
    const changedFiles = await getChangedFiles(baseBranch);
    const files = readFiles(changedFiles);
    
    if (files.length === 0 && diff.length === 0) {
      spinner.info(chalk.yellow('No changes found to review'));
      
      console.log(chalk.yellow('\n💡 Possible reasons:'));
      if (currentBranch === baseBranch.replace('origin/', '')) {
        console.log(chalk.gray('  • You are currently on the base branch. Create a feature branch first.'));
      }
      if (!baseBranchExists) {
        console.log(chalk.gray('  • The base branch does not exist. Try "main", "master", or "origin/master".'));
      }
      console.log(chalk.gray('  • No commits made yet on this branch.'));
      console.log(chalk.gray('  • Try: git fetch origin (to update remote branches)'));
      console.log(chalk.gray('  • Try: git status (to see uncommitted changes)'));
      
      return;
    }

    console.log(chalk.green(`📁 Found ${changedFiles.length} changed file${changedFiles.length === 1 ? '' : 's'}: ${chalk.bold(changedFiles.join(', '))}`));

    const prompt = buildPrompt(diff, files);
    const result = await runAI(prompt, config);

    spinner.succeed(chalk.green('Review completed!'));
    
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (jsonError) {
      // Try multiple strategies to extract JSON
      let jsonText = null;
      
      // Strategy 1: Find JSON object with proper structure
      const jsonMatch = result.match(/\{[\s\S]*?"issues"[\s\S]*?"typos"[\s\S]*?"improvements"[\s\S]*?\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      } else {
        // Strategy 2: Find any JSON object
        const anyJsonMatch = result.match(/\{[\s\S]*?\}/);
        if (anyJsonMatch) {
          jsonText = anyJsonMatch[0];
        }
      }
      
      if (jsonText) {
        try {
          parsed = JSON.parse(jsonText);
          // Ensure required structure
          if (!parsed.issues) parsed.issues = [];
          if (!parsed.typos) parsed.typos = [];
          if (!parsed.improvements) parsed.improvements = [];
        } catch (extractError) {
          // Create fallback response
          parsed = {
            issues: [`JSON parsing failed. Raw AI response: ${result.substring(0, 200)}...`],
            typos: [],
            improvements: []
          };
        }
      } else {
        // No JSON found at all - create fallback response
        parsed = {
          issues: [`AI response format error. Response: ${result.substring(0, 200)}...`],
          typos: [],
          improvements: []
        };
      }
    }

    // Display results with better formatting
    console.log(chalk.red.bold("\n🚨 Issues"));
    if (parsed.issues.length === 0) {
      console.log(chalk.gray("  No critical issues found"));
    } else {
      parsed.issues.forEach((i, index) => 
        console.log(chalk.red(`  ${index + 1}. ${i}`))
      );
    }

    console.log(chalk.yellow.bold("\n✏️  Typos"));
    if (parsed.typos.length === 0) {
      console.log(chalk.gray("  No typos found"));
    } else {
      parsed.typos.forEach((t, index) => 
        console.log(chalk.yellow(`  ${index + 1}. ${t}`))
      );
    }

    console.log(chalk.cyan.bold("\n💡 Improvements"));
    if (parsed.improvements.length === 0) {
      console.log(chalk.gray("  No improvement suggestions"));
    } else {
      parsed.improvements.forEach((i, index) => 
        console.log(chalk.cyan(`  ${index + 1}. ${i}`))
      );
    }

    // Summary
    const totalCount = parsed.issues.length + parsed.typos.length + parsed.improvements.length;
    if (totalCount === 0) {
      console.log(chalk.green.bold("\n✨ Great job! Your code looks clean and well-written."));
    } else {
      console.log(chalk.blue(`\n📋 Review Summary: ${parsed.issues.length} issues, ${parsed.typos.length} typos, ${parsed.improvements.length} improvements`));
    }
  } catch (e) {
    spinner.fail(chalk.red("Review failed"));
    console.error(chalk.red(`❌ Error: ${e.message}`));
  }
}

module.exports = review;
