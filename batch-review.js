#!/usr/bin/env node

/**
 * Batch Review Script
 * Automatically reviews large repositories in chunks to avoid rate limits
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function batchReview() {
  const isFrontend = process.argv.includes('--frontend');
  const batchSizeArg = process.argv.indexOf('--batch-size');
  const defaultBatchSize = batchSizeArg > -1 ? parseInt(process.argv[batchSizeArg + 1]) : 8;
  
  console.log('🤖 Starting Batch AI Review...\n');
  if (isFrontend) {
    console.log('🎨 Frontend optimization enabled');
  }
  console.log('DEBUG: Current directory:', process.cwd());
  console.log('DEBUG: Default batch size:', defaultBatchSize);

  try {
    // Get all changed files (both staged and unstaged)
    let changedFiles = [];
    try {
      // Try staged files first
      const staged = execSync('git diff --name-only --cached', { encoding: 'utf-8' })
        .split('\n')
        .filter(f => f.trim().length > 0);
      
      // Try unstaged files
      const unstaged = execSync('git diff --name-only', { encoding: 'utf-8' })
        .split('\n')
        .filter(f => f.trim().length > 0);
      
      // Combine and deduplicate
      changedFiles = [...new Set([...staged, ...unstaged])];
      
      console.log('DEBUG: Staged files:', staged);
      console.log('DEBUG: Unstaged files:', unstaged);
    } catch (error) {
      console.log('DEBUG: Git diff failed:', error.message);
    }

    if (changedFiles.length === 0) {
      console.log('❌ No changes detected. Nothing to review.');
      console.log('\n💡 To include files for review:');
      console.log('   git add your-file.js        # Stage specific file');
      console.log('   git add .                   # Stage all changes');
      console.log('   git status                  # See what can be staged');
      console.log('\n🔍 The tool reviews:');
      console.log('   • Staged files (git add)');
      console.log('   • Uncommitted changes');
      console.log('   • Commits since base branch');
      return;
    }

    console.log(`📁 Found ${changedFiles.length} changed files`);
    console.log('Files:', changedFiles.join(', '));

    // Group files by type/directory for logical batching
    const batches = createBatches(changedFiles, defaultBatchSize, isFrontend);

    console.log(`\n🔄 Creating ${batches.length} review batches...\n`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`--- Batch ${i + 1}/${batches.length}: ${batch.name} ---`);
      console.log(`Files: ${batch.files.join(', ')}`);

      // Stage only these files
      execSync('git reset'); // Clear staging area
      batch.files.forEach(file => {
        try {
          execSync(`git add "${file}"`);
        } catch (error) {
          console.log(`⚠️  Could not add ${file}: ${error.message}`);
        }
      });

      // Review this batch
      try {
        console.log('🔍 Reviewing...');
        
        // Check if we're in dry-run mode
        const isDryRun = process.argv.includes('--dry-run');
        
        if (isDryRun) {
          console.log('DRY RUN: Would run: node bin/cli.js review');
          console.log('DRY RUN: Simulating AI review...\n');
        } else {
          // Use the local development version instead of global npm package
          const path = require('path');
          const cliPath = path.join(__dirname, 'bin', 'cli.js');
          execSync(`node "${cliPath}" review`, { stdio: 'inherit' });
        }
      } catch (error) {
        console.log(`❌ Review failed for batch ${i + 1}: ${error.message}`);
        console.log('⏳ Waiting 30 seconds before continuing...\n');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }

      console.log('\n');

      // Wait between batches to respect rate limits
      if (i < batches.length - 1) {
        console.log('⏳ Waiting 10 seconds before next batch...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    // Reset staging area
    execSync('git reset');
    console.log('✅ Batch review completed!');
    console.log('💡 Remember to stage and commit your changes after addressing feedback.');

  } catch (error) {
    console.error('❌ Batch review failed:', error.message);
  }
}

function createBatches(files, batchSize = 8, isFrontend = false) {
  const batches = [];
  
  // Filter out files we should skip entirely
  const filteredFiles = files.filter(f => {
    const skipPatterns = [
      /node_modules/,
      /\.git/,
      /dist\//,
      /build\//,
      /coverage\//,
      /\.min\.(js|css)$/,
      /bundle.*\.js$/,
      /chunk.*\.js$/,
      /\.map$/,
      /\.log$/
    ];
    return !skipPatterns.some(pattern => pattern.test(f));
  });
  
  // Universal grouping (works for all project types)
  let groups;
  
  if (isFrontend) {
    // Frontend-specific grouping
    groups = createFrontendGroups(filteredFiles);
  } else {
    // Universal grouping for all project types
    groups = createUniversalGroups(filteredFiles);
  }

  // Create batches from groups with dynamic batch sizes
  Object.entries(groups).forEach(([groupName, groupFiles]) => {
    if (groupFiles.length === 0) return;

    // Adjust batch size based on file type and frontend optimization
    let dynamicBatchSize = batchSize;
    
    if (isFrontend) {
      // Frontend-optimized batch sizes
      if (groupName === 'packageLock') {
        dynamicBatchSize = 1; // Package-lock is huge, review alone
      } else if (groupName === 'styles') {
        dynamicBatchSize = 15; // CSS files are usually smaller in frontend
      } else if (groupName === 'components') {
        dynamicBatchSize = 5; // React/Vue components can be complex
      } else if (groupName === 'pages') {
        dynamicBatchSize = 4; // Pages are usually larger/complex
      } else if (groupName === 'hooks') {
        dynamicBatchSize = 8; // Hooks are typically focused
      } else if (groupName === 'utils') {
        dynamicBatchSize = 10; // Utility functions are usually small
      } else if (groupName === 'config') {
        dynamicBatchSize = 12; // Config files are small
      } else if (groupName === 'tests') {
        dynamicBatchSize = 6; // Test files can be substantial
      }
    } else {
      // Universal batch sizes for all project types
      if (groupName === 'lockFiles') {
        dynamicBatchSize = 1; // Lock files are huge, review alone
      } else if (groupName === 'api') {
        dynamicBatchSize = 6; // API endpoints can be complex
      } else if (groupName === 'services') {
        dynamicBatchSize = 5; // Services contain business logic
      } else if (groupName === 'models') {
        dynamicBatchSize = 8; // Models are usually focused
      } else if (groupName === 'frontend') {
        dynamicBatchSize = 6; // Frontend components in full-stack
      } else if (groupName === 'utils') {
        dynamicBatchSize = 10; // Utility functions are usually small
      } else if (groupName === 'tests') {
        dynamicBatchSize = 8; // Test files vary in size
      } else if (groupName === 'config') {
        dynamicBatchSize = 12; // Config files are typically small
      } else if (groupName === 'infrastructure') {
        dynamicBatchSize = 7; // Infrastructure files can be complex
      } else if (groupName === 'scripts') {
        dynamicBatchSize = 10; // Scripts are usually focused
      } else if (groupName === 'docs') {
        dynamicBatchSize = 15; // Documentation files are usually text
      } else if (groupName === 'styles') {
        dynamicBatchSize = 12; // CSS files
      }
    }

    // Split large groups into smaller batches
    for (let i = 0; i < groupFiles.length; i += dynamicBatchSize) {
      const batchFiles = groupFiles.slice(i, i + dynamicBatchSize);
      const batchNumber = Math.floor(i / dynamicBatchSize) + 1;
      const name = groupFiles.length > dynamicBatchSize 
        ? `${groupName} (batch ${batchNumber})`
        : groupName;
      
      batches.push({
        name,
        files: batchFiles
      });
    }
  });

  // Sort batches by priority (most important first)
  const priorityOrder = isFrontend ? [
    'components', 'pages', 'hooks', 'utils', 'config', 
    'styles', 'tests', 'assets', 'packageLock', 'docs', 'other'
  ] : [
    'api', 'services', 'models', 'frontend', 'utils', 'config',
    'tests', 'infrastructure', 'scripts', 'styles', 'lockFiles', 'docs', 'other'
  ];
  
  batches.sort((a, b) => {
    const aPriority = priorityOrder.findIndex(p => a.name.includes(p));
    const bPriority = priorityOrder.findIndex(p => b.name.includes(p));
    return aPriority - bPriority;
  });

  return batches;
}

function createFrontendGroups(filteredFiles) {
  return {
    components: filteredFiles.filter(f => 
      /\.(js|jsx|ts|tsx|vue)$/.test(f) && 
      /\/(components|ui|widgets)\//.test(f)
    ),
    pages: filteredFiles.filter(f => 
      /\.(js|jsx|ts|tsx|vue)$/.test(f) && 
      /\/(pages|views|screens|routes)\//.test(f)
    ),
    hooks: filteredFiles.filter(f => 
      /\.(js|jsx|ts|tsx)$/.test(f) && 
      /\/(hooks|composables|custom)\//.test(f)
    ),
    utils: filteredFiles.filter(f => 
      /\.(js|jsx|ts|tsx)$/.test(f) && 
      /\/(utils|helpers|lib|shared)\//.test(f)
    ),
    styles: filteredFiles.filter(f => 
      /\.(css|scss|sass|less|stylus|module\.css)$/.test(f)
    ),
    config: filteredFiles.filter(f => {
      // Split package.json separately due to size
      if (f.includes('package-lock.json')) return false;
      return /\.(json|yml|yaml|toml|js|ts)$/.test(f) && 
             /(config|settings|env|webpack|vite|rollup|babel)/.test(f);
    }),
    packageLock: filteredFiles.filter(f => f.includes('package-lock.json')),
    tests: filteredFiles.filter(f => 
      /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(f) ||
      /\/__tests__\//.test(f)
    ),
    docs: filteredFiles.filter(f => /\.(md|txt|rst)$/.test(f)),
    assets: filteredFiles.filter(f => 
      /\/(assets|static|public)\/.*\.(js|ts|jsx|tsx|css|scss)$/.test(f)
    ),
    other: filteredFiles.filter(f => {
      const assigned = [
        /(components|ui|widgets|pages|views|screens|routes|hooks|composables|custom|utils|helpers|lib|shared)\//,
        /\.(css|scss|sass|less|stylus|module\.css)$/,
        /(config|settings|env|webpack|vite|rollup|babel)/,
        /package-lock\.json/,
        /\.(test|spec)\.(js|ts|jsx|tsx)$/,
        /\/__tests__\//,
        /\.(md|txt|rst)$/,
        /\/(assets|static|public)\/.*\.(js|ts|jsx|tsx|css|scss)$/
      ];
      return !assigned.some(pattern => pattern.test(f));
    })
  };
  
  return groups;
}

function createUniversalGroups(filteredFiles) {
  return {
    // Backend/API files
    api: filteredFiles.filter(f => 
      /\.(js|ts|py|java|go|rb|php|cs)$/.test(f) && 
      /\/(api|routes|controllers|endpoints|handlers)\//.test(f)
    ),
    
    // Services and business logic
    services: filteredFiles.filter(f => 
      /\.(js|ts|py|java|go|rb|php|cs)$/.test(f) && 
      /\/(services|business|logic|core|domain)\//.test(f)
    ),
    
    // Models and database
    models: filteredFiles.filter(f => 
      /\.(js|ts|py|java|go|rb|php|cs|sql)$/.test(f) && 
      /\/(models|entities|schemas|database|db|migrations)\//.test(f)
    ),
    
    // Frontend components (for full-stack projects)
    frontend: filteredFiles.filter(f => 
      /\.(js|jsx|ts|tsx|vue)$/.test(f) && 
      /\/(components|pages|views|screens|ui)\//.test(f)
    ),
    
    // Utilities and helpers
    utils: filteredFiles.filter(f => 
      /\.(js|ts|py|java|go|rb|php|cs)$/.test(f) && 
      /\/(utils|helpers|lib|shared|common)\//.test(f)
    ),
    
    // Tests
    tests: filteredFiles.filter(f => 
      /\.(test|spec)\.(js|ts|py|java|go|rb|php|cs)$/.test(f) ||
      /\/(tests?|__tests__|spec)\//.test(f) ||
      /test_.*\.py$/.test(f)
    ),
    
    // Configuration files
    config: filteredFiles.filter(f => {
      if (f.includes('package-lock.json') || f.includes('yarn.lock') || f.includes('poetry.lock')) return false;
      return /\.(json|yml|yaml|toml|ini|cfg|conf|properties|xml)$/.test(f) ||
             /(config|settings|env)/.test(f);
    }),
    
    // Lock files (handled separately due to size)
    lockFiles: filteredFiles.filter(f => 
      /\.(lock|lock\.json)$/.test(f) ||
      f.includes('package-lock.json') ||
      f.includes('yarn.lock') ||
      f.includes('poetry.lock') ||
      f.includes('Gemfile.lock')
    ),
    
    // Infrastructure and DevOps
    infrastructure: filteredFiles.filter(f => 
      /\.(tf|yml|yaml)$/.test(f) && /(terraform|ansible|kubernetes|docker|k8s)/.test(f) ||
      /Dockerfile|docker-compose|\.tf$/.test(f)
    ),
    
    // Scripts and automation
    scripts: filteredFiles.filter(f => 
      /\.(sh|bash|ps1|py|rb|js)$/.test(f) && 
      /\/(scripts|bin|tools|automation)\//.test(f) ||
      /Makefile|Rakefile/.test(f)
    ),
    
    // Documentation
    docs: filteredFiles.filter(f => 
      /\.(md|txt|rst|adoc|tex)$/.test(f) ||
      /\/(docs|documentation)\//.test(f) ||
      /README|CHANGELOG|LICENSE/.test(f)
    ),
    
    // Styles (for any project with styling)
    styles: filteredFiles.filter(f => 
      /\.(css|scss|sass|less|stylus)$/.test(f)
    ),
    
    // Other files
    other: filteredFiles.filter(f => {
      const assigned = [
        /\/(api|routes|controllers|endpoints|handlers)\//,
        /\/(services|business|logic|core|domain)\//,
        /\/(models|entities|schemas|database|db|migrations)\//,
        /\/(components|pages|views|screens|ui)\//,
        /\/(utils|helpers|lib|shared|common)\//,
        /\.(test|spec)\.(js|ts|py|java|go|rb|php|cs)$/,
        /\/(tests?|__tests__|spec)\//,
        /test_.*\.py$/,
        /\.(json|yml|yaml|toml|ini|cfg|conf|properties|xml)$/,
        /\.(lock|lock\.json)$/,
        /package-lock\.json|yarn\.lock|poetry\.lock|Gemfile\.lock/,
        /\.(tf|yml|yaml).*terraform|ansible|kubernetes|docker|k8s/,
        /Dockerfile|docker-compose|\.tf$/,
        /\.(sh|bash|ps1|py|rb|js).*\/(scripts|bin|tools|automation)\//,
        /Makefile|Rakefile/,
        /\.(md|txt|rst|adoc|tex)$/,
        /\/(docs|documentation)\//,
        /README|CHANGELOG|LICENSE/,
        /\.(css|scss|sass|less|stylus)$/
      ];
      return !assigned.some(pattern => pattern.test(f));
    })
  };
  
  return groups;
}

// Run the batch review
batchReview().catch(console.error);


