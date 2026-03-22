# 🤖 AI PR Review CLI

An intelligent command-line tool that uses AI to review your code changes and provide instant feedback on issues, typos, and improvements. Perfect for any programming language and project type.

## ✨ Key Features

- 🔍 **Smart Code Analysis** - Uses GPT to find bugs, security issues, and improvements
- 🎯 **Auto Branch Detection** - Automatically detects your base branch (main/master/develop)
- 🔄 **Intelligent Batching** - Processes ALL files in manageable batches (5 files per batch)
- 📊 **No File Limits** - Reviews unlimited files without losing any data
- ⚡ **Rate Limit Protection** - Smart delays between batches prevent API errors
- 🎨 **Beautiful Output** - Clean, colorful results with progress tracking
- 🌍 **Universal Support** - Works with any language, framework, or project type
- ⚙️ **Flexible Config** - Multiple ways to customize behavior
- 🛡️ **Error Recovery** - Continues processing even if one batch fails

## 🚀 Quick Start

### 1. Install
```bash
# Install globally
npm install -g ai-pr-review-cli

# Or use without installing
npx ai-pr-review-cli review
```

### 2. Get OpenAI API Key
Get your API key from [OpenAI](https://platform.openai.com/api-keys)

### 3. Set API Key

**Windows:**
```powershell
# PowerShell - current session
$env:OPENAI_API_KEY="your-api-key-here"

# Permanent (via System Properties > Environment Variables)
# Variable name: OPENAI_API_KEY
# Variable value: your-api-key-here
```

**Mac/Linux:**
```bash
# Current session
export OPENAI_API_KEY="your-api-key-here"

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.bashrc
```

### 4. Use in Any Git Repository
```bash
# Navigate to your project
cd my-project

# Review your changes
ai-pr-review review

# Short alias also works
aipr review
```

## 💻 Usage Examples

### Small Projects
```bash
# Simple review - auto-detects base branch
ai-pr-review review

# Review against specific branch
ai-pr-review review --base main

# Use GPT-4 for higher quality
ai-pr-review review --model gpt-4o
```

### Large Projects (Multiple Approaches)

**Method 1: Automatic Batching (Built-in)**
```bash
# The standard review now automatically batches files
ai-pr-review review  # Processes ALL files in batches of 5

# With verbose output to see batching progress
ai-pr-review review --verbose
```

**Method 2: Advanced Batch Mode**
```bash
# Smart batching by file type (React, Vue, Angular, etc.)
ai-pr-review batch --frontend

# Custom batch size for different project needs
ai-pr-review batch --batch-size 6

# Preview what would be reviewed (no API calls)
ai-pr-review batch --dry-run
```

**Method 3: Selective Review**
```bash
# Review only specific files
git add src/important-file.js src/critical-component.js
ai-pr-review review  # Only reviews staged files
```

## 📋 Common Workflows

### Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes, then review before committing
ai-pr-review review

# Address feedback, then commit
git add .
git commit -m "Implement new feature"
```

### Large Codebase Updates
```bash
# Stage all changes
git add .

# Smart automatic batching handles everything
ai-pr-review review --verbose

# Example output for 23 files:
# 🔄 Processing 5 batches of files (5 files per batch)...
# --- Batch 1/5 ---
# Files: auth.js, login.js, middleware.js, routes.js, config.js
# ✅ Batch 1 completed: 3 issues, 1 typo, 4 improvements
# ⏳ Waiting 3 seconds before next batch...
# [continues for all batches...]

# Final consolidated results:
# 🚨 Issues: bugs, security, performance  
# ✏️ Typos: spelling, grammar
# 💡 Improvements: best practices, refactoring
```

### Different Project Types
```bash
# Works automatically for any project:
cd react-frontend && ai-pr-review batch --frontend
cd node-api && ai-pr-review batch  
cd python-ml && ai-pr-review batch
cd java-enterprise && ai-pr-review batch
cd devops-terraform && ai-pr-review batch
```

## ⚙️ Configuration Options

### Global Config (One-time Setup)
```bash
# Set default preferences
ai-pr-review config --model gpt-4o-mini --base main

# Creates ~/.aiprconfig.json with your defaults
```

### Project Config (.aiprconfig.json)
```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "baseBranch": "develop"
}
```

### Command Line Options
| Option | Description | Example |
|--------|-------------|---------|
| `--base <branch>` | Compare against specific branch | `--base origin/develop` |
| `--model <model>` | Use specific AI model | `--model gpt-4o` |
| `--verbose` | Show detailed analysis info | `--verbose` |
| `--batch-size <n>` | Files per batch (default: 8) | `--batch-size 4` |
| `--frontend` | Optimize for frontend projects | `--frontend` |
| `--dry-run` | Preview without API calls | `--dry-run` |

## 🎯 What Gets Analyzed

### Code Changes
- ✅ **Committed changes** (between branches)
- ✅ **Staged changes** (`git add`)
- ✅ **Working directory changes** (uncommitted)

### File Types Supported
- **Web**: JavaScript, TypeScript, HTML, CSS, SCSS
- **Backend**: Python, Java, Go, Ruby, PHP, C#
- **Mobile**: React Native, Flutter, Swift, Kotlin
- **DevOps**: Terraform, Docker, Kubernetes, YAML
- **Data**: SQL, R, Jupyter notebooks
- **Config**: JSON, YAML, TOML, XML
- **Documentation**: Markdown, reStructuredText

## 🔄 How Batching Works

### Automatic Batching (Default)
The tool automatically processes files in batches to handle any number of files efficiently:

```bash
ai-pr-review review  # Automatically batches files

