const fs = require("fs-extra");
const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

// Emoji for categories
const categoryEmojis = {
  fun: "🎉",
  ai: "🤖",
  game: "🎮",
  music: "🎵",
  media: "🎬",
  utility: "🛠️",
  economy: "💰",
  group: "👥",
  owner: "👑",
  info: "📖",
  Uncategorized: "✨"
};

module.exports = {
  config: {
    name: "help",
    version: "2.0",
    author: "ISRAFIL THRONHALO",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Dark-themed help command"
    },
    longDescription: {
      en: "View command list or detailed info with a dark-themed stylish look."
    },
    category: "info",
    guide: {
      en: "{pn} [command name]"
    }
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);

    if (!args[0]) {
      const categories = {};

      // Organize commands
      for (const [name, cmd] of commands) {
        if (!cmd?.config || typeof cmd.onStart !== "function") continue;
        if (cmd.config.role > role) continue;

        const category = cmd.config.category || "Uncategorized";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      // Build output message
      let msg = "";
      msg += "╭───[ 🧠 𝗜𝗥'𝗦 𝗛𝗘𝗟𝗣 𝗠𝗘𝗡𝗨 ]───╮\n";

      for (const category of Object.keys(categories).sort()) {
        const emoji = categoryEmojis[category.toLowerCase()] || "✨";
        msg += `│ ${emoji} ${stylizeCaps(category)}:\n`;

        const cmds = categories[category].sort();
        for (const cmd of cmds) {
          msg += `│   ⤷ ${cmd}\n`;
        }
        msg += "│\n";
      }

      msg += "╰────────────────────╯\n";
      msg += `⚙ Prefix: ${prefix}\n`;
      msg += `📦 Total Commands: ${commands.size}\n`;
      msg += `👑 Owner: Israfil ThronHalo`;

      const image = "https://files.catbox.moe/nhcqq0.gif"; // Feel free to add more
      return message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(image)
      });
    }

    // Individual command help
    const name = args[0].toLowerCase();
    const cmd = commands.get(name) || commands.get(aliases.get(name));

    if (!cmd || !cmd.config) {
      return message.reply(`❌ Command "${name}" not found.`);
    }

    const config = cmd.config;
    const emoji = categoryEmojis[(config.category || "Uncategorized").toLowerCase()] || "✨";
    const usage = (config.guide?.en || "No usage info")
      .replace(/{p}/g, prefix)
      .replace(/{n}/g, config.name);

    const detail = `
╭─[ ${emoji} 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 ]─╮
│⤷ Name: ${stylizeCaps(config.name)}
│⤷ Description: ${config.longDescription?.en || "No description"}
│🔝 Author: ${config.author || "Unknown"}
│⤷ Usage: ${usage}
│⤷ Category: ${stylizeCaps(config.category || "Uncategorized")}
│⤷ Version: ${config.version || "1.0"}
│⤷ Role: ${roleToString(config.role)}
╰─────────────────────╯`;

    return message.reply(detail);
  }
};

// Stylized CAPS for headers
function stylizeCaps(text) {
  const map = {
    a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ', g:'ɢ', h:'ʜ', i:'ɪ',
    j:'ᴊ', k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ',
    s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x', y:'ʏ', z:'ᴢ'
  };
  return text.toLowerCase().split('').map(c => map[c] || c).join('');
}

// Role text
function roleToString(role) {
  switch (role) {
    case 0: return "0 (Everyone)";
    case 1: return "1 (Group Admins)";
    case 2: return "2 (Bot Admins)";
    default: return `${role}`;
  }
}
