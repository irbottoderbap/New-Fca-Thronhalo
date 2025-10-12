const fs = require("fs");
const path = require("path");
const axios = require("axios");

const QUOTA_LIMIT = 15;
const quotaFile = path.join(__dirname, "dailyQuota.json");

function loadQuota() {
  if (!fs.existsSync(quotaFile)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(quotaFile, "utf8"));
  } catch {
    return {};
  }
}

function saveQuota(data) {
  fs.writeFileSync(quotaFile, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "illusion",
    author: "Israfil ThronHalo",
    version: "1.1",
    cooldowns: 5,
    role: 0,
    shortDescription: "Generate an AI image (global 15/day)",
    longDescription: "Generates an AI image using Midjourney.online API with a global daily quota of 15 images.",
    category: "image",
    guide: {
      en: "{pn} <prompt>"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    if (!args.length) {
      return message.reply("⚠️ Please provide a prompt.");
    }

    const prompt = args.join(" ");
    const today = new Date().toISOString().split("T")[0];

    const quotaData = loadQuota();

    if (!quotaData[today]) {
      quotaData[today] = { total: 0 };
    }

    if (quotaData[today].total >= QUOTA_LIMIT) {
      return message.reply(`🚫 Daily limit of ${QUOTA_LIMIT} images has been reached. Try again tomorrow.`);
    }

    message.reply("⏳ Generating image... please wait.");

    try {
      const { data } = await axios.post(
        "https://midjourney.online/api/generate",
        new URLSearchParams({
          prompt,
          negative: "ugly, low quality, distorted, deformed, blurry, bad anatomy, text, watermark",
          width: "512",
          height: "512",
          scheduler: "PNDM",
          guidance_scale: "7",
          steps: "30",
          captcha_token: "0"
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            Origin: "https://midjourney.online",
            Referer: "https://midjourney.online/generator"
          },
          timeout: 120000
        }
      );

      if (!data?.response || !data?.image) {
        throw new Error("API did not return an image");
      }

      const imageUrl = data.image;

      const imgResp = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const cachePath = path.join(__dirname, "cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

      const filePath = path.join(cachePath, `mj_${Date.now()}.png`);
      await fs.promises.writeFile(filePath, imgResp.data);

      quotaData[today].total++;
      saveQuota(quotaData);

      message.reply(
        {
          body: `✅ Image generated (${quotaData[today].total}/${QUOTA_LIMIT} used today).`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.promises.unlink(filePath).catch(() => {})
      );
    } catch (error) {
      console.error("❌ Midjourney API error:", error?.response?.data || error.message);
      api.sendMessage(
        "❌ Failed to generate image. Try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
