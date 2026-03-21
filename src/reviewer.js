const { getDiff, getChangedFiles, readFiles } = require("./git");
const { buildPrompt } = require("./prompt");
const { runAI } = require("./ai");
const { getConfig } = require("./config");

async function review() {
  const { default: ora } = await import("ora");
  const { default: chalk } = await import("chalk");
  
  const spinner = ora("Reviewing PR...").start();

  try {
    const config = getConfig();

    const diff = await getDiff(config.baseBranch);
    const files = readFiles(await getChangedFiles(config.baseBranch));

    const prompt = buildPrompt(diff, files);
    const result = await runAI(prompt, config);

    spinner.stop();

    const parsed = JSON.parse(result);

    console.log("\n❌ Issues");
    parsed.issues.forEach((i) => console.log("- " + i));

    console.log("\n✍️ Typos");
    parsed.typos.forEach((t) => console.log("- " + t));

    console.log("\n🚀 Improvements");
    parsed.improvements.forEach((i) => console.log("- " + i));
  } catch (e) {
    spinner.fail("Error");
    console.error(e.message);
  }
}

module.exports = review;
