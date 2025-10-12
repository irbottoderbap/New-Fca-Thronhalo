const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pair7",
    version: "4.0",
    author: "Israfil ThronHalo",
    role: 0,
    guide: "{pn} <type 1-25>"
  },

  onStart: async function ({ event, api, args, usersData }) {
    const type = parseInt(args[0]) || 1;
    if (type < 1 || type > 25)
      return api.sendMessage("❌ Type must be between 1 and 25.", event.threadID);

    const senderID = event.senderID;
    const threadInfo = await api.getThreadInfo(event.threadID);
    const userGender = threadInfo.userInfo.find(u => u.id === senderID)?.gender;

    const pairCandidates = threadInfo.userInfo.filter(
      u => u.gender && u.gender !== userGender && u.id !== senderID
    );

    if (pairCandidates.length === 0)
      return api.sendMessage("😢 No opposite gender user found!", event.threadID);

    const pairUser = pairCandidates[Math.floor(Math.random() * pairCandidates.length)];
    const senderName = threadInfo.userInfo.find(u => u.id === senderID)?.name || "You";
    const pairName = pairUser.name;

    const userpp = await usersData.getAvatarUrl(senderID);
    const opponentpp = await usersData.getAvatarUrl(pairUser.id);

    const imageBuffer = await drawPairImage(type, senderName, pairName, userpp, opponentpp);
    const filePath = path.join(__dirname, "cache", `pair_${Date.now()}.png`);
    fs.writeFileSync(filePath, imageBuffer);

    const responseMessages = [
      `💌 ${senderName} just proposed to ${pairName} — and love is in the air! 💞`,
      `🌹 ${senderName} says: "Would you be my forever, ${pairName}?"`,
      `💍 ${pairName}, will you marry ${senderName}? Destiny just matched you! 💖`,
      `💘 ${senderName} & ${pairName}, you're now bound by love's magic!`,
      `💕 A spark has ignited! ${senderName} and ${pairName} are now a couple!`
    ];

    const finalMessage = responseMessages[Math.floor(Math.random() * responseMessages.length)];

    api.sendMessage({
      body: finalMessage,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath));
  }
};

async function drawPairImage(type, name1, name2, avatarBuf1, avatarBuf2) {
  const width = 1400, height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  drawLuxuryBackground(ctx, canvas, type);

  const avatar1 = await loadImage(avatarBuf1);
  const avatar2 = await loadImage(avatarBuf2);
  const circle1 = circleImage(avatar1);
  const circle2 = circleImage(avatar2);

  ctx.textAlign = "center";

  if (type >= 1 && type <= 5) drawLuxuryLayout1to5(ctx, circle1, circle2, name1, name2, width, height, type);
  else if (type >= 6 && type <= 10) drawLuxuryLayout6to10(ctx, circle1, circle2, name1, name2, width, height, type);
  else if (type >= 11 && type <= 15) drawLuxuryLayout11to15(ctx, circle1, circle2, name1, name2, width, height, type);
  else if (type >= 16 && type <= 20) drawLuxuryLayout16to20(ctx, circle1, circle2, name1, name2, width, height, type);
  else if (type >= 21 && type <= 25) drawLuxuryLayout21to25(ctx, circle1, circle2, name1, name2, width, height, type);

  return canvas.toBuffer("image/png");
}

