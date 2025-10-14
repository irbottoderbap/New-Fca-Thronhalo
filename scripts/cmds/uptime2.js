const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "uptime2",
    aliases: ["ut", "timeup"],
    version: "1.0",
    author: "Israfil",
    role: 0,
    shortDescription: "Show bot uptime with custom background image",
    longDescription: "Shows how long the bot has been running, with a premium styled image card using custom bg",
    category: "tools",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const uptime = process.uptime(); // seconds
    const days = Math.floor(uptime / (60 * 60 * 24));
    const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    const seconds = Math.floor(uptime % 60);

    const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    const dateNow = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });

    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Load background image
    const bgImage = await loadImage("https://files.catbox.moe/b7xfaz.jpg");
    ctx.drawImage(bgImage, 0, 0, width, height);

    // Overlay semi-transparent gradient for readability
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.5)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Outer neon border glow
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 8;
    ctx.shadowColor = "#00FFFF";
    ctx.shadowBlur = 25;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Reset shadow for text
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    // Uptime Text
    ctx.fillStyle = "#00FFCC";
    ctx.font = "bold 60px Sans";
    ctx.textAlign = "center";
    ctx.fillText("Bot Uptime", width / 2, 100);

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 80px Sans";
    ctx.fillText(uptimeStr, width / 2, 200);

    // Date & Time
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "30px Sans";
    ctx.fillText(`Date & Time: ${dateNow}`, width / 2, 280);

    // Owner name
    ctx.fillStyle = "#00FFFF";
    ctx.font = "bold 28px Sans";
    ctx.fillText("Israfil", width / 2, 340);

    // Save image
    const filePath = path.join(__dirname, "uptime_card.png");
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(filePath, buffer);

    // Send image
    api.sendMessage({
      body: "📊 Bot Uptime Status",
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath));
  }
};
