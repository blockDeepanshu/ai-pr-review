const fs = require("fs");
const path = require("path");

function getConfig() {
  const configPath = path.join(process.cwd(), ".aiprconfig.json");

  if (!fs.existsSync(configPath)) {
    return {
      provider: "openai",
      model: "gpt-4o-mini",
      baseBranch: "origin/main",
    };
  }

  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

module.exports = { getConfig };
