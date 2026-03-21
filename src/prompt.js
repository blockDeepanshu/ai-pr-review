function buildPrompt(diff, files) {
  return `
You are a senior software engineer reviewing a pull request.

--- DIFF ---
${diff}

--- RELATED FILES ---
${files.map((f) => `FILE: ${f.name}\n${f.content}`).join("\n\n")}

Return JSON:

{
  "issues": [],
  "typos": [],
  "improvements": []
}
`;
}

module.exports = { buildPrompt };
