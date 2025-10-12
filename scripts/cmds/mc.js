const axios = require("axios");
const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "membercount",
    aliases: ["mc", "members"],
    version: "2.0",
    author: "Israfil ThronHalo",
    countDown: 10,
    role: 0,
    shortDescription: "Show group member count in a stylish design",
    longDescription: "Beautiful image with background, group cover photo, and member profile collage",
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const members = threadInfo.participantIDs;
      const memberCount = members.length;

      // Custom Background
      const bgURL = "https://files.catbox.moe/b7xfaz.jpg";

      // Group Cover
      const coverURL = threadInfo.imageSrc || "https://i.ibb.co/ZTnRrMh/default-cover.jpg";

      // Canvas size (wide enough for collage)
      const canvas = Canvas.createCanvas(1200, 1600);
      const ctx = canvas.getContext("2d");

      // Background লোড
      const bgImg = await Canvas.loadImage(bgURL);
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Group Cover লোড
      const coverImg = await Canvas.loadImage(coverURL);
      const coverHeight = 300;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(50, 50, canvas.width - 100, coverHeight, 30); // rounded cover
      ctx.clip();
      ctx.drawImage(coverImg, 50, 50, canvas.width - 100, coverHeight);
      ctx.restore();

      // Title text
      ctx.font = "bold 45px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(`${threadInfo.threadName}`, canvas.width / 2, 400);

      // Member profile pictures (circle crop)
      let x = 60, y = 450, size = 100;
      for (let i = 0; i < members.length && i < 80; i++) { // প্রথম ৮০ জন দেখাবে
        try {
          const url = `https://graph.facebook.com/${members[i]}/picture?width=200&height=200`;
          const img = await Canvas.loadImage(url);

          ctx.save();
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(img, x, y, size, size);
          ctx.restore();

          x += size + 20;
          if (x + size > canvas.width - 60) {
            x = 60;
            y += size + 20;
          }
        } catch (e) {}
      }

      // Member Count নিচে
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#FFD700";
      ctx.textAlign = "center";
      ctx.fillText(`👥 Total Members: ${memberCount}`, canvas.width / 2, canvas.height - 80);

      // Save + Send
      const filePath = path.join(__dirname, "membercount.png");
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      await message.send({
        body: `📌 Group: ${threadInfo.threadName}\n👥 Total Members: ${memberCount}`,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);

    } catch (e) {
      console.error(e);
      return message.reply("❌ Member collage ইমেজ বানাতে সমস্যা হয়েছে।");
    }
  }
};
