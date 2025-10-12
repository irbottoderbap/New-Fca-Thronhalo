const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const choices = {
  rock: "https://files.catbox.moe/ga60os.jpg",
  paper: "https://files.catbox.moe/q6qs28.jpg",
  scissors: "https://files.catbox.moe/mdhpg6.jpg"
};

const loseQuotes = [
  "😢💔 Oops! Better luck next time!",
  "🥀 You fought well, but fate wasn’t with you!",
  "😂 Bot just flexed on you!"
];

const drawQuotes = [
  "🤝 It’s a draw! Great minds think alike.",
  "😅 Same choice! Destiny is balanced.",
  "⚖️ Nobody wins, nobody loses!"
];

module.exports = {
  config: {
    name: "rps",
    aliases: ["rockpaperscissors"],
    version: "1.3",
    author: "GPT VIP + Your Custom Message",
    countDown: 5,
    role: 0,
    shortDescription: "Play Rock Paper Scissors",
    longDescription: "Rock Paper Scissors game with images + coins system",
    category: "game",
    guide: {
      en: "{pn} rock/paper/scissors"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      const userChoice = args[0]?.toLowerCase();
      if (!userChoice || !["rock", "paper", "scissors"].includes(userChoice)) {
        return api.sendMessage(
          "⚠️ Please choose: rock, paper, or scissors.\n👉 Example: /rps rock",
          event.threadID,
          event.messageID
        );
      }

      // Bot random choice
      const options = ["rock", "paper", "scissors"];
      const botChoice = options[Math.floor(Math.random() * 3)];

      let resultMsg = "";
      let coinChange = 0;

      if (userChoice === botChoice) {
        resultMsg = drawQuotes[Math.floor(Math.random() * drawQuotes.length)];
      } else if (
        (userChoice === "rock" && botChoice === "scissors") ||
        (userChoice === "paper" && botChoice === "rock") ||
        (userChoice === "scissors" && botChoice === "paper")
      ) {
        resultMsg = "🎉 Congratulations! You have won 1000 coins by destroying the Bot 🔥🤖";
        coinChange = 1000;
      } else {
        resultMsg = loseQuotes[Math.floor(Math.random() * loseQuotes.length)] + "\n\n💸 You lost 500 coins!";
        coinChange = -500;
      }

      // Update coin balance
      if (usersData && coinChange !== 0) {
        await usersData.addMoney(event.senderID, coinChange);
      }

      // Download images
      const userImg = await axios.get(choices[userChoice], { responseType: "arraybuffer" });
      const botImg = await axios.get(choices[botChoice], { responseType: "arraybuffer" });

      const userPath = path.join(__dirname, `rps_user_${Date.now()}.jpg`);
      const botPath = path.join(__dirname, `rps_bot_${Date.now()}.jpg`);

      await fs.outputFile(userPath, userImg.data);
      await fs.outputFile(botPath, botImg.data);

      api.sendMessage(
        {
          body: `🎮 Rock-Paper-Scissors 🎮\n\n👉 You chose: ${userChoice}\n🤖 Bot chose: ${botChoice}\n\n${resultMsg}\n\n💰 Coin Update: ${coinChange > 0 ? "+" + coinChange : coinChange}`,
          attachment: [fs.createReadStream(userPath), fs.createReadStream(botPath)]
        },
        event.threadID,
        () => {
          fs.unlinkSync(userPath);
          fs.unlinkSync(botPath);
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error occurred while playing RPS.", event.threadID, event.messageID);
    }
  }
};
