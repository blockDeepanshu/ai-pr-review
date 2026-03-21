# 🤖 AI PR Review CLI

An intelligent command-line tool that uses AI to review your code changes and provide instant feedback on pull requests, issues, typos, and improvements.

## ✨ Features

- 🔍 **Intelligent Code Analysis** - Uses GPT to analyze your code changes
- 🎯 **Smart Branch Detection** - Automatically detects common base branches
- 🎨 **Beautiful CLI Interface** - Clean, colorful output with emojis
- ⚡ **Fast & Easy** - One command to get comprehensive feedback
- 🔧 **Flexible Configuration** - Multiple ways to configure base branch and AI model
- 📊 **Categorized Feedback** - Issues, typos, and improvements clearly separated

## 🚀 Quick Start

### Installation

```bash
# Install globally for use anywhere
npm install -g ai-pr-review-cli

# Or use with npx (no installation needed)
npx ai-pr-review-cli review
```

### Setup

1. **Get an OpenAI API key** from [OpenAI](https://platform.openai.com/api-keys)

2. **Set your API key**:
```bash
# Option 1: Environment variable (recommended)
export OPENAI_API_KEY="your-api-key-here"

# Option 2: Create .env file in your project
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

3. **Run a review**:
```bash
# In your git repository
ai-pr-review review

# Or use the short alias
aipr review
```

## 📖 Usage

### Basic Usage

```bash
# Review current branch against main
ai-pr-review review

# Review against specific branch
ai-pr-review review --base origin/develop

# Use different AI model
ai-pr-review review --model gpt-4o

# Show detailed output
ai-pr-review review --verbose
```

### Command Options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--base <branch>` | `-b` | Base branch to compare against | `-b origin/main` |
| `--model <model>` | `-m` | AI model to use | `-m gpt-4o` |
| `--provider <provider>` | | AI provider (currently only openai) | `--provider openai` |
| `--verbose` | `-v` | Show detailed output | `-v` |

### Examples

```bash
# Review feature branch against main
git checkout feature/new-feature
ai-pr-review review --base main

# Review with GPT-4 and verbose output  
ai-pr-review review --model gpt-4o --verbose

# Review staged changes only
git add .
ai-pr-review review

# Review uncommitted changes
ai-pr-review review  # Automatically includes working directory changes
```

## ⚙️ Configuration

### Method 1: Command Line Arguments (Recommended)
```bash
ai-pr-review review --base origin/main --model gpt-4o-mini
```

### Method 2: Project Configuration File
Create `.aiprconfig.json` in your project root:

```json
{
  "provider": "openai",
  "model": "gpt-4o-mini", 
  "baseBranch": "origin/main"
}
```

### Method 3: Auto-Detection
The tool automatically detects common base branches in this order:
1. `origin/main`
2. `origin/master`
3. `origin/develop`
4. `main`
5. `master` 
6. `develop`
7. `HEAD~1` (fallback)

## 🎯 What Gets Reviewed

The tool analyzes:
- ✅ **Committed changes** between branches
- ✅ **Staged changes** (files added with `git add`)
- ✅ **Working directory changes** (uncommitted modifications)
- ✅ **File contents** for context

## 📊 Output Categories

### 🚨 Issues
- Critical bugs and logic errors
- Security vulnerabilities  
- Performance problems
- Breaking changes

### ✏️ Typos
- Spelling mistakes in comments
- Grammar errors in strings
- Documentation typos

### 💡 Improvements  
- Code quality suggestions
- Best practice recommendations
- Performance optimizations
- Refactoring opportunities

## 🔧 Supported AI Models

| Model | Speed | Quality | Cost |
|-------|-------|---------|------|
| `gpt-4o-mini` | ⚡⚡⚡ | ⭐⭐⭐ | 💰 |
| `gpt-4o` | ⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰 |
| `gpt-3.5-turbo` | ⚡⚡⚡ | ⭐⭐ | 💰 |

## 🛠️ Troubleshooting

### "No changes found to review"
- Make sure you're on a feature branch (not main/master)
- Check if you have uncommitted changes: `git status`
- Try specifying a different base branch: `--base main`
- Update remote branches: `git fetch origin`

### "API key not found"
```bash
# Set your OpenAI API key
export OPENAI_API_KEY="your-key-here"

# Or create .env file
echo "OPENAI_API_KEY=your-key-here" > .env
```

### "Branch not found"
```bash
# List all available branches
git branch -a

# Use a branch that exists
ai-pr-review review --base origin/master
```

## 🔐 Security & Privacy

- Your code is sent to OpenAI's API for analysis
- API keys are read from environment variables or .env files
- No code is stored permanently by the tool
- Consider using this on non-sensitive codebases
- Review OpenAI's [data usage policies](https://openai.com/policies/api-data-usage-policies)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 💡 Tips

- **Use on feature branches** for best results
- **Commit changes first** for more accurate reviews  
- **Use `--verbose`** to see what's being analyzed
- **Try different models** for varying levels of detail
- **Set up aliases** in your shell for quick access:
  ```bash
  alias review="ai-pr-review review"
  alias aipr="ai-pr-review review"
  ```

---

Made with ❤️ for developers who want better code reviews!