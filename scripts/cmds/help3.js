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

// Array of image URLs that will rotate
const helpImages = [
  "https://files.catbox.moe/nhcqq0.gif",
  "https://files.catbox.moe/ymy5fi.gif",
  "https://files.catbox.moe/gv533s.gif",
  "https://files.catbox.moe/rpb4ae.gif",
  "https://files.catbox.moe/i6ndcg.gif",
  "https://files.catbox.moe/kh97j1.gif"
];

// Store current image index per thread
const imageIndices = new Map();

module.exports = {
  config: {
    name: "help3",
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

    // Get or initialize image index for this thread
    if (!imageIndices.has(threadID)) {
      imageIndices.set(threadID, 0);
    }
    let currentImageIndex = imageIndices.get(threadID);

    // Individual command help
    if (args[0] && !args[0].match(/^\d+$/)) {
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

    // Categorize commands
    const categories = {};
    for (const [name, cmd] of commands) {
      if (!cmd?.config || typeof cmd.onStart !== "function") continue;
      if (cmd.config.role > role) continue;

      const category = cmd.config.category || "Uncategorized";
      if (!categories[category]) categories[category] = [];
      categories[category].push(name);
    }

    // Sort categories and commands
    const sortedCategories = Object.keys(categories).sort();
    sortedCategories.forEach(category => {
      categories[category].sort();
    });

    // Pagination logic
    const pageSize = 1; // 1 category per page
    const totalPages = Math.ceil(sortedCategories.length / pageSize);
    let currentPage = parseInt(args[0]) || 1;

    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    // Calculate categories for current page
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentCategories = sortedCategories.slice(startIndex, endIndex);

    // Build output message
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
      msg += `\nUse "${prefix}help <page>" to view other categories`;
    }

    // Get current image and rotate for next time
    const currentImage = helpImages[currentImageIndex];
    currentImageIndex = (currentImageIndex + 1) % helpImages.length;
    imageIndices.set(threadID, currentImageIndex);

    return message.reply({
      body: msg,
      attachment: await global.utils.getStreamFromURL(currentImage)
    });
  }
};

// Stylized CAPS for headers
function stylizeCaps(text) {
  const map = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
    j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
    s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
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
