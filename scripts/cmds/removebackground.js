const axios = require("axios");
 
module.exports = {
  config: {
    name: "rmvbg",
    aliases: ["removebg", "rbg"],
    role: 0,
    author: "SIDDIK",
    countDown: 5,
    longDescription: "Remove background from images.",
    category: "image",
    guide: {
      en: "${pn} reply to an image to remove its background."
    }
  },
  onStart: async function ({ message, api, args, event }) {
    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
      return message.reply("𝗣𝗹𝗲𝗮𝘀𝗲 𝗥𝗲𝗽𝗹𝘆 𝗧𝗼 𝗔𝗻 𝗜𝗺𝗮𝗴𝗲 𝗧𝗼 𝗥𝗲𝗺𝗼𝘃𝗲 𝗜𝘁𝘀 𝗕𝗮𝗰𝗸𝗴𝗿𝗼𝘂𝗻𝗱 ❤️‍🩹.");
    }
 
    const imgurl = encodeURIComponent(event.messageReply.attachments[0].url);
    const puti = 'xyz';
    const rbgUrl = `https://smfahim.${puti}/rbg?url=${imgurl}`;
 
    api.setMessageReaction("⏰", event.messageID, () => {}, true);
 
    message.reply("🔄| 𝗥𝗲𝗺𝗼𝘃𝗶𝗻𝗴 𝗕𝗮𝗰𝗸𝗴𝗿𝗼𝘂𝗻𝗱, 𝗣𝗹𝗲𝗮𝘀𝗲 𝗪𝗮𝗶𝘁..", async (err, info) => {
      try {
        const attachment = await global.utils.getStreamFromURL(rbgUrl);
        message.reply({ 
          body: `╰‣ Here is your image with the background removed`, 
          attachment: attachment 
        });
 
        let ui = info.messageID;          
        message.unsend(ui);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      } catch (error) {
        message.reply("╰‣ There was an error removing the background from your image");
        console.error(error);
      }
    });
  }
};
