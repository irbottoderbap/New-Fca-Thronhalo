const fs = require("fs-extra"); 
const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

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
  uncategorized: "✨"
};

const helpImages = [
  "https://postimg.cc/2Lp93RK2",
  "https://postimg.cc/JDKtzM07",
  "https://postimg.cc/DWXq0J3v",
  "https://postimg.cc/Q9PGbyn4",
  "https://postimg.cc/18NHnYp9",
  "https://postimg.cc/DWXq0J3v"
];

const imageIndices = new Map();

module.exports = {
  config: {
    name: "help",
    version: "2.0",
    author: "ISRAFIL THRONHALO",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Dark-themed help command with pagination"
    },
    longDescription: {
      en: "View command list with paginated categories and rotating images."
    },
    category: "info",
    guide: {
      en: "{pn} [command name | page number]"
    }
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);
    const threadID = event.threadID;

    if (!imageIndices.has(threadID)) {
      imageIndices.set(threadID, 0);
    }
    let currentImageIndex = imageIndices.get(threadID);

    if (args[0] && !args[0].match(/^\d+$/)) {
      const name = args[0].toLowerCase();
      const cmd = commands.get(name) || commands.get(aliases.get(name));

      if (!cmd || !cmd.config) {
        return message.reply(`❌ Command "${name}" not found.`);
      }

      const config = cmd.config;
      const emoji = categoryEmojis[(config.category || "uncategorized").toLowerCase()] || "✨";
      
      const usage = (config.guide?.en || "No usage info")
        .replace(/{pn}/g, `${prefix}${config.name}`)
        .replace(/{p}/g, prefix)
        .replace(/{n}/g, config.name);

      const detail = `
╭─[ ${emoji} COMMAND INFO ]─╮
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

    const categories = {};
    for (const [name, cmd] of commands) {
      if (!cmd?.config || typeof cmd.onStart !== "function") continue;
      if (cmd.config.role > role) continue;

      const category = cmd.config.category || "Uncategorized";
      if (!categories[category]) categories[category] = [];
      categories[category].push(name);
    }

    const sortedCategories = Object.keys(categories).sort();
    sortedCategories.forEach(category => {
      categories[category].sort();
    });

    const pageSize = 1; 
    const totalPages = Math.ceil(sortedCategories.length / pageSize);
    let currentPage = parseInt(args[0]) || 1;

    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentCategories = sortedCategories.slice(startIndex, endIndex);

    let msg = "";
    msg += `╭───[ 🧠 IR'S HELP MENU ]───╮\n`;
    msg += `│ 📄 Page: ${currentPage}/${totalPages}\n`;
    msg += `│\n`;

    for (const category of currentCategories) {
      const emoji = categoryEmojis[category.toLowerCase()] || "✨";
      msg += `│ ${emoji} ${stylizeCaps(category)}:\n`;

      const cmds = categories[category];
      for (const cmd of cmds) {
        msg += `│   ⤷ ${cmd}\n`;
      }
      msg += `│\n`;
    }

    msg += "╰────────────────────╯\n";
    msg += `⚙ Prefix: ${prefix}\n`;
    msg += `📦 Total Commands: ${commands.size}\n`;
    msg += `📂 Total Categories: ${sortedCategories.length}\n`;
    msg += `👑 Owner: Israfil ThronHalo\n`;
    
    if (totalPages > 1) {
      msg += `\nUse "${prefix}help3 <page>" to view other categories`;
    }

    const currentImage = helpImages[currentImageIndex];
    currentImageIndex = (currentImageIndex + 1) % helpImages.length;
    imageIndices.set(threadID, currentImageIndex);

    try {
      return message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(currentImage)
      });
    } catch (error) {
      return message.reply(msg);
    }
  }
};

function stylizeCaps(text) {
  const map = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
    j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
    s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
  };
  return text.toLowerCase().split('').map(c => map[c] || c).join('');
}

function roleToString(role) {
  switch (role) {
    case 0: return "0 (Everyone)";
    case 1: return "1 (Group Admins)";
    case 2: return "2 (Bot Admins)";
    default: return `${role}`;
  }
}
