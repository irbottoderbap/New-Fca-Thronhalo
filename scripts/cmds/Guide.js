const fs = require("fs-extra");
const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "guide",
    version: "1.0",
    author: "ISRAFIL THRONHALO",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Complete guide to using bot commands"
    },
    longDescription: {
      en: "Learn how to use all bot commands with examples and explanations"
    },
    category: "info",
    guide: {
      en: "{pn} [command name]"
    }
  },

  onStart: async function ({ message, args, event }) {
    const prefix = getPrefix(event.threadID);
    const threadID = event.threadID;

    if (!args[0]) {
      // Main guide menu
      const guideMessage = `
╭───📖 𝗕𝗢𝗧 𝗨𝗦𝗔𝗚𝗘 𝗚𝗨𝗜𝗗𝗘 ───╮
│
│ 🤖 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝘁𝗵𝗲 𝗕𝗼𝘁 𝗚𝘂𝗶𝗱𝗲!
│
│ 𝗕𝗮𝘀𝗶𝗰 𝗨𝘀𝗮𝗴𝗲:
│ ${prefix}𝗰𝗼𝗺𝗺𝗮𝗻𝗱 [𝗮𝗿𝗴𝘂𝗺𝗲𝗻𝘁𝘀]
│
│ 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗚𝘂𝗶𝗱𝗲𝘀:
│ • ${prefix}guide help - How to use help system
│ • ${prefix}guide basic - Basic command usage
│ • ${prefix}guide media - Media commands guide
│ • ${prefix}guide fun - Fun commands guide  
│ • ${prefix}guide ai - AI commands guide
│ • ${prefix}guide group - Group management
│ • ${prefix}guide economy - Economy system
│ • ${prefix}guide <command> - Specific command help
│
│ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
│ ${prefix}guide sim
│ ${prefix}guide gemini
│ ${prefix}guide rank
│
│ 𝗡𝗲𝗲𝗱 𝗺𝗼𝗿𝗲 𝗵𝗲𝗹𝗽? 𝘂𝘀𝗲:
│ ${prefix}help - Full command list
│
╰────────────────────╯
      `;

      return message.reply(guideMessage);
    }

    const guideType = args[0].toLowerCase();
    
    // Specific command guide
    if (commands.has(guideType) || aliases.has(guideType)) {
      const cmdName = commands.has(guideType) ? guideType : aliases.get(guideType);
      const cmd = commands.get(cmdName);
      
      if (!cmd?.config) {
        return message.reply(`❌ Command "${guideType}" not found.`);
      }

      const config = cmd.config;
      const usage = (config.guide?.en || "No usage guide provided")
        .replace(/{p}/g, prefix)
        .replace(/{n}/g, config.name);

      const commandGuide = `
╭─🎯 𝗖𝗠𝗗 𝗚𝗨𝗜𝗗𝗘: ${config.name.toUpperCase()} ─╮
│
│ 📝 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:
│ ${config.longDescription?.en || config.shortDescription?.en || "No description"}
│
│ 🛠️ 𝗨𝘀𝗮𝗴𝗲:
│ ${usage}
│
│ 👤 𝗥𝗲𝗾𝘂𝗶𝗿𝗲𝗱 𝗥𝗼𝗹𝗲:
│ ${roleToString(config.role)}
│
│ 🔧 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆:
│ ${config.category || "Uncategorized"}
│
│ 💡 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
${generateExamples(config.name, prefix)}
│
│ ⚡ 𝗧𝗶𝗽𝘀:
${generateTips(config.name)}
│
╰─────────────────────╯
      `;

      return message.reply(commandGuide);
    }

    // Category guides
    switch (guideType) {
      case 'help':
        return message.reply(`
╭──❓ 𝗛𝗘𝗟𝗣 𝗦𝗬𝗦𝗧𝗘𝗠 𝗚𝗨𝗜𝗗𝗘 ──╮
│
│ ${prefix}help - Show all commands
│ ${prefix}help <page> - Show specific page
│ ${prefix}help <command> - Command details
│
│ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
│ ${prefix}help 2
│ ${prefix}help gemini
│ ${prefix}help sim
│
│ 𝗧𝗶𝗽𝘀:
│ • Use page numbers to browse categories
│ • Command names are case-insensitive
│ • Check role requirements before using commands
│
╰──────────────────╯
        `);

      case 'basic':
        return message.reply(`
╭──🔰 𝗕𝗔𝗦𝗜𝗖 𝗖𝗠𝗗𝗦 𝗚𝗨𝗜𝗗𝗘 ──╮
│
│ 𝗠𝗼𝘀𝘁 𝗖𝗼𝗺𝗺𝗼𝗻 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀:
│ ${prefix}help - Command list
│ ${prefix}guide - This guide
│ ${prefix}info - Bot information
│ ${prefix}ping - Check bot status
│
│ 𝗕𝗮𝘀𝗶𝗰 𝗦𝘆𝗻𝘁𝗮𝘅:
│ ${prefix}command argument1 argument2
│
│ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
│ ${prefix}weather London
│ ${prefix}calc 5+3*2
│ ${prefix}time New York
│
│ 𝗧𝗶𝗽𝘀:
│ • Always use the correct prefix
│ • Separate arguments with spaces
│ • Some commands need exact argument order
│
╰──────────────────╯
        `);

      case 'ai':
        return message.reply(`
╭─🤖 𝗔𝗜 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 𝗚𝗨𝗜𝗗𝗘 ─╮
│
│ 𝗔𝗜 𝗖𝗵𝗮𝘁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀:
│ ${prefix}gemini <question> - Google AI
│ ${prefix}sim <message> - Character AI
│ ${prefix}gpt <prompt> - OpenAI
│ ${prefix}ai <query> - General AI
│
│ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
│ ${prefix}gemini What is quantum computing?
│ ${prefix}sim Hello, how are you?
│ ${prefix}gpt Write a poem about nature
│
│ 𝗧𝗶𝗽𝘀:
│ • Be specific with your questions
│ • Some AI commands have conversation memory
│ • Use clear and concise language
│
╰──────────────────╯
        `);

      case 'media':
        return message.reply(`
╭─🎬 𝗠𝗘𝗗𝗜𝗔 𝗖𝗠𝗗𝗦 𝗚𝗨𝗜𝗗𝗘 ╮
│
│ 𝗠𝗲𝗱𝗶𝗮 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱:
│ ${prefix}tiktok <url> - Download TikTok
│ ${prefix}fb <url> - Download Facebook
│ ${prefix}yt <url> - Download YouTube
│ ${prefix}spotify <url> - Download music
│
│ 𝗠𝗲𝗱𝗶𝗮 𝗘𝗱𝗶𝘁:
│ ${prefix}edit <text> - Image editing
│ ${prefix}quote - Create quotes
│ ${prefix}memegen - Create memes
│
│ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
│ ${prefix}tiktok https://tiktok.com/...
│ ${prefix}edit Hello World
│
│ 𝗧𝗶𝗽𝘀:
│ • Provide valid URLs
│ • Some commands need image replies
│ • Check file size
