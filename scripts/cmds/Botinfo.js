module.exports = {
  config: {
    name: "botinfo",
    version: "5.0",
    author: "Israfil ThronHalo",
    role: 0,
    cooldown: 3,
    category: "info",
    shortDescription: {
      en: "Send bot information"
    },
    longDescription: {
      en: "Sends detailed information about the bot when command is used."
    },
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const infoMessage = `
🥀BOT INFORMATION 🥀

💳 BOT NAME: Zephyr
👤 BOT ACCOUNT: Zephyr Thronhalo 🛠️ BOT CREATOR: ISRAFIL
📇 BOT PREFIX: /

👷‍♂️ BOT OWNER INFO:
   • Facebook: Israfil ThronHalo
   • Instagram: IsrafilthronHalo
   • Full Name: Israfil ThronHalo

»»»»»»»»»»»»»»»»»»»
⏮️ LAST MESSAGE:
Simply add the bot to your group chat by sending a friend request to the bot's account.
    `;

    try {
      return api.sendMessage(
        {
          body: infoMessage,
          attachment: await global.utils.getStreamFromURL("https://files.catbox.moe/nhcqq0.gif")
        },
        event.threadID,
        event.messageID
      );
    } catch (err) {
      return api.sendMessage(
        "❌ Failed to send bot info.",
        event.threadID,
        event.messageID
      );
    }
  }
};
