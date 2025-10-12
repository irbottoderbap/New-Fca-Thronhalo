const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`
  );
  return base.data.api;
};

// Function to wrap text inside box width
function wrapText(ctx, text, x, y, maxWidth, lineHeight){
  const words = text.split(" ");
  let line = "";
  for(let n=0;n<words.length;n++){
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if(metrics.width > maxWidth && n>0){
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    }else{
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
  return y + lineHeight;
}

module.exports = {
  config: {
    name: "spy",
    aliases: ["whoishe", "whoisshe", "whoami", "atake"],
    version: "6.0",
    role: 0,
    author: "Dipto",
    Description: "User info with smooth bottom and fit text",
    category: "information",
    countDown: 10,
  },

  onStart: async function ({ event, message, usersData, api }) {
    try {
      const uid1 = event.senderID;
      const uid2 = Object.keys(event.mentions || {})[0];
      let uid = uid1;
      if (uid2) uid = uid2;
      else if (event.type === "message_reply") uid = event.messageReply.senderID;

      // Baby teach
      const response = await axios.get(`${await baseApiUrl()}/baby?list=all`);
      const dataa = response.data || { teacher: { teacherList: [] } };
      let babyTeach = 0;
      if (dataa?.teacher?.teacherList?.length) {
        babyTeach = dataa.teacher.teacherList.find((t) => t[uid])?.[uid] || 0;
      }

      const userInfo = await api.getUserInfo(uid);
      const avatarUrl = await usersData.getAvatarUrl(uid);
      const money = (await usersData.get(uid)).money;
      const allUser = await usersData.getAll();
      const rank = allUser.slice().sort((a,b)=>b.exp-a.exp).findIndex(u=>u.userID===uid)+1;
      const moneyRank = allUser.slice().sort((a,b)=>b.money-a.money).findIndex(u=>u.userID===uid)+1;

      let genderText;
      switch(userInfo[uid].gender){
        case 1: genderText="🙋🏻‍♀️ Girl"; break;
        case 2: genderText="🙋🏻‍♂️ Boy"; break;
        default: genderText="🤷🏻‍♂️ Gay";
      }
      const position = userInfo[uid].type;

      // Canvas
      const canvasWidth = 1100;
      const canvasHeight = 1400;
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      // Load background
      const background = await loadImage("https://files.catbox.moe/irtjb0.jpg");

      // Crop ratio and height
      const cropRatio = 0.82;
      const bgHeight = canvasHeight * cropRatio;

      // Mirrored smooth bottom shape
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, bgHeight - 50);
      ctx.bezierCurveTo(canvasWidth * 0.25, bgHeight + 50, canvasWidth * 0.75, bgHeight + 50, canvasWidth, bgHeight - 50);
      ctx.lineTo(canvasWidth, 0);
      ctx.closePath();
      ctx.clip();

      // Draw background inside clipped area
      ctx.drawImage(background, 0, 0, background.width, background.height*cropRatio, 0, 0, canvasWidth, bgHeight);
      ctx.restore();

      // Light overlay
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0,0,canvasWidth,bgHeight);

      // Avatar square + lighting frame
      const avatarSize = 250;
      const avatarX = 50;
      const avatarY = 50;
      const avatar = await loadImage(avatarUrl);
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 8;
      ctx.shadowColor = "rgba(255,255,255,0.7)";
      ctx.shadowBlur = 20;
      ctx.strokeRect(avatarX, avatarY, avatarSize, avatarSize);
      ctx.shadowBlur = 0;

      // Boxes
      const boxX = 330;
      const boxWidth = canvasWidth - boxX - 50;
      const boxHeightBasic = 500;
      const boxHeightStats = 400;

      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(boxX, 50, boxWidth, boxHeightBasic);
      ctx.fillRect(boxX, 580, boxWidth, boxHeightStats);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX,50,boxWidth,boxHeightBasic);
      ctx.strokeRect(boxX,580,boxWidth,boxHeightStats);

      // Text inside boxes with wrap
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "left";
      const lineHeight = 38;

      const basicLines = [
        `👤 Name: ${userInfo[uid].name.toUpperCase()}`,
        `⚧ Gender: ${genderText}`,
        `🆔 UID: ${uid}`,
        `🏷️ Class: ${position ? position.toUpperCase() : "Normal User 🥺"}`,
        `📛 Username: ${userInfo[uid].vanity ? userInfo[uid].vanity.toUpperCase() : "None"}`,
        `🌐 Profile: ${userInfo[uid].profileUrl}`,
        `🎂 Birthday: ${userInfo[uid].isBirthday !== false ? userInfo[uid].isBirthday : "Private"}`,
        `📝 Nickname: ${userInfo[uid].alternateName ? userInfo[uid].alternateName.toUpperCase() : "None"}`,
        `🤝 Bot Connect: ${userInfo[uid].isFriend ? "Yes ✅" : "No ❎"}`
      ];

      let yStart = 80;
      for(let line of basicLines){
        yStart = wrapText(ctx, line, boxX+25, yStart, boxWidth-50, lineHeight);
      }

      const statsLines = [
        `💰 Money: $${formatMoney(money)}`,
        `📊 Rank: #${rank} / ${allUser.length}`,
        `💸 Money Rank: #${moneyRank} / ${allUser.length}`,
        `👶 Baby Teach: ${babyTeach || 0}`
      ];
      yStart = 610;
      for(let line of statsLines){
        yStart = wrapText(ctx, line, boxX+25, yStart, boxWidth-50, lineHeight);
      }

      // APON GOAT BOT text
      ctx.font = "bold 40px Arial";
      ctx.textAlign = "center";
      ctx.fillText("ISRAFIL GOAT BOT", canvasWidth/2, bgHeight - 60);

      // Save and send image
      const tempFilePath = path.join(__dirname, `spy_image_${uid}.png`);
      fs.writeFileSync(tempFilePath, canvas.toBuffer("image/png"));
      message.reply({ attachment: fs.createReadStream(tempFilePath) });

    } catch(err){
      console.error(err);
      message.reply("❌ Something went wrong while generating the image.");
    }
  }
};

function formatMoney(num){
  const units = ["","K","M","B","T","Q","Qi","Sx","Sp","Oc","N","D"];
  let unit = 0;
  while(num>=1000 && ++unit<units.length) num/=1000;
  return num.toFixed(1).replace(/\.0$/,"")+units[unit];
}
