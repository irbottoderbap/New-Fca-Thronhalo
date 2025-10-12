const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const aspectRatioMap = {
    "1:1": { width: 1024, height: 1024 },
    "9:7": { width: 1152, height: 896 },
    "7:9": { width: 896, height: 1152 },
    "19:13": { width: 1216, height: 832 },
    "13:19": { width: 832, height: 1216 },
    "7:4": { width: 1344, height: 768 },
    "4:7": { width: 768, height: 1344 },
    "12:5": { width: 1500, height: 625 },
    "5:12": { width: 640, height: 1530 },
    "16:9": { width: 1344, height: 756 },
    "9:16": { width: 756, height: 1344 },
    "2:3": { width: 768, height: 1152 },
    "3:2": { width: 1152, height: 768 },
};

const Logger = {
    logFile: path.join(__dirname, "fastx.log"),
    _write(level, msg) {
        const line = `[${new Date().toISOString()}] [${level}] ${msg}\n`;
        fs.appendFileSync(this.logFile, line);
    },
    info(msg) {
        console.log("[INFO]", msg);
        this._write("INFO", msg);
    },
    warn(msg) {
        console.warn("[WARN]", msg);
        this._write("WARN", msg);
    },
    error(msg) {
        console.error("[ERROR]", msg);
        this._write("ERROR", msg);
    },
};

const CacheManager = {
    cacheFolder: path.join(__dirname, "tmp"),

    ensureCacheFolder() {
        if (!fs.existsSync(this.cacheFolder)) {
            fs.mkdirSync(this.cacheFolder);
            Logger.info("Created cache folder.");
        }
    },

    getPath(filename) {
        return path.join(this.cacheFolder, filename);
    },

    saveBuffer(filename, buffer) {
        const filePath = this.getPath(filename);
        fs.writeFileSync(filePath, buffer);
        return filePath;
    },

    async saveStream(filename, stream) {
        return new Promise((resolve, reject) => {
            const filePath = this.getPath(filename);
            const writer = fs.createWriteStream(filePath);
            stream.pipe(writer);
            writer.on("finish", () => resolve(filePath));
            writer.on("error", reject);
        });
    },

    cleanup(files = []) {
        for (const file of files) {
            try {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                    Logger.info(`Deleted temp file: ${file}`);
                }
            } catch (err) {
                Logger.warn(`Failed to delete ${file}: ${err.message}`);
            }
        }
    },
};

function parseArgs(args) {
    let ratio = "1:1";
    let prompt = "";

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--ar" && args[i + 1]) {
            ratio = args[i + 1];
            i++;
        } else {
            prompt += args[i] + " ";
        }
    }

    return { prompt: prompt.trim(), ratio };
}

async function downloadImage(url, filename) {
    try {
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
        });
        return await CacheManager.saveStream(filename, response.data);
    } catch (err) {
        Logger.error(`Failed to download image: ${err.message}`);
        throw err;
    }
}

async function combineImages(images) {
    const loaded = await Promise.all(images.map((img) => loadImage(img)));
    const w = loaded[0].width;
    const h = loaded[0].height;

    const canvas = createCanvas(w * 2, h * 2);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(loaded[0], 0, 0, w, h);
    ctx.drawImage(loaded[1], w, 0, w, h);
    ctx.drawImage(loaded[2], 0, h, w, h);
    ctx.drawImage(loaded[3], w, h, w, h);

    return canvas.toBuffer("image/jpeg");
}

