module.exports = {
  config: {
    name: "ps",
    aliases: ["profilescreenshot", "profileview"],
    version: "1.2",
    author: "Israfil ThronHalo",
    countDown: 5,
    role: 0,
    shortDescription: "Show profile screenshot with info",
    longDescription: "Displays user ID, name, and full profile screenshot",
    category: "info"
  },

  onStart: async function ({ message, event, usersData }) {
    try {
      const mentionID = Object.keys(event.mentions)[0];
      const userID = mentionID || event.senderID;

      const userData = await usersData.get(userID);
      const name = userData?.name || "Unknown";

      const profileURL = `https://facebook.com/${userID}`;

      const token = "3MRJAY3-PT6M815-J6RGV3W-RF6HFYQ";
      const apiURL = `https://shot.screenshotapi.net/screenshot?token=${token}&url=${encodeURIComponent(profileURL)}&output=image&file_type=png`;

      const infoText = `
┌─── PROFILE SNAPSHOT ───┐

USER ID      : ${userID}
PROFILE NAME : ${name}
URL          : ${profileURL}

└────────────────────────┘
      `;

      // Use stream so Messenger can send it directly
      const imageStream = await global.utils.getStreamFromURL(apiURL);

      return message.reply({
        body: infoText,
        attachment: imageStream
      });

    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to fetch profile screenshot. Please check API key or service.");
    }
  }
};
