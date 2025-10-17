const fs = require("fs-extra");

const dataPath = __dirname + "/cache/owoData.json";
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");

const animals = [
  { name: "🐇 Bunny", rarity: "common", chance: 50 },
  { name: "🐿️ Squirrel", rarity: "common", chance: 50 },
  { name: "🦊 Fox", rarity: "uncommon", chance: 30 },
  { name: "🦝 Raccoon", rarity: "uncommon", chance: 30 },
  { name: "🐻 Bear", rarity: "rare", chance: 15 },
  { name: "🦁 Lion", rarity: "rare", chance: 15 },
  { name: "🐉 Dragon", rarity: "epic", chance: 7 },
  { name: "🦄 Unicorn", rarity: "legendary", chance: 3 }
];

module.exports = {
  config: {
    name: "owo",
    version: "3.0",
    author: "Israfil ThornHalo",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: "Play OwO game like Discord",
    longDescription: "A fun OwO-style mini-game (daily, hunt, zoo, coinflip)",
    guide: {
      en: "{pn}\n{pn} daily\n{pn} hunt\n{pn} zoo\n{pn} cf h/t <amount>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const data = JSON.parse(fs.readFileSync(dataPath));
    const userID = event.senderID;
    const name = event.senderName || "User";

    if (!data[userID]) data[userID] = { coins: 0, lastDaily: 0, zoo: [] };
    const user = data[userID];
    const now = Date.now();

    const sub = (args[0] || "").toLowerCase();

    // --- owo daily ---
    if (sub === "daily") {
      const cooldown = 60 * 60 * 1000; // 1 hour
      if (now - user.lastDaily < cooldown) {
        const remain = cooldown - (now - user.lastDaily);
        const mins = Math.floor(remain / 60000);
        const secs = Math.floor((remain % 60000) / 1000);
        return api.sendMessage(
          `⏳ | ${name}, you already claimed your OwO daily!\nWait ${mins}m ${secs}s.`,
          event.threadID,
          event.messageID
        );
      }

      const reward = Math.floor(Math.random() * 300) + 200;
      user.coins += reward;
      user.lastDaily = now;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      return api.sendMessage(
        `🌸 | ${name}, you claimed your OwO daily reward!\nYou got 💰 ${reward} coins.\nBalance: ${user.coins} coins.`,
        event.threadID,
        event.messageID
      );
    }

    // --- owo hunt ---
    if (sub === "hunt") {
      const random = Math.random() * 100;
      let caught;
      let cumulative = 0;
      for (const a of animals) {
        cumulative += a.chance;
        if (random <= cumulative) {
          caught = a;
          break;
        }
      }
      if (!caught) caught = animals[0];

      user.zoo.push(caught.name);
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      return api.sendMessage(
        `🎯 | ${name} went hunting and caught a ${caught.rarity} ${caught.name}!`,
        event.threadID,
        event.messageID
      );
    }

    // --- owo zoo ---
    if (sub === "zoo") {
      if (user.zoo.length === 0)
        return api.sendMessage(`🦋 | ${name}, your zoo is empty! Go hunt some animals using: owo hunt`, event.threadID);

      const list = user.zoo.map((a, i) => `${i + 1}. ${a}`).join("\n");
      return api.sendMessage(
        `🦊 | ${name}'s Zoo:\n${list}\n\n💰 Coins: ${user.coins}`,
        event.threadID
      );
    }

    // --- owo coinflip (cf h/t amount) ---
    if (sub === "cf") {
      const side = (args[1] || "").toLowerCase();
      const bet = parseInt(args[2]);
      if (!side || !["h", "t"].includes(side))
        return api.sendMessage(`🎲 | Usage: owo cf h/t <amount>\nExample: owo cf h 100`, event.threadID);

      if (isNaN(bet) || bet <= 0)
        return api.sendMessage(`💸 | Please enter a valid bet amount!`, event.threadID);

      if (user.coins < bet)
        return api.sendMessage(`😿 | You don't have enough coins! You currently have ${user.coins} coins.`, event.threadID);

      const result = Math.random() < 0.5 ? "h" : "t";
      let message = "";

      if (side === result) {
        user.coins += bet;
        message = `🎉 | ${name}, it's **${result === "h" ? "Heads" : "Tails"}!**\nYou won 💰 ${bet} coins!\nNew Balance: ${user.coins}`;
      } else {
        user.coins -= bet;
        message = `💀 | ${name}, it's **${result === "h" ? "Heads" : "Tails"}!**\nYou lost 💸 ${bet} coins!\nNew Balance: ${user.coins}`;
      }

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return api.sendMessage(message, event.threadID);
    }

    // --- owo (no args) ---
    const owoTexts = [
      "owo what's this?",
      "uwu so cute~",
      "owo *nuzzles you*",
      "uwu rawr x3",
      "owo i see u~",
      "uwu you found a hidden owo coin 💰"
    ];

    const msg = owoTexts[Math.floor(Math.random() * owoTexts.length)];
    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};