module.exports = {
    config: {
        name: "fast",
        author: "Israfil ThronHalo",
        version: "2.1",
        cooldowns: 5,
        role: 0,
        shortDescription: "AI image generator",
        longDescription: "Generates 4 images, combines them, lets you choose one or multiple.",
        category: "AI",
        guide: "{p}fast <prompt> [--ar <ratio>] (e.g. {p}fastx cyberpunk city --ar 16:9)",
    },

    onStart: async function ({ message, args, api, event }) {
        const start = Date.now();
        CacheManager.ensureCacheFolder();

        const userID = event.senderID;
        const { prompt, ratio } = parseArgs(args);

        if (!prompt) {
            return message.reply("⚠️ | Please provide a prompt. Example: `fastx cute dog --ar 16:9`");
        }

        const size = aspectRatioMap[ratio] || aspectRatioMap["1:1"];
        Logger.info(`User ${userID} requested prompt: "${prompt}" with ratio: ${ratio}`);

        try {
            await message.reaction("✅", event.messageID);

            const urls = new Array(4).fill(
                `https://www.ai4chat.co/api/image/generate?prompt=${encodeURIComponent(prompt)}&width=${size.width}&height=${size.height}`
            );

            const imagePaths = [];
            for (let i = 0; i < urls.length; i++) {
                const { data } = await axios.get(urls[i]);
                const link = data.image_link;
                Logger.info(`Image ${i + 1} link: ${link}`);
                const saved = await downloadImage(link, `fastx_${Date.now()}_${i + 1}.jpg`);
                imagePaths.push(saved);
            }

            const combinedBuffer = await combineImages(imagePaths);
            const combinedPath = CacheManager.saveBuffer(`fastx_grid_${Date.now()}.jpg`, combinedBuffer);

            const duration = ((Date.now() - start) / 1000).toFixed(2);

            const reply = await message.reply({
                body: `✨ FastX AI Image Generator\n\nAspect: ${ratio}\nTime: ${duration}s\n\nReply with:\n- U1, U2, U3, U4 → get images\n- U1 U3 → multiple images\n- U1-U3 → range of images\n- INFO or DELETE`,
                attachment: fs.createReadStream(combinedPath),
            });

            global.GoatBot.onReply.set(reply.messageID, {
                commandName: this.config.name,
                messageID: reply.messageID,
                images: imagePaths,
                grid: combinedPath,
                author: userID,
            });
        } catch (err) {
            Logger.error(`Error generating image: ${err.stack}`);
            message.reply("❌ | Something went wrong while generating images.");
        }
    },

    onReply: async function ({ event, Reply, args, message }) {
        const { author, images, grid } = Reply;
        if (event.senderID !== author) return;

        const input = args.join(" ").toUpperCase();

        try {
            if (input === "INFO") {
                return message.reply(
                    "ℹ️ Options:\n- Reply `U1`–`U4` to select an image.\n- Reply `U1 U3` for multiple.\n- Reply `U1-U3` for range.\n- Reply `DELETE` to clean files."
                );
            }

            if (input === "DELETE") {
                CacheManager.cleanup([...images, grid]);
                return message.reply("🗑️ | Temporary files deleted.");
            }

            const rangeMatch = input.match(/^U([1-4])\s*-\s*U([1-4])$/);
            if (rangeMatch) {
                const start = parseInt(rangeMatch[1]);
                const end = parseInt(rangeMatch[2]);
                const selected = images.slice(start - 1, end);
                return message.reply({
                    body: `📦 Sending images ${start}–${end}`,
                    attachment: selected.map((p) => fs.createReadStream(p)),
                });
            }

            const parts = input.split(/\s+/).filter((x) => /^U[1-4]$/.test(x));
            if (parts.length > 1) {
                const selected = parts.map((p) => images[parseInt(p.slice(1)) - 1]);
                return message.reply({
                    body: `📦 Sending ${parts.join(", ")}`,
                    attachment: selected.map((p) => fs.createReadStream(p)),
                });
            }

            if (/^U[1-4]$/.test(input)) {
                const idx = parseInt(input.slice(1)) - 1;
                return message.reply({
                    body: `🖼️ Here’s your selected image: ${input}`,
                    attachment: fs.createReadStream(images[idx]),
                });
            }

            return message.reply("⚠️ | Invalid reply. Use U1–U4, ranges (U1-U3), multiple (U1 U3), INFO, or DELETE.");
        } catch (err) {
            Logger.error(`Reply error: ${err.message}`);
            message.reply("❌ | Failed to process your reply.");
        }
    },
};
