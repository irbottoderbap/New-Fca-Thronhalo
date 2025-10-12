const axios = require("axios");

module.exports = {
  config: {
    name: "funnyimg",
    version: "2.0",
    author: "Israfil ThronHalo (revamped)",
    role: 0,
    cooldown: 5,
    category: "fun",
    shortDescription: { en: "Send a random funny image/meme" },
    longDescription: { en: "Fetches a random meme via API or fallback image host." },
    guide: { en: "Just type {pn} to get a random funny image" }
  },

  onStart: async function({ api, event }) {
    // Meme API endpoint
    const memeAPI = "https://meme-api.com/gimme";

    // Fallback static image in case API fails
    const fallback = "https://i.imgur.com/7Y8z3qQ.jpeg";

    try {
      api.sendTypingIndicator(event.threadID);

      // Try fetch from meme API
      let response = await axios.get(memeAPI);

      let memeUrl = fallback;
      let caption = "";

      if (response.data && response.data.url) {
        memeUrl = response.data.url;
        // Use title or post link or fallback caption
        caption = response.data.title || "🤣 Here's your meme!";
      }

      // Fetch image as stream
      const imgStream = await axios.get(memeUrl, { responseType: "stream" });

      await api.sendMessage({
        body: `🎉 ${caption}`,
        attachment: imgStream.data
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error("funnyimg error:", err);

      // As last-ditch, send fallback image with a generic caption
      try {
        const fallbackStream = await axios.get(fallback, { responseType: "stream" });
        await api.sendMessage({
          body: "😅 Couldn't fetch a fresh meme — here's a fallback!",
          attachment: fallbackStream.data
        }, event.threadID, event.messageID);
      } catch (err2) {
        console.error("fallback also failed:", err2);
        // If everything fails, send text
        return api.sendMessage("❌ Meme machine is totally broken right now.", event.threadID, event.messageID);
      }
    }
  }
};
