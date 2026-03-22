const { getDiff, getChangedFiles, readFiles, getCurrentBranch, checkBranchExists, detectBaseBranch } = require("./git");
const { buildPrompt } = require("./prompt");
const { runAI } = require("./ai");
const { getConfig } = require("./config");

async function reviewFileBatch(files, diff, config, batchIndex, totalBatches, options) {
  const { default: chalk } = await import("chalk");
  
  console.log(chalk.gray(`\n--- Batch ${batchIndex + 1}/${totalBatches} ---`));
  console.log(chalk.gray(`Files: ${files.map(f => f.name).join(', ')}`));
  
  if (options.verbose) {
    console.log(chalk.gray('\n🔍 Debug - Files with content:'));
    files.forEach((f, i) => {
      console.log(chalk.gray(`  ${i + 1}. ${f.name} (${f.content.length} chars): "${f.content.substring(0, 50)}..."`));
    });
  }
  
  const prompt = buildPrompt(diff, files);
  
  if (options.verbose) {
    console.log(chalk.gray(`\n📝 Debug - Prompt length: ${prompt.length} characters`));
  }
  
  try {
    const result = await runAI(prompt, config);
    
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (jsonError) {
      // Try to extract JSON from response
      const jsonMatch = result.match(/\{[\s\S]*?"issues"[\s\S]*?"typos"[\s\S]*?"improvements"[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          parsed = {
            issues: [`Batch ${batchIndex + 1}: JSON parsing failed. Response: ${result.substring(0, 200)}...`],
            typos: [], improvements: []
          };
        }
      } else {
        parsed = {
          issues: [`Batch ${batchIndex + 1}: AI response format error. Response: ${result.substring(0, 200)}...`],
          typos: [], improvements: []
        };
      }
    }
    
    // Ensure structure
    if (!parsed.issues) parsed.issues = [];
    if (!parsed.typos) parsed.typos = [];
    if (!parsed.improvements) parsed.improvements = [];
    
    console.log(chalk.green(`✅ Batch ${batchIndex + 1} completed: ${parsed.issues.length} issues, ${parsed.typos.length} typos, ${parsed.improvements.length} improvements`));
    
    return parsed;
  } catch (error) {
    console.log(chalk.red(`❌ Batch ${batchIndex + 1} failed: ${error.message}`));
    return { issues: [`Batch ${batchIndex + 1} failed: ${error.message}`], typos: [], improvements: [] };
  }
}

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
    
    console.log(chalk.green(`📁 Found ${changedFiles.length} changed file${changedFiles.length === 1 ? '' : 's'}: ${chalk.bold(changedFiles.join(', '))}`));
    
    if (changedFiles.length === 0 && diff.length === 0) {
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
    
    // Process files in batches to avoid rate limits
    const BATCH_SIZE = 5;
    const fileBatches = [];
    
    // Split files into batches and read their content
    for (let i = 0; i < changedFiles.length; i += BATCH_SIZE) {
      const batchFileNames = changedFiles.slice(i, i + BATCH_SIZE);
      const batchFiles = readFiles(batchFileNames);
      if (batchFiles.length > 0) {
        fileBatches.push(batchFiles);
      }
    }
    
    if (fileBatches.length === 0) {
      spinner.info(chalk.yellow('No valid files to review'));
      return;
    }
    
    console.log(chalk.blue(`\n🔄 Processing ${fileBatches.length} batch${fileBatches.length === 1 ? '' : 'es'} of files (${BATCH_SIZE} files per batch)...`));
    
    // Process each batch
    const allResults = { issues: [], typos: [], improvements: [] };
    
    for (let batchIndex = 0; batchIndex < fileBatches.length; batchIndex++) {
      const files = fileBatches[batchIndex];
      
      spinner.text = `🤖 AI is analyzing batch ${batchIndex + 1}/${fileBatches.length}...`;
      
      const batchResult = await reviewFileBatch(files, diff, config, batchIndex, fileBatches.length, options);
      
      // Combine results
      allResults.issues.push(...batchResult.issues);
      allResults.typos.push(...batchResult.typos);
      allResults.improvements.push(...batchResult.improvements);
      
      // Wait between batches (except for last batch)
      if (batchIndex < fileBatches.length - 1) {
        console.log(chalk.gray('⏳ Waiting 3 seconds before next batch...'));
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    const parsed = allResults;
    

    console.log(chalk.green(`📁 Found ${changedFiles.length} changed file${changedFiles.length === 1 ? '' : 's'}: ${chalk.bold(changedFiles.join(', '))}`));

    spinner.succeed(chalk.green('Review completed!'));

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