function drawLuxuryBackground(ctx, canvas, type) {
  const width = canvas.width, height = canvas.height;
  let gradient;

  switch (type) {
    case 1: gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#FFD700"); gradient.addColorStop(1, "#FF8C00"); break;
    case 2: gradient = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, 700);
      gradient.addColorStop(0, "#9B59B6"); gradient.addColorStop(1, "#2C3E50"); break;
    case 3: gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "#FAD0C4"); gradient.addColorStop(1, "#FFD1FF"); break;
    case 4: gradient = ctx.createLinearGradient(0, height, width, 0);
      gradient.addColorStop(0, "#FF5F6D"); gradient.addColorStop(1, "#FFC371"); break;
    case 5: gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 600);
      gradient.addColorStop(0, "#B2FEFA"); gradient.addColorStop(1, "#0ED2F7"); break;

    case 6: case 7: case 8: case 9: case 10:
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#FF6B6B"); gradient.addColorStop(0.5, "#FFD93D"); gradient.addColorStop(1, "#6BCB77");
      break;

    case 11: case 12: case 13:
      gradient = ctx.createRadialGradient(width / 3, height / 3, 100, width / 2, height / 2, 700);
      gradient.addColorStop(0, "#ff9a9e"); gradient.addColorStop(1, "#fad0c4");
      break;

    case 14: case 15:
      gradient = ctx.createLinearGradient(width, 0, 0, height);
      gradient.addColorStop(0, "#4A00E0"); gradient.addColorStop(1, "#8E2DE2");
      break;

    case 16: case 17: case 18: case 19: case 20:
      gradient = ctx.createRadialGradient(width / 2, height / 2, 150, width / 2, height / 2, 650);
      gradient.addColorStop(0, "#d299c2"); gradient.addColorStop(1, "#fef9d7");
      break;

    case 21: case 22: case 23: case 24: case 25:
      gradient = ctx.createLinearGradient(0, height, width, 0);
      gradient.addColorStop(0, "#0066ff"); gradient.addColorStop(1, "#00ccff");
      break;

    default:
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#FE5196"); gradient.addColorStop(1, "#01BFAB");
      break;
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  addGoldSparkles(ctx, width, height);
  addSoftGlowHearts(ctx, width, height);
}

