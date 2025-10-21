const fs = require("fs-extra");
const path = require("path");

const dataPath = path.join(__dirname, "cache", "owoData.json");
if (!fs.existsSync(path.dirname(dataPath))) fs.mkdirSync(path.dirname(dataPath));
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
    version: "3.2",
    author: "Israfil ThornHalo",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: "Play OwO game like Discord",
    longDescription: "A fun OwO-style mini-game (daily, hunt, zoo, coinflip, cash)",
    guide: {
      en: "{pn}\n{pn} daily\n{pn} hunt\n{pn} zoo\n{pn} cash\n{pn} cf h/t <amount>\n{pn} cf all h/t"
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
    const parts = event.body ? event.body.split(/\s+/) : [];

    // --- owo daily (gives 100,000) ---
    if (sub === "daily") {
      const cooldown = 60 * 60 * 1000; // 1 hour cooldown
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

      const reward = 100000; // fixed reward
      user.coins += reward;
      user.lastDaily = now;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      return api.sendMessage(
        `🌸 | ${name}, you claimed your OwO daily reward!\nYou got 💰 ${reward.toLocaleString()} coins.\nBalance: ${user.coins.toLocaleString()} coins.`,
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
        return api.sendMessage(
          `🦋 | ${name}, your zoo is empty! Go hunt some animals using: owo hunt`,
          event.threadID,
          event.messageID
        );

      const list = user.zoo.map((a, i) => `${i + 1}. ${a}`).join("\n");
      return api.sendMessage(
        `🦊 | ${name}'s Zoo:\n${list}\n\n💰 Coins: ${user.coins.toLocaleString()}`,
        event.threadID,
        event.messageID
      );
    }

    // --- owo cash ---
    if (sub === "cash") {
      return api.sendMessage(
        `💰 | ${name}, your current balance is: ${user.coins.toLocaleString()} coins.`,
        event.threadID,
        event.messageID
      );
    }

    // --- owo coinflip (cf h/t <amount> or cf all h/t) ---
    if (sub === "cf") {
      const side = (args[1] || parts[2] || "").toLowerCase();
      let betArg = args[2] || parts[3];
      let bet = parseInt(betArg);

      // Allow “owo cf all h/t” or “owo cf h/t all”
      if (args.includes("all") || parts.includes("all")) bet = user.coins;

      if (!side || !["h", "t"].includes(side))
        return api.sendMessage(
          `🎲 | Usage: owo cf h/t <amount>\nExample: owo cf h 100 or owo cf all t`,
          event.threadID,
          event.messageID
        );

      if (isNaN(bet) || bet <= 0)
        return api.sendMessage(
          `💸 | Please enter a valid bet amount!`,
          event.threadID,
          event.messageID
        );

      if (user.coins < bet)
        return api.sendMessage(
          `😿 | You don't have enough coins! You currently have ${user.coins.toLocaleString()} coins.`,
          event.threadID,
          event.messageID
        );

      const result = Math.random() < 0.5 ? "h" : "t";
      let message = "";

      if (side === result) {
        user.coins += bet;
        message = `🎉 | ${name}, it's **${result === "h" ? "Heads" : "Tails"}!**\nYou won 💰 ${bet.toLocaleString()} coins!\nNew Balance: ${user.coins.toLocaleString()}`;
      } else {
        user.coins -= bet;
        message = `💀 | ${name}, it's **${result === "h" ? "Heads" : "Tails"}!**\nYou lost 💸 ${bet.toLocaleString()} coins!\nNew Balance: ${user.coins.toLocaleString()}`;
      }

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return api.sendMessage(message, event.threadID, event.messageID);
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
