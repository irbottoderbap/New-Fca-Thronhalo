const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  config: {
    name: 'magi',
    version: '1.8.0',
    author: 'Israfil ThronHalo',
    countDown: 15,
    role: 0,
    description: 'Generate Image using Midjourney!',
    category: 'ai',
    usePrefix: true,
    isPremium: false,
    guide: { en: "{pn} [prompt] --ar [aspect] -- [version]" }
  },

  onStart: async function ({ event, args, message, api }) {
    if (!args[0]) return message.reply("§c[Error] §7You must provide a prompt!");

    const fullInput = args.join(" ");
    const aspectMatch = fullInput.match(/--ar\s+(\d+:\d+)/);
    const aspect = aspectMatch ? aspectMatch[1] : "1:1";
    const basePrompt = fullInput.replace(/--ar\s+\d+:\d+/, "").trim();
    const apiUrl = "https://www.noobs-apis.run.place";

    message.reaction("⏳", event.messageID);

    // Send waiting message and unsend after 7s
    const waitMsg = await message.reply("§e[Processing] §7Summoning Midjourney magic...");
    setTimeout(() => {
      api.unsendMessage(waitMsg.messageID);
    }, 7000);

    try {
      const res = await axios.get(`${apiUrl}/mjj?prompt=${encodeURIComponent(basePrompt)}&ratio=${aspect}`);
      let images = res.data.images;

      if (!images) throw new Error("No imageUrl returned.");
      if (typeof images === "string") images = [images];
      if (images.length < 4) throw new Error("Not enough images received (need 4).");

      const loadedImages = await Promise.all(images.slice(0, 4).map(i => loadImage(i)));

      const w = Math.max(...loadedImages.map(i => i.width));
      const h = Math.max(...loadedImages.map(i => i.height));

      const canvas = createCanvas(w * 2, h * 2);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(loadedImages[0], 0, 0, w, h);
      ctx.drawImage(loadedImages[1], w, 0, w, h);
      ctx.drawImage(loadedImages[2], 0, h, w, h);
      ctx.drawImage(loadedImages[3], w, h, w, h);

      const fullImagePath = path.join(__dirname, `mj_grid_${event.threadID}.png`);
      fs.writeFileSync(fullImagePath, canvas.toBuffer('image/png'));

      message.reaction("✅", event.messageID);

      // Random Minecraft-style tips
      const tips = [
        "§6[Tip] §7Use §b--ar 16:9 §7for cinematic images!",
        "§6[Tip] §7Reply with a number to crop your favorite piece.",
        "§6[Tip] §7Try creative prompts like §e‘steampunk castle at sunrise’!",
        "§6[Tip] §7Aspect ratio changes the entire vibe of your art."
      ];
      const randomTip = tips[Math.floor(Math.random() * tips.length)];

      const msg = await message.reply({
        body: `§a[Success] §7Your Midjourney creation is ready!\n§b• Reply with 1, 2, 3, or 4 to select an image.\n\n${randomTip}`,
        attachment: fs.createReadStream(fullImagePath)
      });

      global.GoatBot.onReply.set(msg.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        gridPath: fullImagePath
      });

    } catch (err) {
      message.reply("§c[Error] §7Failed to generate image.");
      message.reaction("❌", event.messageID);
    }
  },

  onReply: async function ({ event, Reply, message }) {
    const { author, gridPath } = Reply;
    if (event.senderID !== author) return;

    const choice = event.body.trim();
    if (!["1", "2", "3", "4"].includes(choice)) {
      return message.reply("§c[Invalid] §7Reply with 1, 2, 3, or 4.");
    }
    try {
      const gridImage = await loadImage(gridPath);
      const [w, h] = [gridImage.width / 2, gridImage.height / 2];
      const canvas = createCanvas(w, h);
      const ctx = canvas.getContext('2d');

      const positions = {
        "1": [0, 0],
        "2": [w, 0],
        "3": [0, h],
        "4": [w, h]
      };
      const [sx, sy] = positions[choice];
      ctx.drawImage(gridImage, sx, sy, w, h, 0, 0, w, h);

      const cropPath = path.join(__dirname, `mj_crop_${event.threadID}_${choice}.png`);
      fs.writeFileSync(cropPath, canvas.toBuffer('image/png'));
      message.reaction("✅", event.messageID);

      await message.reply({
        body: `§a[Delivered] §7Here’s your chosen image §e#${choice}!`,
        attachment: fs.createReadStream(cropPath)
      });

      // Cleanup after 1 hour
      setTimeout(() => {
        fs.unlink(cropPath, () => {});
        fs.unlink(gridPath, () => {});
      }, 3600000);

    } catch (err) {
      message.reply("§c[Error] §7Failed to send the selected image.");
      message.reaction("❌", event.messageID);
    }
  }
};
