module.exports = {
  config: {
    name: "gcnmch",
    version: "1.0",
    author: "Israfil ThronHalo",
    role: 1, // Only bot admin or higher role
    description: "Change the group name automatically when bot starts",
    category: "system",
    guide: {
      en: "Automatically changes the group name when the bot is added or restarted."
    }
  },

  // 🟢 This runs automatically when the bot starts
  onStart: async function ({ api, event }) {
    try {
      const { threadID, isGroup } = event;

      if (!isGroup) return; // skip if it's not a group

      // New group name you want
      const newGroupName = "🔥 ThronHalo Group 🔥";

      // Change the group name
      await api.setTitle(newGroupName, threadID);

      // Optional: send a confirmation message
      await api.sendMessage(
        `✅ Group name has been changed to:\n『 ${newGroupName} 』`,
        threadID
      );

      console.log(`[GROUP NAME CHANGED] ${threadID} → ${newGroupName}`);
    } catch (err) {
      console.error("[GROUPNAMECHANGE ERROR]", err);
    }
  }
};
