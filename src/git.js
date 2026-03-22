const simpleGit = require("simple-git");
const fs = require("fs");

const git = simpleGit();

async function getCurrentBranch() {
  try {
    const status = await git.status();
    return status.current;
  } catch (error) {
    return 'unknown';
  }
}

async function checkBranchExists(branchName) {
  try {
    await git.raw(['rev-parse', '--verify', branchName]);
    return true;
  } catch (error) {
    return false;
  }
}

async function detectBaseBranch() {
  // List of common base branch names in order of preference
  const commonBranches = [
    'origin/main',
    'origin/master', 
    'origin/develop',
    'main',
    'master',
    'develop'
  ];

  for (const branch of commonBranches) {
    if (await checkBranchExists(branch)) {
      return branch;
    }
  }

  // Fallback to HEAD~1 if no common branch found
  return 'HEAD~1';
}

async function getAllBranches() {
  try {
    const result = await git.branch(['-a']);
    return result.all;
  } catch (error) {
    return [];
  }
}

async function getDiff(baseBranch) {
  try {
    // First try the original approach
    const committedDiff = await git.diff([`${baseBranch}...HEAD`]);
    
    // Also check for working directory changes
    const workingDiff = await git.diff();
    const stagedDiff = await git.diff(['--cached']);
    
    // Combine all diffs
    const totalDiff = [committedDiff, workingDiff, stagedDiff].filter(d => d.length > 0).join('\n\n--- NEXT DIFF SECTION ---\n\n');
    
    // Limit diff size to prevent rate limit issues
    const maxDiffLength = 10000;
    if (totalDiff.length > maxDiffLength) {
      console.warn(`⚠️  Large diff detected (${totalDiff.length} chars). Truncating to ${maxDiffLength} chars to avoid rate limits.`);
      return totalDiff.slice(0, maxDiffLength) + '\n\n[... diff truncated to avoid rate limits ...]';
    }
    
    return totalDiff;
  } catch (error) {
    // Silently try alternative approaches
    
    try {
      // Try diffing against the previous commit
      return await git.diff(['HEAD~1']);
    } catch (error2) {
      try {
        // Fallback: show changes in working directory and staged changes
        const workingDiff = await git.diff();
        const stagedDiff = await git.diff(['--cached']);
        return workingDiff + '\n' + stagedDiff;
      } catch (error3) {
        return '';
      }
    }
  }
}

async function getChangedFiles(baseBranch) {
  try {
    // Get committed changes
    const committedSummary = await git.diffSummary([`${baseBranch}...HEAD`]);
    const committedFiles = committedSummary.files.map((f) => f.file);
    
    // Also check for working directory changes
    const workingSummary = await git.diffSummary();
    const workingFiles = workingSummary.files.map((f) => f.file);
    
    // Also check for staged changes
    const stagedSummary = await git.diffSummary(['--cached']);
    const stagedFiles = stagedSummary.files.map((f) => f.file);
    
    // Combine all changed files (remove duplicates)
    const allFiles = [...new Set([...committedFiles, ...workingFiles, ...stagedFiles])];
    
    return allFiles;
  } catch (error) {
    // Try alternatives silently
    
    try {
      // Try diffing against the previous commit
      const summary = await git.diffSummary(['HEAD~1']);
      return summary.files.map((f) => f.file);
    } catch (error2) {
      try {
        // Fallback: show changes in working directory
        const summary = await git.diffSummary();
        return summary.files.map((f) => f.file);
      } catch (error3) {
        // Return all JavaScript/TypeScript files in src directory
        const files = [];
        if (fs.existsSync('src')) {
          const srcFiles = fs.readdirSync('src', { recursive: true });
          files.push(...srcFiles
            .filter(f => typeof f === 'string' && (f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.tsx')))
            .map(f => `src/${f}`)
          );
        }
        // Also check root directory for common files
        const rootFiles = ['package.json', 'README.md', 'index.js', 'app.js', 'server.js'];
        rootFiles.forEach(file => {
          if (fs.existsSync(file)) {
            files.push(file);
          }
        });
        return files;
      }
    }
  }
}

function readFiles(files, batchSize = 5) {
  // Don't limit files here - let the caller handle batching
  // This function should read ALL requested files
  
  return files
    .filter((f) => fs.existsSync(f))
    .filter((f) => {
      // Skip large generated files common in frontend projects
      const skipPatterns = [
        /node_modules/,
        /\.git/,
        /dist\//,
        /build\//,
        /public\/.*\.(js|css)$/,  // Built assets
        /\.min\.(js|css)$/,       // Minified files
        /bundle.*\.js$/,          // Webpack bundles
        /chunk.*\.js$/,           // Code-split chunks
        /vendor.*\.js$/,          // Vendor bundles
        /\.map$/,                 // Source maps
        /coverage\//,             // Test coverage
        /\.lock$/,                // Lock files
        /\.log$/                  // Log files
      ];
      
      return !skipPatterns.some(pattern => pattern.test(f));
    })
    .map((file) => {
      let content = fs.readFileSync(file, "utf-8");
      
      // Special handling for package-lock.json (huge files)
      if (file.includes('package-lock.json')) {
        const lines = content.split('\n');
        if (lines.length > 50) {
          content = lines.slice(0, 30).join('\n') + '\n... [truncated large package-lock.json]';
        }
      }
      
      return {
        name: file,
        content: content.slice(0, 3000),
      };
    });
}

module.exports = { getDiff, getChangedFiles, readFiles, getCurrentBranch, checkBranchExists, detectBaseBranch, getAllBranches };
