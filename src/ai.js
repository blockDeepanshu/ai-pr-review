const axios = require("axios");

async function openai(prompt, model) {
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    },
  );

  return res.data.choices[0].message.content;
}

async function runAI(prompt, config) {
  return openai(prompt, config.model);
}

module.exports = { runAI };
