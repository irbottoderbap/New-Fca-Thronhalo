module.exports = {
  config: {
    name: "info3",
    aliases: ["about", "me"],
    version: "2.0",
    author: "IR ISRAFIL",
    countDown: 5,
    role: 0,
    shortDescription: "Show your premium royal profile",
    longDescription: "Displays a stylish cyber royal info card",
    category: "info"
  },

  onStart: async function ({ message }) {
    const profile = `
╔══━━━─── • 🕷️ • ───━━━══╗
        𝐓𝐇𝐄 𝐃𝐀𝐑𝐊 𝐒𝐄𝐑𝐕𝐄𝐑 𝐈𝐑
╚══━━━─── • 🕷️ • ───━━━══╝

💳 𝐍𝐚𝐦𝐞 : 『 𝐈𝐑 𝐈𝐬𝐫𝐚𝐟𝐢𝐥 』
🗓️ 𝐃.𝐎.𝐁 : 『 01•01•200* 』
🏘️ 𝐀𝐝𝐝𝐫𝐞𝐬𝐬 : 『 𝐃𝐡𝐚𝐤𝐚 』

🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : 『 Zetheres Zion| IR Israfil』
📸 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 : 『 @irisrafil716 』


📧 𝐆𝐦𝐚𝐢𝐥 : 『 irisrafil00@gmail.com 』

╔══━━━─── • ⚡ • ───━━━══╗
           "𝐈 𝐑𝐔𝐋𝐄 𝐓𝐇𝐄 𝐆𝐀𝐌𝐄"
╚══━━━─── • ⚡ • ───━━━══╝
    `;

    message.reply(profile);
  }
};