# Example with 23 files:
📁 Found 23 changed files: auth.js, login.js, config.js...

🔄 Processing 5 batches of files (5 files per batch)...

--- Batch 1/5 ---
Files: auth.js, login.js, middleware.js, routes.js, config.js
✅ Batch 1 completed: 3 issues, 1 typo, 4 improvements
⏳ Waiting 3 seconds before next batch...

--- Batch 2/5 ---
Files: utils.js, helpers.js, constants.js, api.js, db.js
✅ Batch 2 completed: 2 issues, 0 typos, 3 improvements
⏳ Waiting 3 seconds before next batch...

[... continues for all files ...]

📋 Final Summary: 12 issues, 4 typos, 18 improvements
```

### Benefits
- ✅ **No File Limits** - Reviews unlimited files
- ✅ **Rate Limit Safe** - 3-second delays prevent API errors  
- ✅ **Progress Tracking** - See which batch is processing
- ✅ **Error Recovery** - If one batch fails, others continue
- ✅ **Memory Efficient** - Processes files in manageable chunks

## 🔧 Troubleshooting

### Rate Limit Errors (429)
```bash
# The tool now automatically handles rate limits with batching
ai-pr-review review  # Built-in 3-second delays between batches

# For very large projects, use advanced batch mode
ai-pr-review batch --batch-size 3  # Smaller batches

# Or wait 1-2 minutes and retry
ai-pr-review review

# Consider upgrading OpenAI plan for higher limits
```

### No Changes Found
```bash
# Check git status
git status

# Make sure you're not on the main branch
git checkout -b feature/my-changes

# Or specify different base branch
ai-pr-review review --base origin/master
```

### API Key Issues
```bash
# Verify key is set
echo $OPENAI_API_KEY  # Mac/Linux
echo $env:OPENAI_API_KEY  # Windows PowerShell

# Test with simple review
ai-pr-review review --verbose
```

## 💡 Pro Tips

### Efficient Workflows
```bash
# Review before committing
git add changed-files/
ai-pr-review review
# Fix issues, then commit

# Review large changes in batches
ai-pr-review batch --dry-run  # Preview
ai-pr-review batch            # Execute
```

### Cost Optimization
```bash
# Use mini model for regular reviews (cheaper)
ai-pr-review review --model gpt-4o-mini

# Use GPT-4 for critical reviews (more thorough)
ai-pr-review review --model gpt-4o

# Set as default
ai-pr-review config --model gpt-4o-mini
```

### Shell Aliases
```bash
# Add to ~/.bashrc or ~/.zshrc
alias review="ai-pr-review review"
alias batch-review="ai-pr-review batch"
alias quick-review="ai-pr-review review --model gpt-4o-mini"

# Usage
review --base develop
batch-review --frontend
quick-review
```

## 🌍 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| **GitHub** | ✅ | Full support |
| **GitLab** | ✅ | Full support |  
| **Bitbucket** | ✅ | Full support |
| **Azure DevOps** | ✅ | Full support |
| **Local Git** | ✅ | Works without remote |

## 📊 Sample Output

### Single File Review
```bash
git add problematic-file.js
ai-pr-review review

