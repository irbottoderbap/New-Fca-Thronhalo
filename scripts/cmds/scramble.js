const axios = require("axios");
const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "scrambleData.json");

function loadData() {
  if (!fs.existsSync(dataFile)) return {};
  return JSON.parse(fs.readFileSync(dataFile));
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function updateStats(uid, win) {
  const data = loadData();
  if (!data[uid]) {
    data[uid] = { wins: 0, losses: 0, xp: 0 };
  }
  if (win) {
    data[uid].wins += 1;
    data[uid].xp += 10;
  } else {
    data[uid].losses += 1;
    data[uid].xp += 2;
  }
  saveData(data);
  return data[uid];
}

function getRank(xp) {
  if (xp < 20) return "🔰 Beginner";
  if (xp < 50) return "⭐ Novice";
  if (xp < 100) return "🔥 Skilled";
  if (xp < 200) return "👑 Pro";
  return "🐉 Master";
}

module.exports = {
  config: {
    name: "scramble",
    aliases: ["wordgame"],
    version: "2.0",
    author: "Israfil ThronHalo",
    longDescription: "Guess the scrambled word within 40 seconds!",
    category: "game",
    guide: {
      en: "{p}{n} → Start the scramble game\n{p}{n} leaderboard → Show top players\n{p}{n} status → Show your stats",
    },
  },

  onStart: async function ({ args, message, event, api }) {
    const uid = event.senderID;

    if (args[0] === "leaderboard" || args[0] === "top") {
      const data = loadData();
      const top = Object.entries(data)
        .map(([id, info]) => ({
          id,
          wins: info.wins,
          xp: info.xp,
        }))
        .sort((a, b) => b.wins - a.wins || b.xp - a.xp)
        .slice(0, 5);

      let msg = "🏆 Scramble Leaderboard 🏆\n\n";
      top.forEach((u, i) => {
        msg += `${i + 1}. ${u.id} → Wins: ${u.wins} | XP: ${u.xp} | Rank: ${getRank(u.xp)}\n`;
      });
      return message.reply(msg);
    }

    if (args[0] === "status") {
      const data = loadData();
      const user = data[uid] || { wins: 0, losses: 0, xp: 0 };
      return message.reply(
        `📊 Your Scramble Status:\n\n✅ Wins: ${user.wins}\n❌ Losses: ${user.losses}\n⭐ XP: ${user.xp}\n🏅 Rank: ${getRank(user.xp)}`
      );
    }

    try {
      const res = await axios.get("https://random-word-api.herokuapp.com/word?number=1");
      const word = res.data[0].toLowerCase();

      const scrambled = word.split("").sort(() => Math.random() - 0.5).join("");

      const msg = await message.reply(
        `🎮 Scramble Game Started! You have 40 seconds!\n\nUnscramble this word:\n${scrambled}`
      );

      global.GoatBot.onReply.set(msg.messageID, {
        commandName: this.config.name,
        author: uid,
        word,
        scrambled,
        messageID: msg.messageID,
        timeout: setTimeout(() => {
          updateStats(uid, false);
          api.sendMessage(`⏰ Time's up! The correct word was: ( ${word} )`, event.threadID);
          global.GoatBot.onReply.delete(msg.messageID);
        }, 40000),
      });
    } catch (e) {
      return message.reply("⚠️ Failed to fetch a word. Try again!");
    }
  },

  onReply: async function ({ Reply, message, event, api }) {
    const { author, word, messageID, timeout } = Reply;

    if (event.senderID !== author) return;

    clearTimeout(timeout);
    global.GoatBot.onReply.delete(messageID);

    const answer = event.body.trim().toLowerCase();
    if (answer === word.toLowerCase()) {
      const stats = updateStats(author, true);
      return message.reply(
        `🎉 Correct! The word was ${word}\n\n✅ Wins: ${stats.wins}\n❌ Losses: ${stats.losses}\n⭐ XP: ${stats.xp}\n🏅 Rank: ${getRank(stats.xp)}`
      );
    } else {
      const stats = updateStats(author, false);
      return message.reply(
        `❌ Wrong! The correct word was ${word}\n\n✅ Wins: ${stats.wins}\n❌ Losses: ${stats.losses}\n⭐ XP: ${stats.xp}\n🏅 Rank: ${getRank(stats.xp)}`
      );
    }
  },
};
