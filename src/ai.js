const axios = require("axios");
require("dotenv").config();
async function openai(prompt, model) {
  try {
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
  } catch (error) {
    if (error.response?.status === 429) {
      const resetTime = error.response.headers['x-ratelimit-reset-requests'] || 'unknown';
      throw new Error(`Rate limit exceeded. Please wait and try again. Reset time: ${resetTime}. Consider upgrading your OpenAI plan for higher limits.`);
    } else if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
    } else if (error.response?.status === 403) {
      throw new Error('OpenAI API access denied. Check your API key permissions.');
    } else {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

async function runAI(prompt, config) {
  return openai(prompt, config.model);
}

module.exports = { runAI };