🤖 AI PR Review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Analyzing changes on branch: feature/auth-fixes
📁 Found 1 changed file: problematic-file.js

🔄 Processing 1 batch of files (5 files per batch)...

--- Batch 1/1 ---
Files: problematic-file.js
✅ Batch 1 completed: 3 issues, 1 typo, 2 improvements
✔ Review completed!

🚨 Issues
  1. Invalid JavaScript syntax: unexpected semicolon and commas
  2. Missing input validation for user input
  3. Use const instead of var for better scoping

✏️ Typos  
  1. "recieve" should be "receive" in comment

💡 Improvements
  1. Add proper error handling
  2. Remove unused variables

📋 Review Summary: 3 issues, 1 typo, 2 improvements
```

### Large Project Review
```bash
git add .  # 23 files
ai-pr-review review --verbose

🤖 AI PR Review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Analyzing changes on branch: feature/auth-system
📁 Found 23 changed files: auth.js, login.js, middleware.js, routes.js...

🔄 Processing 5 batches of files (5 files per batch)...

--- Batch 1/5 ---
Files: auth.js, login.js, middleware.js, routes.js, config.js
🔍 Debug - Files with content:
  1. auth.js (1,240 chars): "const jwt = require('jsonwebtoken'); const bcrypt..."
  2. login.js (856 chars): "// Login component with validation..."
✅ Batch 1 completed: 4 issues, 1 typo, 3 improvements
⏳ Waiting 3 seconds before next batch...

--- Batch 2/5 ---
Files: utils.js, helpers.js, constants.js, api.js, db.js
✅ Batch 2 completed: 2 issues, 0 typos, 4 improvements
⏳ Waiting 3 seconds before next batch...

[... continues for all 5 batches ...]

✔ Review completed!

🚨 Issues
  1. Missing input validation in auth.js:15
  2. Potential SQL injection in routes.js:42
  3. Password stored in plain text - use bcrypt
  [... 9 more issues ...]

✏️ Typos  
  1. "recieve" should be "receive" in comment (auth.js:8)
  [... 2 more typos ...]

💡 Improvements
  1. Add rate limiting to login endpoint
  2. Use environment variables for JWT secret
  [... 16 more improvements ...]

📋 Review Summary: 12 issues, 3 typos, 19 improvements
```

## 🔐 Security & Privacy

- Code is sent to OpenAI's API for analysis
- No permanent storage of your code
- Use `.gitignore` to exclude sensitive files
- Review OpenAI's [data usage policies](https://openai.com/policies/api-data-usage-policies)
- Consider using on non-production codebases first

## 📊 Performance for Any Repository Size

### Smart Handling of Large Codebases
| Repository Size | Processing Method | Time | Success Rate |
|----------------|------------------|------|--------------|
| **1-5 files** | Single batch | ~10 seconds | ✅ 100% |
| **6-25 files** | 2-5 batches | ~30-60 seconds | ✅ 100% |
| **26-100 files** | 5-20 batches | 2-5 minutes | ✅ 100% |
| **100+ files** | Smart batching | 5-15 minutes | ✅ 100% |

### Before vs After
- **Old Approach**: Limited to 10 files = Many files ignored ❌
- **New Approach**: Unlimited files in smart batches = All files reviewed ✅

### Real-World Examples
```bash
# Small project (5 files)
📁 Found 5 files → 🔄 1 batch → ✅ ~15 seconds

# Medium project (23 files)  
📁 Found 23 files → 🔄 5 batches → ✅ ~90 seconds

# Large project (87 files)
📁 Found 87 files → 🔄 18 batches → ✅ ~8 minutes

# Enterprise project (200+ files)
📁 Found 234 files → 🔄 47 batches → ✅ ~15 minutes
```

### Efficiency Features
- ✅ **No File Limits** - Review unlimited files
- ✅ **Smart Rate Limiting** (3-second delays between batches)
- ✅ **Progress Tracking** for long reviews
- ✅ **Error Recovery** - continues even if one batch fails
- ✅ **Memory Efficient** - processes in manageable chunks

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs or request features
- Submit pull requests
- Improve documentation
- Share usage examples

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/blockDeepanshu/ai-pr-review/issues)
- **Discussions**: [GitHub Discussions](https://github.com/blockDeepanshu/ai-pr-review/discussions)

---

**Made with ❤️ for developers who want smarter code reviews**

*Save time, catch bugs, and improve code quality with AI-powered reviews* 🚀