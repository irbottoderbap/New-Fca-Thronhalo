const fs = require("fs-extra");
const moment = require("moment-timezone");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "5.0",
    author: "Israfil ThronHalo",
    countDown: 5,
    role: 0,
    description: "Change the bot prefix in your chat or globally (admin only)",
    category: "Configuration",
    guide: {
      en:
        "[ 𝐏𝐑𝐄𝐅𝐈𝐗 𝐔𝐒𝐀𝐆𝐄 ]\n" +
        "- {pn} <prefix> : Set chat-specific prefix\n" +
        "- {pn} <prefix> -g : Set global prefix (admin only)\n" +
        "- {pn} reset : Reset to default\n"
    }
  },

  langs: {
    en: {
      reset:
        "[ 𝐑𝐄𝐒𝐄𝐓 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋 ]\n" +
        "𝑷𝒓𝒆𝒇𝒊𝒙 𝒓𝒆𝒔𝒆𝒕 𝒕𝒐 𝒅𝒆𝒇𝒂𝒖𝒍𝒕: %1",
      onlyAdmin:
        "[ 𝐀𝐂𝐂𝐄𝐒𝐒 𝐃𝐄𝐍𝐈𝐄𝐃 ]\n" +
        "𝑶𝒏𝒍𝒚 𝒃𝒐𝒕 𝒂𝒅𝒎𝒊𝒏𝒔 𝒄𝒂𝒏 𝒔𝒆𝒕 𝒂 𝒈𝒍𝒐𝒃𝒂𝒍 𝒑𝒓𝒆𝒇𝒊𝒙.",
      confirmGlobal:
        "[ 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𝐑𝐄𝐐𝐔𝐈𝐑𝐄𝐃 ]\n" +
        "𝑹𝒆𝒂𝒄𝒕 𝒕𝒐 𝒄𝒐𝒏𝒇𝒊𝒓𝒎 𝒔𝒆𝒕𝒕𝒊𝒏𝒈 𝒈𝒍𝒐𝒃𝒂𝒍 𝒑𝒓𝒆𝒇𝒊𝒙.",
      confirmThisThread:
        "[ 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𝐑𝐄𝐐𝐔𝐈𝐑𝐄𝐃 ]\n" +
        "𝑹𝒆𝒂𝒄𝒕 𝒕𝒐 𝒄𝒐𝒏𝒇𝒊𝒓𝒎 𝒔𝒆𝒕𝒕𝒊𝒏𝒈 𝒑𝒓𝒆𝒇𝒊𝒙 𝒇𝒐𝒓 𝒕𝒉𝒊𝒔 𝒄𝒉𝒂𝒕.",
      successGlobal:
        "[ 𝐏𝐑𝐄𝐅𝐈𝐗 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 ]\n" +
        "𝑮𝒍𝒐𝒃𝒂𝒍 𝒑𝒓𝒆𝒇𝒊𝒙 𝒔𝒆𝒕 𝒕𝒐: %1",
      successThisThread:
        "[ 𝐏𝐑𝐄𝐅𝐈𝐗 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 ]\n" +
        "𝑪𝒉𝒂𝒕 𝒑𝒓𝒆𝒇𝒊𝒙 𝒔𝒆𝒕 𝒕𝒐: %1",
      myPrefix:
        "[ 𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐏𝐑𝐄𝐅𝐈𝐗𝐄𝐒 ]\n" +
        "𝑮𝒍𝒐𝒃𝒂𝒍: %1\n" +
        "𝑻𝒉𝒊𝒔 𝑪𝒉𝒂𝒕: %2\n" +
        "𝑼𝒔𝒆: %2help"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();

    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix,
      setGlobal: args[1] === "-g"
    };

    if (formSet.setGlobal && role < 2) {
      return message.reply(getLang("onlyAdmin"));
    }

    const confirmMessage = formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");
    return message.reply(confirmMessage, (err, info) => {
      if (err) return console.error(err);
      formSet.messageID = info.messageID;
      global.GoatBot.onReaction.set(info.messageID, formSet);
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal, messageID } = Reaction;
    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      await message.unsend(messageID);
      return message.reply(getLang("successGlobal", newPrefix));
    }

    await threadsData.set(event.threadID, newPrefix, "data.prefix");
    await message.unsend(messageID);
    return message.reply(getLang("successThisThread", newPrefix));
  },

  onChat: async function ({ event, message, threadsData, getLang }) {
    if (event.body && event.body.toLowerCase() === "prefix") {
      const globalPrefix = global.GoatBot.config.prefix;
      const threadPrefix = await threadsData.get(event.threadID, "data.prefix") || globalPrefix;
      
      const currentTime = moment().tz("Asia/Dhaka").format("hh:mm A");
      const uptimeMs = process.uptime() * 1000;

      function formatUptime(ms) {
        const sec = Math.floor(ms / 1000) % 60;
        const min = Math.floor(ms / (1000 * 60)) % 60;
        const hr = Math.floor(ms / (1000 * 60 * 60));
        return `${hr}h ${min}m ${sec}s`;
      }

      const uptime = formatUptime(uptimeMs);

      try {
        return message.reply({
          body: getLang("myPrefix", globalPrefix, threadPrefix) + 
                `\n\nTime: ${currentTime}\nUptime: ${uptime}\nUser ID: ${event.senderID}\nDev: Israfil ThronHalo`,
          attachment: await utils.getStreamFromURL("https://files.catbox.moe/nhcqq0.gif")
        });
      } catch (error) {
        return message.reply(getLang("myPrefix", globalPrefix, threadPrefix) + 
                `\n\nTime: ${currentTime}\nUptime: ${uptime}\nUser ID: ${event.senderID}\nDev: Israfil ThronHalo`);
      }
    }
  }
};
