const fs = require("fs-extra");
const path = require("path");

const dataPath = path.join(__dirname, "cache", "farmData.json");
if (!fs.existsSync(path.dirname(dataPath))) fs.mkdirSync(path.dirname(dataPath));
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");

const crops = [
  { name: "🌾 Wheat", time: 10, profit: 5000 },
  { name: "🥕 Carrot", time: 15, profit: 8000 },
  { name: "🍅 Tomato", time: 20, profit: 12000 },
  { name: "🍇 Grapes", time: 25, profit: 20000 }
];

module.exports = {
  config: {
    name: "farm",
    version: "1.0",
    author: "Israfil ThornHalo",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: "Grow and harvest crops!",
    longDescription: "Plant, harvest, and sell crops for coins — just like OwO but farming!",
    guide: {
      en: "{pn} daily\n{pn} plant <crop>\n{pn} harvest\n{pn} sell\n{pn} farm"
    }
  },

  onStart: async function ({ api, event, args }) {
    const userID = event.senderID;
    const name = event.senderName || "Farmer";
    const data = JSON.parse(fs.readFileSync(dataPath));
    if (!data[userID]) data[userID] = { coins: 0, lastDaily: 0, crop: null, plantedAt: 0 };
    const user = data[userID];
    const now = Date.now();
    const sub = (args[0] || "").toLowerCase();

    // --- daily ---
    if (sub === "daily") {
      const cooldown = 60 * 60 * 1000;
      if (now - user.lastDaily < cooldown) {
        const remain = cooldown - (now - user.lastDaily);
        const mins = Math.floor(remain / 60000);
        return api.sendMessage(`⏳ | ${name}, wait ${mins}m before your next daily.`, event.threadID, event.messageID);
      }
      const reward = 20000;
      user.coins += reward;
      user.lastDaily = now;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return api.sendMessage(`🌞 | ${name}, you earned 💰 ${reward.toLocaleString()} coins for today's chores!`, event.threadID, event.messageID);
    }

    // --- plant ---
    if (sub === "plant") {
      const cropName = args.slice(1).join(" ");
      const crop = crops.find(c => c.name.toLowerCase().includes(cropName.toLowerCase()));
      if (!crop)
        return api.sendMessage(`🌱 | Available crops:\n${crops.map(c => `${c.name} (${c.time}s)`).join("\n")}`, event.threadID, event.messageID);

      if (user.crop)
        return api.sendMessage(`😿 | You already planted ${user.crop.name}. Wait to harvest it first.`, event.threadID, event.messageID);

      user.crop = crop;
      user.plantedAt = now;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return api.sendMessage(`🌾 | You planted ${crop.name}! It’ll be ready in ${crop.time}s.`, event.threadID, event.messageID);
    }

    // --- harvest ---
    if (sub === "harvest") {
      if (!user.crop)
        return api.sendMessage(`😿 | You haven’t planted anything yet!`, event.threadID, event.messageID);

      const crop = user.crop;
      if (now - user.plantedAt < crop.time * 1000)
        return api.sendMessage(`⏳ | ${crop.name} isn’t ready yet! Wait a bit longer.`, event.threadID, event.messageID);

      user.coins += crop.profit;
      const profit = crop.profit;
      user.crop = null;
      user.plantedAt = 0;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      return api.sendMessage(`🎉 | You harvested ${crop.name} and earned 💰 ${profit.toLocaleString()} coins!`, event.threadID, event.messageID);
    }

    // --- sell (optional if needed)
    if (sub === "sell") {
      const amount = Math.floor(Math.random() * 10000) + 5000;
      user.coins += amount;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return api.sendMessage(`💰 | ${name}, you sold some crops and earned ${amount.toLocaleString()} coins!`, event.threadID, event.messageID);
    }

    // --- farm info ---
    if (!sub || sub === "farm") {
      let msg = `👨‍🌾 | ${name}'s Farm\n💰 Coins: ${user.coins.toLocaleString()}\n`;
      if (user.crop) msg += `🌱 Crop: ${user.crop.name}`;
      else msg += `🌾 No crops planted.`;
      return api.sendMessage(msg, event.threadID, event.messageID);
    }
  }
};
