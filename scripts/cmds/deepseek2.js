const axios = require("axios");
const Data = {}; 

async function handleChat({ args, message, event }) {
  try {
    const chatId = event.senderID;
    const prompt = args.join(" ").trim();

    if (!prompt) {
      return message.reply("⚠️ Please provide a message, or type `reset` to clear history.");
    }

    if (prompt.toLowerCase() === "reset") {
      delete Data[chatId];
      return message.reply("✅ Conversation reset.");
    }

    if (!Data[chatId]) {
      Data[chatId] = [];
    }
    Data[chatId].push({ role: "user", content: prompt });

    const payload = {
      model: "tngtech/deepseek-r1t2-chimera:free",
      messages: Data[chatId],
    };

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer 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",
        },
      }
    );

    const answer =
      response.data?.choices?.[0]?.message?.content || "⚠️ No response.";

    Data[chatId].push({ role: "assistant", content: answer });

    message.reply({ body: answer }, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          args, 
        });
      }
    });
  } catch (error) {
    console.error("DeepSeek Error:", error?.response?.data || error.message);
    message.reply("❌ Failed to connect to DeepSeek. Please try again later.");
  }
}

module.exports = {
  config: {
    name: "deepseek2",
    aliases: ["ds", "deep"],
    version: 1.0,
    author: "Israfil ThronHalo",
    longDescription: "Chat with DeepSeek",
    category: "ai",
    guide: {
      en: "{p}{n} your message",
    },
  },

  onStart: async function ({ args, message, event }) {
    await handleChat({ args, message, event });
  },

  onReply: async function ({ Reply, message, event }) {
    const args = message.body ? message.body.trim().split(/\s+/) : [];
    await handleChat({ args, message, event });
  },
};
