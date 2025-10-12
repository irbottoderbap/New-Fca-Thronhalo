const fs = require("fs");
const path = require("path");

let getMoney, increaseMoney, decreaseMoney;

// ===== Economy system detect =====
try {
  const currency = require("../../utils/currency");
  getMoney = currency.getMoney;
  increaseMoney = currency.increaseMoney;
  decreaseMoney = currency.decreaseMoney;
} catch (e) {
  // fallback balance.json (local economy)
  const balanceFile = path.join(__dirname, "balance.json");
  function loadBalance() {
    if (!fs.existsSync(balanceFile)) return {};
    return JSON.parse(fs.readFileSync(balanceFile));
  }
  function saveBalance(data) {
    fs.writeFileSync(balanceFile, JSON.stringify(data, null, 2));
  }
  getMoney = async (uid) => {
    const bal = loadBalance();
    return bal[uid]?.money || 0;
  };
  increaseMoney = async (uid, amt) => {
    const bal = loadBalance();
    if (!bal[uid]) bal[uid] = { money: 0 };
    bal[uid].money += amt;
    saveBalance(bal);
  };
  decreaseMoney = async (uid, amt) => {
    const bal = loadBalance();
    if (!bal[uid]) bal[uid] = { money: 0 };
    bal[uid].money = Math.max(0, bal[uid].money - amt);
    saveBalance(bal);
  };
}

// ===== Spin counter =====
const spinFile = path.join(__dirname, "spins.json");
function loadSpins() {
  if (!fs.existsSync(spinFile)) return {};
  return JSON.parse(fs.readFileSync(spinFile));
}
function saveSpins(data) {
  fs.writeFileSync(spinFile, JSON.stringify(data, null, 2));
}

module.exports = {
  config: { 
    name: "slot", 
    author: "Israfil", 
    category: "casino", 
    description: "🎰 3x4 Casino Slot Machine (multi-line win check)" 
  },

  onStart: async ({ api, event, args }) => {
    const userID = event.senderID;

    // New player bonus
    let balance = await getMoney(userID);
    if (balance <= 0) {
      await increaseMoney(userID, 1000);
      balance = 1000;
      api.sendMessage("🎁 Welcome Bonus: +1000 coins", event.threadID);
    }

    // Bet system
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) {
      return api.sendMessage("⚠️ Usage: /slot <amount>\nExample: /slot 1000", event.threadID, event.messageID);
    }

    balance = await getMoney(userID);
    if (balance < bet) {
      return api.sendMessage("💰 You don’t have enough balance!", event.threadID, event.messageID);
    }

    // Spin tracking
    let spins = loadSpins();
    if (!spins[userID]) spins[userID] = 0;
    spins[userID]++;

    const fruits = ["🍒","🍋","🍉","🍇","🍓","🍍","🥝","🥭"];

    // Generate 3x4 slot matrix
    let slot = [];
    for (let row = 0; row < 3; row++) {
      let line = [];
      for (let col = 0; col < 4; col++) {
        line.push(fruits[Math.floor(Math.random() * fruits.length)]);
      }
      slot.push(line);
    }

    // Function to check each line
    function checkLine(line) {
      const jackpot = line.every(f => f === line[0]); // all 4 same
      const threeMatch = new Set(line).size === 2 && !jackpot; // 3 same
      return { jackpot, threeMatch };
    }

    let msg = "";
    let reward = 0;
    let title = "💥 YOU LOST 💥";

    // ===== Special Spin Bonus =====
    if (spins[userID] % 20 === 0) {
      const multipliers = [5, 20, 50];
      const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
      reward = bet * multiplier;
      await increaseMoney(userID, reward);
      title = multiplier === 50 ? "🌟 JACKPOT 🌟" : "🎉 YOU WIN 🎉";
    } 
    else if (spins[userID] % 9 === 0) {
      const multipliers = [5, 20];
      const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
      reward = bet * multiplier;
      await increaseMoney(userID, reward);
      title = "🎉 YOU WIN 🎉";
    } 
    else {
      // Normal check for all 3 lines
      let winFound = false;
      for (let i = 0; i < 3; i++) {
        const { jackpot, threeMatch } = checkLine(slot[i]);
        if (jackpot) {
          reward = 9999;
          await increaseMoney(userID, reward);
          title = "🎉 YOU WIN 🎉";
          winFound = true;
          break;
        } else if (threeMatch) {
          reward = bet * 2;
          await increaseMoney(userID, reward);
          title = "🎉 YOU WIN 🎉";
          winFound = true;
          break;
        }
      }
      if (!winFound) {
        await decreaseMoney(userID, bet);
        reward = -bet;
        title = "💥 YOU LOST 💥";
      }
    }

    msg = `╔════════════╗
${title}
╚════════════╝
${slot[0].join(" | ")}
${slot[1].join(" | ")}
${slot[2].join(" | ")}
${reward > 0 ? `🏆 Reward: +${reward} Coins` : `💔 Lost: ${-reward} Coins`}
💳 Balance: ${await getMoney(userID)}`;

    saveSpins(spins);
    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};  };
}

