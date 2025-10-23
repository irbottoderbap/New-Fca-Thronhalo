const fs = require("fs-extra");

module.exports = {
  config: {
    name: "botpersonality",
    aliases: ["bpsim", "bps"],
    version: "1.0",
    author: "Israfil ThronHalo",
    role: 0,
    countDown: 3,
    shortDescription: { en: "Interact with the bot and see your personality outcome" },
    longDescription: { en: "Respond to scenarios and see how the bot reacts. Multiple endings!" },
    category: "game",
    guide: { en: "{pn} start → begin game\n{pn} choose [option number] → pick an option" }
  },

  onStart: async function({ message, event, args }) {
    const filePath = __dirname + "/cache/botPersonality.json";
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "{}");
    const data = JSON.parse(fs.readFileSync(filePath));
    const userID = event.senderID;

    const scenarios = [
      {
        text: "Bot asks: 'Do you prefer coding or gaming?'",
        options: ["1️⃣ Coding", "2️⃣ Gaming"],
        points: [2, 1] // coding +2, gaming +1
      },
      {
        text: "Bot asks: 'Would you help a stranger or stay silent?'",
        options: ["1️⃣ Help", "2️⃣ Stay silent"],
        points: [2, 0]
      },
      {
        text: "Bot asks: 'Do you prefer cats or dogs?'",
        options: ["1️⃣ Cats", "2️⃣ Dogs"],
        points: [1, 2]
      }
    ];

    if (args[0] === "start") {
      data[userID] = { round: 0, score: 0 };
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return message.reply(`${scenarios[0].text}\n${scenarios[0].options.join("\n")}\nReply with: botpersonality choose [1 or 2]`);
    }

    if (args[0] === "choose") {
      if (!data[userID]) return message.reply("⚠️ Start the game first: `botpersonality start`");
      const choice = parseInt(args[1]);
      const userData = data[userID];
      if (isNaN(choice) || choice < 1 || choice > 2) return message.reply("❌ Invalid choice! Pick 1 or 2.");

      const scenario = scenarios[userData.round];
      userData.score += scenario.points[choice - 1];
      userData.round++;

      if (userData.round >= scenarios.length) {
        let ending = "Neutral Friend";
        if (userData.score >= 5) ending = "Best Friend 🥳";
        if (userData.score <= 2) ending = "Rival 😅";
        delete data[userID];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return message.reply(`🎉 Game Over! Your relationship with the bot: ${ending}`);
      } else {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        const nextScenario = scenarios[userData.round];
        return message.reply(`${nextScenario.text}\n${nextScenario.options.join("\n")}\nReply with: botpersonality choose [1 or 2]`);
      }
    }

    return message.reply("⚠️ Invalid option! Use `botpersonality start` or `botpersonality choose [1 or 2]`");
  }
};