function addGoldSparkles(ctx, width, height) {
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3 + 1;
    ctx.fillStyle = `rgba(255, 223, 0, ${Math.random() * 0.8})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function addSoftGlowHearts(ctx, width, height) {
  ctx.shadowBlur = 15;
  ctx.shadowColor = "rgba(255, 105, 180, 0.5)";
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 25 + 10;
    drawHeart(ctx, x, y, size, "rgba(255, 105, 180, 0.15)");
  }
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}

function drawHeart(ctx, x, y, size, color) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
  ctx.bezierCurveTo(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawLuxuryText(ctx, text, x, y, fontSize = 48, fontWeight = "bold", color = "#fff", shadowColor = "rgba(0,0,0,0.4)", shadowBlur = 5) {
  ctx.font = `${fontWeight} ${fontSize}px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`;
  ctx.fillStyle = color;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}

function circleImage(image) {
  const size = 300;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, 0, 0, size, size);
  ctx.restore();

  ctx.strokeStyle = "rgba(255, 215, 0, 0.9)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
  ctx.stroke();

  return canvas;
}

function drawLuxuryLayout1to5(ctx, c1, c2, n1, n2, w, h, t) {
  ctx.shadowColor = "rgba(255, 20, 147, 0.8)";
  ctx.shadowBlur = 30;
  switch(t) {
    case 1:
      ctx.drawImage(c1, 200, 250, 300, 300);
      ctx.drawImage(c2, w - 500, 250, 300, 300);
      drawLuxuryText(ctx, `${n1} ❤️ ${n2}`, w/2, 130, 56, "bold", "#FF1493", "rgba(255,20,147,0.7)", 8);
      drawLuxuryText(ctx, "A Love to Remember", w/2, h - 80, 40, "600", "#FFD700", "rgba(0,0,0,0.5)", 6);
      break;
    case 2:
      ctx.drawImage(c1, w/2 - 150, 120, 300, 300);
      ctx.drawImage(c2, w/2 - 150, 460, 300, 300);
      drawLuxuryText(ctx, "🌟 Matched Souls 🌟", w/2, 100, 48, "bold", "#ff69b4", "rgba(255,20,147,0.8)", 10);
      drawLuxuryText(ctx, `${n1} & ${n2}`, w/2, h - 60, 44, "600", "#FFD700", "rgba(0,0,0,0.6)", 8);
      ctx.strokeStyle = "rgba(255, 20, 147, 0.6)";
      ctx.lineWidth = 6;
      ctx.shadowColor = "rgba(255, 105, 180, 0.7)";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(w/2, 420);
      ctx.lineTo(w/2, 460);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    case 3:
      ctx.drawImage(c1, 450, 250, 350, 350);
      ctx.drawImage(c2, 700, 280, 350, 350);
      drawHeartFrame(ctx, w / 2, 400, 350, "rgba(255, 215, 0, 0.9)", 8);
      drawLuxuryText(ctx, `${n1} + ${n2}`, w/2, 150, 56, "bold", "#FFD700", "rgba(0,0,0,0.7)", 10);
      drawLuxuryText(ctx, "Bound by Gold", w/2, h - 70, 40, "600", "#ffcc00cc", "rgba(0,0,0,0.5)", 7);
      break;
    case 4:
      ctx.drawImage(c1, 150, 300, 280, 280);
      ctx.drawImage(c2, w - 430, 300, 280, 280);
      drawLuxuryText(ctx, `✨ ${n1} & ${n2} ✨`, w/2, 100, 50, "bold", "#ffffffcc", "rgba(0,0,0,0.6)", 8);
      drawLuxuryText(ctx, "Eternal Sparkle", w/2, h - 50, 36, "600", "#ffe1f7", "rgba(0,0,0,0.5)", 6);
      for (let i=0; i<15; i++) {
        let x = Math.random()*(w-100)+50, y = Math.random()*(h-100)+50;
        drawStar(ctx, x, y, 15, "rgba(255, 255, 220, 0.5)", 5);
      }
      break;
    case 5:
      ctx.drawImage(c1, w/4 - 150, h/2 - 150, 300, 300);
      ctx.drawImage(c2, (3*w)/4 - 150, h/2 - 150, 300, 300);
      drawLuxuryText(ctx, `${n1} 💕 ${n2}`, w/2, 100, 54, "bold", "#ff6699", "rgba(255,20,147,0.6)", 9);
      drawLuxuryText(ctx, "Love's Perfect Harmony", w/2, h - 70, 40, "600", "#ffccdd", "rgba(0,0,0,0.5)", 7);
      drawDoubleHeart(ctx, w/2, h/2, 120, "#ff3366");
      break;
  }
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}

function drawLuxuryLayout6to10(ctx, c1, c2, n1, n2, w, h, t) {
  switch(t){
    case 6:
      ctx.drawImage(c1, 250, 250, 300, 300);
      ctx.drawImage(c2, 850, 250, 300, 300);
      drawLuxuryText(ctx, `${n1} ❤️ ${n2}`, w/2, 130, 56, "bold", "#FF1493", "rgba(255,20,147,0.7)", 8);
      drawHeart(ctx, w/2, h/2, 100, "#ff0066");
      break;
    case 7:
      ctx.drawImage(c1, 150, 500, 250, 250);
      ctx.drawImage(c2, 1000, 50, 250, 250);
      drawLine(ctx, 275, 625, 1125, 175, "#ff99cc", 6);
      drawLuxuryText(ctx, "Love Across Distance", w/2, 420, 42, "bold", "#ff66aa", "rgba(255,20,147,0.8)", 10);
      break;
    case 8:
      ctx.drawImage(c1, 575, 100, 250, 250);
      ctx.drawImage(c2, 575, 450, 250, 250);
      drawLine(ctx, 700, 225, 700, 575, "#ffccff", 4);
      drawLuxuryText(ctx, "💫 Matched Souls 💫", w/2, 400, 48, "bold", "#cc66cc", "rgba(255,20,147,0.6)", 12);
      break;
    case 9:
      ctx.drawImage(c1, 400, 200, 200, 200);
      ctx.drawImage(c2, 800, 200, 200, 200);
      drawLuxuryText(ctx, "🔒 Love Locked 🔒", w/2, 520, 42, "bold", "#cc3366", "rgba(255,0,77,0.6)", 10);
      ctx.font = "30px Arial";
      ctx.fillStyle = "#ff6699cc";
      ctx.fillText(`${n1} + ${n2}`, w/2, 560);
      break;
    case 10:
      ctx.drawImage(c1, 100, 200, 250, 250);
      ctx.drawImage(c2, 1050, 400, 250, 250);
      drawHeart(ctx, w/2, 400, 100, "#ff0033");
      drawLuxuryText(ctx, "💘 Unexpected Chemistry 💘", w/2, 700, 36, "regular", "#ffe6f2", "rgba(255,105,180,0.7)", 8);
      break;
  }
}

function drawLuxuryLayout11to15(ctx, c1, c2, n1, n2, w, h, t) {
  switch(t){
    case 11:
      ctx.drawImage(c1, 200, 150, 250, 250);
      ctx.drawImage(c2, 950, 150, 250, 250);
      drawArc(ctx, w/2, 400, 150, "#ff69b4", 5);
      drawLuxuryText(ctx, `${n1} & ${n2}`, w/2, 650, 48, "bold", "#ffd1dc", "rgba(255,20,147,0.7)", 8);
      break;
    case 12:
      ctx.drawImage(c1, 300, 400, 300, 300);
      ctx.drawImage(c2, 800, 400, 300, 300);
      drawStar(ctx, w/2, 200, 50, "#ffff99", 5);
      drawLuxuryText(ctx, "🌟 Star-Crossed Lovers 🌟", w/2, 100, 42, "bold", "#fffacd", "rgba(0,0,0,0.5)", 8);
      break;
    case 13:
      ctx.drawImage(c1, 100, 100, 200, 200);
      ctx.drawImage(c2, 1100, 500, 200, 200);
      drawLine(ctx, 200, 200, 1200, 600, "#ff4040", 8);
      drawLuxuryText(ctx, "Connected by Fate", w/2, 400, 40, "bold", "#ff6666", "rgba(0,0,0,0.7)", 10);
      break;
    case 14:
      ctx.drawImage(c1, 500, 200, 250, 250);
      ctx.drawImage(c2, 650, 350, 250, 250);
      drawHeartFrame(ctx, w/2, 400, 300, "#ff1493");
      drawLuxuryText(ctx, `${n1} 💖 ${n2}`, w/2, 700, 36, "bold", "#ff69b4", "rgba(0,0,0,0.6)", 8);
      break;
    case 15:
      ctx.drawImage(c1, 300, 100, 200, 200);
      ctx.drawImage(c2, 900, 100, 200, 200);
      drawLuxuryText(ctx, "Eternal Bond", w/2, 500, 50, "bold", "#ffcccb", "rgba(0,0,0,0.7)", 10);
      drawHeart(ctx, w/2, 600, 80, "#ff4500");
      break;
  }
}

function drawLuxuryLayout16to20(ctx, c1, c2, n1, n2, w, h, t) {
  switch(t){
    case 16:
      ctx.drawImage(c1, 400, 300, 250, 250);
      ctx.drawImage(c2, 750, 300, 250, 250);
      drawDoubleHeart(ctx, w/2, 150, 100, "#ff69b4");
      drawLuxuryText(ctx, "💞 Together Forever 💞", w/2, 650, 42, "bold", "#ff69b4", "rgba(0,0,0,0.6)", 9);
      break;
    case 17:
      ctx.drawImage(c1, 150, 300, 200, 200);
      ctx.drawImage(c2, 1050, 300, 200, 200);
      drawArc(ctx, w/2, 400, 200, "#ffb6c1", 6);
      drawLuxuryText(ctx, "Love's Embrace", w/2, 100, 38, "bold", "#ff99cc", "rgba(0,0,0,0.5)", 8);
      break;
    case 18:
      ctx.drawImage(c1, 600, 100, 250, 250);
      ctx.drawImage(c2, 600, 450, 250, 250);
      drawStar(ctx, w/2, 400, 60, "#ffd700", 5);
      drawLuxuryText(ctx, "✨ Destined Pair ✨", w/2, 700, 40, "bold", "#ffd700", "rgba(0,0,0,0.6)", 10);
      break;
    case 19:
      ctx.drawImage(c1, 200, 400, 300, 300);
      ctx.drawImage(c2, 900, 400, 300, 300);
      drawLine(ctx, 350, 550, 1050, 550, "#ff6347", 5);
      ctx.fillStyle = "#ffe4e1";
      ctx.font = "46px Arial";
      ctx.fillText(`${n1} + ${n2} = 💕`, w/2, 200);
      break;
    case 20:
      ctx.drawImage(c1, 100, 200, 250, 250);
      ctx.drawImage(c2, 1050, 200, 250, 250);
      drawHeartFrame(ctx, w/2, 400, 350, "#ff00ff");
      drawLuxuryText(ctx, "💗 Soulmates 💗", w/2, 650, 44, "bold", "#ff00ff", "rgba(0,0,0,0.6)", 10);
      break;
  }
}

function drawLuxuryLayout21to25(ctx, c1, c2, n1, n2, w, h, t) {
  switch(t){
    case 21:
      ctx.drawImage(c1, 350, 250, 280, 280);
      ctx.drawImage(c2, 770, 250, 280, 280);
      drawLuxuryText(ctx, `${n1} & ${n2}`, w/2, 130, 54, "bold", "#00ffff", "rgba(0,0,0,0.7)", 10);
      drawLuxuryText(ctx, "Infinite Love", w/2, h - 70, 40, "600", "#00ffffcc", "rgba(0,0,0,0.6)", 8);
      drawInfinitySymbol(ctx, w/2, h/2, 120, "#00ffff");
      break;
    case 22:
      ctx.drawImage(c1, 200, 150, 320, 320);
      ctx.drawImage(c2, 880, 150, 320, 320);
      drawLuxuryText(ctx, "💎 Precious Pair 💎", w/2, 100, 48, "bold", "#8a2be2", "rgba(0,0,0,0.5)", 9);
      drawLuxuryText(ctx, `${n1} + ${n2}`, w/2, h - 80, 44, "600", "#b565a7", "rgba(0,0,0,0.6)", 7);
      break;
    case 23:
      ctx.drawImage(c1, 480, 300, 280, 280);
      ctx.drawImage(c2, 700, 300, 280, 280);
      drawLuxuryText(ctx, "Two Souls, One Heart", w/2, 150, 46, "bold", "#ff6f91", "rgba(0,0,0,0.7)", 10);
      drawLuxuryText(ctx, `${n1} ❤️ ${n2}`, w/2, h - 75, 40, "600", "#ff85a1", "rgba(0,0,0,0.6)", 8);
      break;
    case 24:
      ctx.drawImage(c1, 250, 300, 300, 300);
      ctx.drawImage(c2, 850, 300, 300, 300);
      drawLuxuryText(ctx, "Bound by Elegance", w/2, 120, 48, "bold", "#daa520", "rgba(0,0,0,0.5)", 8);
      drawLuxuryText(ctx, `${n1} & ${n2}`, w/2, h - 60, 44, "600", "#d4af37cc", "rgba(0,0,0,0.6)", 8);
      break;
    case 25:
      ctx.drawImage(c1, 300, 250, 310, 310);
      ctx.drawImage(c2, 790, 250, 310, 310);
      drawLuxuryText(ctx, "Forever Linked", w/2, 130, 54, "bold", "#ff1493", "rgba(0,0,0,0.8)", 11);
      drawLuxuryText(ctx, `${n1} ❤️ ${n2}`, w/2, h - 75, 46, "600", "#ff69b4cc", "rgba(0,0,0,0.6)", 9);
      drawDoubleHeart(ctx, w/2, h/2, 150, "#ff1493");
      break;
  }
}

function drawLine(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawArc(ctx, x, y, radius, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawStar(ctx, x, y, radius, color, points) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? radius : radius / 2;
    const angle = (Math.PI / points) * i;
    ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
}

function drawHeartFrame(ctx, x, y, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(x, y - size / 3);
  ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size, y + size / 6, x, y + size / 2);
  ctx.bezierCurveTo(x + size, y + size / 6, x + size / 2, y - size / 2, x, y - size / 3);
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}

function drawDoubleHeart(ctx, x, y, size, color) {
  drawHeart(ctx, x - size / 2, y, size * 0.7, color);
  drawHeart(ctx, x + size / 2, y, size * 0.7, color);
}

function drawInfinitySymbol(ctx, x, y, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(x - size / 2, y);
  ctx.bezierCurveTo(x - size, y - size, x, y - size, x, y);
  ctx.bezierCurveTo(x, y + size, x + size, y + size, x + size / 2, y);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}