// ===== Spin counter =====
const spinFile = path.join(__dirname, "spins.json");
function loadSpins() {
  if (!fs.existsSync(spinFile)) return {};
  return JSON.parse(fs.readFileSync(spinFile));
}
function saveSpins(data) {
  fs.writeFileSync(spinFile, JSON.stringify(data, null, 2));
}

module.exports = {
  config: { 
    name: "slot", 
    author: "Apon", 
    category: "casino", 
    description: "🎰 3x4 Casino Slot Machine (multi-line win check)" 
  },

  onStart: async ({ api, event, args }) => {
    const userID = event.senderID;

    // New player bonus
    let balance = await getMoney(userID);
    if (balance <= 0) {
      await increaseMoney(userID, 1000);
      balance = 1000;
      api.sendMessage("🎁 Welcome Bonus: +1000 coins", event.threadID);
    }

    // Bet system
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) {
      return api.sendMessage("⚠️ Usage: /slot <amount>\nExample: /slot 1000", event.threadID, event.messageID);
    }

    balance = await getMoney(userID);
    if (balance < bet) {
      return api.sendMessage("💰 You don’t have enough balance!", event.threadID, event.messageID);
    }

    // Spin tracking
    let spins = loadSpins();
    if (!spins[userID]) spins[userID] = 0;
    spins[userID]++;

    const fruits = ["🍒","🍋","🍉","🍇","🍓","🍍","🥝","🥭"];

    // Generate 3x4 slot matrix
    let slot = [];
    for (let row = 0; row < 3; row++) {
      let line = [];
      for (let col = 0; col < 4; col++) {
        line.push(fruits[Math.floor(Math.random() * fruits.length)]);
      }
      slot.push(line);
    }

    // Function to check each line
    function checkLine(line) {
      const jackpot = line.every(f => f === line[0]); // all 4 same
      const threeMatch = new Set(line).size === 2 && !jackpot; // 3 same
      return { jackpot, threeMatch };
    }

    let msg = "";
    let reward = 0;
    let title = "💥 YOU LOST 💥";

    // ===== Special Spin Bonus =====
    if (spins[userID] % 20 === 0) {
      const multipliers = [5, 20, 50];
      const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
      reward = bet * multiplier;
      await increaseMoney(userID, reward);
      title = multiplier === 50 ? "🌟 JACKPOT 🌟" : "🎉 YOU WIN 🎉";
    } 
    else if (spins[userID] % 9 === 0) {
      const multipliers = [5, 20];
      const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
      reward = bet * multiplier;
      await increaseMoney(userID, reward);
      title = "🎉 YOU WIN 🎉";
    } 
    else {
      // Normal check for all 3 lines
      let winFound = false;
      for (let i = 0; i < 3; i++) {
        const { jackpot, threeMatch } = checkLine(slot[i]);
        if (jackpot) {
          reward = 9999;
          await increaseMoney(userID, reward);
          title = "🎉 YOU WIN 🎉";
          winFound = true;
          break;
        } else if (threeMatch) {
          reward = bet * 2;
          await increaseMoney(userID, reward);
          title = "🎉 YOU WIN 🎉";
          winFound = true;
          break;
        }
      }
      if (!winFound) {
        await decreaseMoney(userID, bet);
        reward = -bet;
        title = "💥 YOU LOST 💥";
      }
    }

    msg = `╔════════════╗
${title}
╚════════════╝
${slot[0].join(" | ")}
${slot[1].join(" | ")}
${slot[2].join(" | ")}
${reward > 0 ? `🏆 Reward: +${reward} Coins` : `💔 Lost: ${-reward} Coins`}
💳 Balance: ${await getMoney(userID)}`;

    saveSpins(spins);
    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};
