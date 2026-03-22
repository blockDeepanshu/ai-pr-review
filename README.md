# 🤖 AI PR Review CLI

An intelligent command-line tool that uses AI to review your code changes and provide instant feedback on issues, typos, and improvements. Perfect for any programming language and project type.

## ✨ Key Features

- 🔍 **Smart Code Analysis** - Uses GPT to find bugs, security issues, and improvements
- 🎯 **Auto Branch Detection** - Automatically detects your base branch (main/master/develop)
- 🔄 **Batch Processing** - Handles large repositories without hitting API rate limits
- 🎨 **Beautiful Output** - Clean, colorful results with clear categorization
- 🌍 **Universal Support** - Works with any language, framework, or project type
- ⚙️ **Flexible Config** - Multiple ways to customize behavior

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

### Large Projects (Batch Review)
```bash
# Automatically batches files to avoid rate limits
ai-pr-review batch

# Frontend-optimized batching
ai-pr-review batch --frontend

# Custom batch size
ai-pr-review batch --batch-size 6

# See what would be reviewed (no API calls)
ai-pr-review batch --dry-run
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

# Batch review to avoid rate limits
ai-pr-review batch

# Review shows issues by category:
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

## 🔧 Troubleshooting

### Rate Limit Errors (429)
```bash
# Use batch mode for large changes
ai-pr-review batch

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

```bash
ai-pr-review batch

🤖 AI PR Review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Analyzing changes on branch: feature/auth-system
📁 Found 12 changed files: auth.js, login.js, middleware.js, ...

🔄 Creating 4 review batches...

--- Batch 1/4: api ---
Files: auth.js, middleware.js, routes.js
✔ Review completed!

🚨 Issues
  1. Missing input validation in auth.js:15
  2. Potential SQL injection in routes.js:42
  3. Password stored in plain text - use bcrypt

✏️ Typos  
  1. "recieve" should be "receive" in comment (auth.js:8)

💡 Improvements
  1. Add rate limiting to login endpoint
  2. Use environment variables for JWT secret
  3. Add error logging for failed auth attempts

--- Batch 2/4: frontend ---
[... continues for other batches ...]

📋 Review Summary: 5 issues, 2 typos, 8 improvements
```

## 🔐 Security & Privacy

- Code is sent to OpenAI's API for analysis
- No permanent storage of your code
- Use `.gitignore` to exclude sensitive files
- Review OpenAI's [data usage policies](https://openai.com/policies/api-data-usage-policies)
- Consider using on non-production codebases first

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