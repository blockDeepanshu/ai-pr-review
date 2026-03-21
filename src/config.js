const fs = require("fs");
const path = require("path");
const os = require("os");

function getConfig() {
  // Default configuration
  const defaultConfig = {
    provider: "openai",
    model: "gpt-4o-mini",
    baseBranch: null, // Will be auto-detected
  };

  // Try to load global config from user's home directory
  const globalConfigPath = path.join(os.homedir(), ".aiprconfig.json");
  let config = { ...defaultConfig };

  if (fs.existsSync(globalConfigPath)) {
    try {
      const globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, "utf-8"));
      config = { ...config, ...globalConfig };
    } catch (error) {
      console.warn("Warning: Could not parse global config file:", globalConfigPath);
    }
  }

  // Try to load local project config (overrides global)
  const localConfigPath = path.join(process.cwd(), ".aiprconfig.json");
  if (fs.existsSync(localConfigPath)) {
    try {
      const localConfig = JSON.parse(fs.readFileSync(localConfigPath, "utf-8"));
      config = { ...config, ...localConfig };
    } catch (error) {
      console.warn("Warning: Could not parse local config file:", localConfigPath);
    }
  }

  return config;
}

function createGlobalConfig(options) {
  const globalConfigPath = path.join(os.homedir(), ".aiprconfig.json");
  const config = {
    provider: options.provider || "openai",
    model: options.model || "gpt-4o-mini",
    ...(options.baseBranch && { baseBranch: options.baseBranch })
  };
  
  fs.writeFileSync(globalConfigPath, JSON.stringify(config, null, 2));
  return globalConfigPath;
}

module.exports = { getConfig, createGlobalConfig };
