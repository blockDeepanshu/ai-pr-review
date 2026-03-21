function buildPrompt(diff, files) {
  return `You are a strict code reviewer. Find ALL problems in these code changes. Check for:

ISSUES: Syntax errors, logic bugs, invalid JSON/config, security flaws, broken imports, undefined variables, type errors
TYPOS: Spelling/grammar mistakes in comments, strings, documentation  
IMPROVEMENTS: Code quality, performance, best practices, refactoring opportunities

DIFF:
${diff}

FILES:
${files.map((f) => `${f.name}:\n${f.content}`).join("\n\n")}

Be thorough and critical. Return ONLY this JSON (no other text):
{
  "issues": ["list specific problems found"],
  "typos": ["list spelling/grammar errors"], 
  "improvements": ["list enhancement suggestions"]
}`;
}

module.exports = { buildPrompt };
