const axios = require("axios");
const Data = {};

module.exports = {
  config: {
    name: "llama",
    aliases: ["llm"],
    version: 1.0,
    author: "Israfil ThronHalo",
    longDescription: "Chat with LLaMA 3.3 ",
    category: "ai",
    guide: {
      en: "{p}{n} your message",
    },
  },

  onStart: async function ({ args, message, event }) {
    await this.handleChat({ args, message, event });
  },

  onReply: async function ({ args, message, event, Reply }) {
    await this.handleChat({ args, message, event, Reply });
  },

  handleChat: async function ({ args, message, event, Reply }) {
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
        model: "meta-llama/llama-3.3-8b-instruct:free",
        messages: Data[chatId],
      };

      const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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",
        },
      });

      const answer = response.data?.choices?.[0]?.message?.content || "⚠️ No response.";
      
      Data[chatId].push({ role: "assistant", content: answer });

      message.reply({ body: answer }, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
          });
        }
      });

    } catch (error) {
      console.error("LLaMA Error:", error?.response?.data || error.message);
      message.reply("❌ Failed to connect to LLaMA. Please try again later.");
    }
  }
};
