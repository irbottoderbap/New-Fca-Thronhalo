const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "mg",
    author: "Israfil ThronHalo",
    version: "2.1",
    cooldowns: 5,
    role: 0,
    shortDescription: "Generate an AI image.",
    longDescription: "Generates an AI-generated image using MidgenAI API.",
    category: "image",
    guide: {
      en: "{pn} <prompt> [--ar <ratio>]\n\nAvailable ratios: 1:1, 2:3, 3:2, 4:5, 5:4, 9:16, 16:9"
    }
  },

  onStart: async function ({ message, args, api, event }) {
    if (args.length === 0) {
      return message.reply("👀 Please provide a prompt.");
    }

    let aspect_ratio = "1:1";
    const availableRatios = ["1:1", "2:3", "3:2", "4:5", "5:4", "9:16", "16:9"];

    let prompt = args.join(" ");
    const arIndex = args.indexOf("--ar");
    if (arIndex !== -1 && args[arIndex + 1]) {
      const chosenAr = args[arIndex + 1];
      if (availableRatios.includes(chosenAr)) {
        aspect_ratio = chosenAr;
      }
      args.splice(arIndex, 2);
      prompt = args.join(" ");
    }

    const startTime = Date.now();

    try {
      const response = await axios.post(
        "https://www.midgenai.com/api/image-generate",
        {
          prompt,
          negative_prompt: "ugly, low quality, blurry, pixelated, low resolution, deformed, distorted, bad anatomy, extra limbs, missing limbs, poorly drawn face, disfigured, mutated, unrealistic, grainy, noisy, watermark, text, signature, cropped, out of frame",
          aspect_ratio,
          steps: 30,
          seed: Math.floor(Math.random() * 999999) 
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
            Origin: "https://www.midgenai.com",
            Referer: "https://www.midgenai.com/text-to-image"
          }
        }
      );

      const imageBase64 = response.data.image;
      if (!imageBase64) {
        throw new Error("No image returned from API");
      }

      const imageBuffer = Buffer.from(imageBase64, "base64");

      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const imagePath = path.join(
        cacheFolderPath,
        `${Date.now()}_midgen.jpg`
      );
      await fs.promises.writeFile(imagePath, imageBuffer);

      const endTime = Date.now();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

      message.reply(
        {
          body: `gen_v6`,
          attachment: fs.createReadStream(imagePath)
        },
        event.threadID,
        () => {
          fs.promises.unlink(imagePath).catch(() => {});
        }
      );
    } catch (error) {
      console.error("❌ Error generating image:", error);
      api.sendMessage(
        "❌ | Failed to generate the image. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
