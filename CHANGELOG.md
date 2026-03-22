# Changelog

All notable changes to AI PR Review CLI will be documented in this file.

## [1.1.0] - 2026-03-22

### 🚀 Major Features Added
- **Batch Processing**: Added intelligent batch review for large repositories
- **Universal Project Support**: Enhanced support for all project types (backend, frontend, mobile, DevOps)
- **Smart File Filtering**: Automatically skips generated files, node_modules, build artifacts
- **Rate Limit Handling**: Graceful handling of OpenAI API rate limits with retry logic
- **Frontend Optimization**: Special batching mode for React, Vue, Angular projects

### ✨ New Commands
- `ai-pr-review batch` - Intelligent batch processing for large repos
- `ai-pr-review batch --frontend` - Frontend-optimized batching
- `ai-pr-review batch --dry-run` - Preview batching without API calls
- `ai-pr-review config` - Global configuration management

### 🔧 Improvements
- **Better Error Handling**: Clear error messages for common issues (API key, rate limits, git errors)
- **Auto Branch Detection**: Automatically detects common base branches (main, master, develop)
- **Enhanced Prompt**: More effective prompts for finding bugs, security issues, and improvements
- **File Content Limits**: Smart truncation to prevent huge requests
- **Priority-Based Batching**: Reviews critical files first (API, services, components)

### 🛠️ Technical Enhancements
- **Universal File Grouping**: Intelligent grouping for any project type
- **Dynamic Batch Sizes**: Adjusts batch size based on file type and complexity
- **Package Lock Handling**: Special handling for large dependency files
- **JSON Extraction**: Robust parsing of AI responses even with formatting issues

### 📚 Documentation
- **Comprehensive README**: Complete rewrite with practical examples
- **Usage Examples**: Real-world workflows for different project types
- **Troubleshooting Guide**: Solutions for common problems
- **Platform Support**: Clear documentation for Windows, Mac, Linux

## [1.0.1] - 2026-03-21

### 🔧 Bug Fixes
- Fixed ES module compatibility issues with `ora` and `chalk`
- Improved Git operations error handling
- Updated GitHub repository links

## [1.0.0] - 2026-03-21

### 🎉 Initial Release
- **Basic PR Review**: Single-file and small repository review
- **OpenAI Integration**: GPT-powered code analysis
- **Git Integration**: Automatic diff detection and file analysis
- **Configurable**: Support for different AI models and base branches
- **Beautiful CLI**: Colorful output with clear categorization

### 📦 Core Features
- Issues detection (bugs, security, performance)
- Typo detection (spelling, grammar)
- Improvement suggestions (best practices, refactoring)
- Multiple configuration methods (CLI, file, environment)
- Cross-platform support (Windows, Mac, Linux)