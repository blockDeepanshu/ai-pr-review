const simpleGit = require("simple-git");
const fs = require("fs");

const git = simpleGit();

async function getDiff(baseBranch) {
  return await git.diff([`${baseBranch}...HEAD`]);
}

async function getChangedFiles(baseBranch) {
  const summary = await git.diffSummary([`${baseBranch}...HEAD`]);
  return summary.files.map((f) => f.file);
}

function readFiles(files) {
  return files
    .filter((f) => fs.existsSync(f))
    .map((file) => ({
      name: file,
      content: fs.readFileSync(file, "utf-8").slice(0, 5000),
    }));
}

module.exports = { getDiff, getChangedFiles, readFiles };
