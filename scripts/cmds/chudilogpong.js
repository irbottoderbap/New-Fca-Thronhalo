const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

// File Metadata
const FILE_INFO = {
    fileName: "chudilogpong",
    fileVersion: "2.8.0",
    fileOwner: "Israfil ThronHalo",
    description: "Chudilog Pong - Generate user info cards with style"
};

const W = 600, H = 800;

async function drawChudilogAvatar(ctx, avatarUrl, x, y, size, ringColors) {
    const sides = 8; // Octagon shape for uniqueness
    const radius = size / 2;

    // Draw glowing rings
    for (let i = 0; i < ringColors.length; i++) {
        ctx.beginPath();
        for (let j = 0; j < sides; j++) {
            const angle = (Math.PI * 2 / sides) * j;
            const rx = x + radius + Math.cos(angle) * (radius + i * 6);
            const ry = y + radius + Math.sin(angle) * (radius + i * 6);
            if (j === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
        }
        ctx.closePath();
        ctx.strokeStyle = ringColors[i];
        ctx.lineWidth = 3;
        ctx.shadowColor = ringColors[i];
        ctx.shadowBlur = 15;
        ctx.stroke();
    }

    let img;
    try { 
        img = await loadImage(avatarUrl); 
    } catch { 
        // Fallback to a goat avatar if user avatar fails
        img = await loadImage("https://i.imgur.com/5L1We9h.jpeg");
    }

    // Clip and draw avatar
    ctx.save();
    ctx.beginPath();
    for (let j = 0; j < sides; j++) {
        const angle = (Math.PI * 2 / sides) * j;
        const rx = x + radius + Math.cos(angle) * radius;
        const ry = y + radius + Math.sin(angle) * radius;
        if (j === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
}

async function createChudilogCard(userInfo) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Background gradient - Chudilog theme
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#1a2b6d");
    gradient.addColorStop(1, "#0d1440");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Floating particles
    const particles = [
        { x: 40, y: 100, r: 4 }, { x: 150, y: 250, r: 3 },
        { x: 400, y: 180, r: 5 }, { x: 320, y: 350, r: 3 },
        { x: 80, y: 450, r: 4 }, { x: 450, y: 500, r: 3 },
        { x: 200, y: 600, r: 5 }, { x: 500, y: 650, r: 3 }
    ];

    for (const p of particles) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(102, 255, 204, 0.2)";
        ctx.shadowColor = "#66ffcc";
        ctx.shadowBlur = 12;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw user avatar with Chudilog style
    await drawChudilogAvatar(ctx, userInfo.avatar, W / 2 - 80, 80, 160, [
        "#66ffcc", "#00cc99", "#009973"
    ]);

    // Title
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#66ffcc";
    ctx.shadowColor = "#00cc99";
    ctx.shadowBlur = 20;
    ctx.fillText("CHUDILOG PONG CARD", W / 2, 300);

    // Username
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#88ffdd";
    ctx.shadowBlur = 15;
    ctx.fillText(userInfo.name, W / 2, 340);

    // Info box
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(50, 380, W - 100, 320);

    ctx.strokeStyle = "#00cc99";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#66ffcc";
    ctx.shadowBlur = 10;
    ctx.strokeRect(50, 380, W - 100, 320);

    // User info
    ctx.font = "18px Arial";
    ctx.fillStyle = "#ccffee";
    ctx.shadowColor = "#66ffcc";
    ctx.shadowBlur = 8;

    const infoLines = [
        `🎮 Player: ${userInfo.name}`,
        `🏆 Level: ${userInfo.level || "Chudilog Master"}`,
        `⚡ Power: ${userInfo.power || "Goat Energy"}`,
        `🎯 Score: ${userInfo.score || "9999"}`,
        `🐐 Spirit: ${userInfo.spirit || "Mountain Goat"}`,
        `💫 Status: ${userInfo.status || "Pong Champion"}`,
        `🎨 Style: ${userInfo.style || "Chudilog Pro"}`,
        `🏅 Rank: ${userInfo.rank || "#1 Goat"}`,
        `⏰ Generated: ${new Date().toLocaleString()}`
    ];

    let yPos = 420;
    for (const line of infoLines) {
        ctx.fillText(line, W / 2, yPos);
        yPos += 32;
    }

    // Footer with file info
    ctx.font = "italic 14px Arial";
    ctx.fillStyle = "#99ffdd";
    ctx.shadowBlur = 8;
    ctx.fillText(`File: ${FILE_INFO.fileName} v${FILE_INFO.fileVersion}`, W / 2, H - 40);
    ctx.fillText(`Created by: ${FILE_INFO.fileOwner}`, W / 2, H - 20);

    return canvas;
}

// Function to handle chudilogpong command
async function chudilogpong(userMention = null) {
    console.log(`🎮 Executing: chudilogpong ${userMention || ''}`);
    
    // Default user info - you can modify this based on actual user data
    const userInfo = {
        name: userMention || "Israfil ThronHalo",
        avatar: "https://i.imgur.com/5L1We9h.jpeg", // Default goat avatar
        level: "Supreme Goat Overlord",
        power: "Maximum Chudilog",
        score: "Infinite",
        spirit: "Legendary Goat",
        status: "Pong God",
        style: "Chudilog Extreme",
        rank: "GOAT #1"
    };

    try {
        const canvas = await createChudilogCard(userInfo);
        const buffer = canvas.toBuffer("image/png");
        
        // Ensure cache directory exists
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        const filePath = path.join(cacheDir, `chudilog_${Date.now()}.png`);
        fs.writeFileSync(filePath, buffer);
        
        console.log(`✅ Chudilog Pong card generated: ${filePath}`);
        return filePath;
        
    } catch (error) {
        console.error("❌ Error generating Chudilog card:", error);
        return null;
    }
}

// Command handler for bot integration
module.exports = {
    config: {
        name: "chudilogpong",
        aliases: ["cpong", "chudicard"],
        version: FILE_INFO.fileVersion,
        author: FILE_INFO.fileOwner,
        countDown: 10,
        role: 0,
        shortDescription: "Generate Chudilog Pong user cards",
        longDescription: "Create awesome Chudilog Pong themed user info cards with custom avatars",
        category: "fun",
        guide: {
            en: "{p}chudilogpong [@mention] - Generate a Chudilog Pong card for yourself or mentioned user"
        }
    },

    onStart: async function ({ event, message, usersData, args }) {
        try {
            let targetUserID;
            let userName;

            if (Object.keys(event.mentions).length > 0) {
                // If user mentioned someone
                targetUserID = Object.keys(event.mentions)[0];
                userName = event.mentions[targetUserID];
            } else if (args[0]) {
                // If user provided user ID
                targetUserID = args[0];
                try {
                    const userInfo = await usersData.get(targetUserID);
                    userName = userInfo.name;
                } catch {
                    userName = "Unknown User";
                }
            } else {
                // Default to command user
                targetUserID = event.senderID;
                const userInfo = await usersData.get(targetUserID);
                userName = userInfo.name;
            }

            // Get user avatar URL (you might need to adjust this based on your bot's user data structure)
            let avatarUrl = `https://graph.facebook.com/${targetUserID}/picture?width=500&height=500`;
            
            const userInfo = {
                name: userName,
                avatar: avatarUrl,
                level: ["Goat Novice", "Pong Apprentice", "Chudilog Warrior", "Supreme Goat"][Math.floor(Math.random() * 4)],
                power: ["Basic Bounce", "Power Shot", "Goat Laser", "Chudilog Chaos"][Math.floor(Math.random() * 4)],
                score: Math.floor(Math.random() * 10000).toString(),
                spirit: ["Baby Goat", "Mountain Goat", "Cosmic Goat", "Legendary Goat"][Math.floor(Math.random() * 4)],
                status: ["Training", "Competing", "Champion", "Legend"][Math.floor(Math.random() * 4)],
                style: ["Casual", "Pro", "Extreme", "Chudilog"][Math.floor(Math.random() * 4)],
                rank: `#${Math.floor(Math.random() * 100) + 1}`
            };

            console.log(`🎮 Generating Chudilog card for: ${userName}`);
            
            const canvas = await createChudilogCard(userInfo);
            const buffer = canvas.toBuffer("image/png");
            
            const cacheDir = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir, { recursive: true });
            }
            
            const filePath = path.join(cacheDir, `chudilog_${targetUserID}_${Date.now()}.png`);
            fs.writeFileSync(filePath, buffer);

            await message.reply({
                body: `🎮 CHUDILOG PONG CARD 🎮\nPlayer: ${userName}\nLevel: ${userInfo.level}\nPower: ${userInfo.power}\n\nGenerated by ${FILE_INFO.fileOwner}`,
                attachment: fs.createReadStream(filePath)
            });

            // Clean up after sending
            setTimeout(() => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }, 5000);

        } catch (error) {
            console.error("❌ Error in chudilogpong command:", error);
            await message.reply("❌ Failed to generate Chudilog Pong card. Please try again!");
        }
    },

    // Export for direct usage
    chudilogpong,
    FILE_INFO
};

// If run directly, test the function
if (require.main === module) {
    console.log("🚀 Testing Chudilog Pong Command...");
    console.log(`📁 File: ${FILE_INFO.fileName}`);
    console.log(`👤 Owner: ${FILE_INFO.fileOwner}`);
    console.log(`🔖 Version: ${FILE_INFO.fileVersion}\n`);
    
    chudilogpong("Test User").then(filePath => {
        if (filePath) {
            console.log(`✅ Test successful! Card saved at: ${filePath}`);
        } else {
            console.log("❌ Test failed!");
        }
    });
}
