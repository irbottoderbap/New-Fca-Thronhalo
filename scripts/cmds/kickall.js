const fs = require("fs-extra");

module.exports = {
  config: {
    name: "kickall",
    version: "2.0",
    author: "Israfil ThronHalo",
    countDown: 5,
    role: 2,
    description: {
      en: "Kick everyone from group, add bot admin back, rename group to Disband, and bot leaves"
    },
    category: "box chat",
    guide: {
      en: "{pn}: Kick all members and admins, rename group to Disband, and leave"
    }
  },

  onStart: async function ({ message, event, api }) {
    const threadID = event.threadID;
    const botID = api.getCurrentUserID();

    // ✅ Bot admin UID (your ID)
    const botAdmin = "61582147323218";

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const allMembers = threadInfo.participantIDs;
      const adminIDs = threadInfo.adminIDs.map(a => a.id);

      // ✅ Check bot permission
      if (!adminIDs.includes(botID)) {
        return message.reply("❌ Please make the bot an admin before using this command!");
      }

      message.reply("⚠️ Starting group disband process... kicking all members and admins!");

      // ✅ Kick everyone (members + admins)
      for (const uid of allMembers) {
        if (uid === botID) continue; // Keep bot until end
        try {
          await api.removeUserFromGroup(uid, threadID);
          await new Promise(resolve => setTimeout(resolve, 1000)); // delay to avoid rate limit
        } catch (err) {
          console.log(`❌ Failed to remove ${uid}: ${err.message}`);
        }
      }

      // ✅ Change group name to "Disband"
      try {
        await api.setTitle("Disband", threadID);
      } catch (err) {
        console.log("❌ Couldn't change group name:", err.message);
      }

      // ✅ Add bot admin back
      try {
        await api.addUserToGroup(botAdmin, threadID);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        console.log("❌ Couldn't add bot admin:", err.message);
      }

      // ✅ Promote bot admin to group admin
      try {
        await api.changeAdminStatus(threadID, botAdmin, true);
      } catch (err) {
        console.log("❌ Couldn't promote bot admin:", err.message);
      }

      // ✅ Final message before leaving
      await message.reply("✅ Group disband complete! Admin has been added & promoted.\n🚪 Bot leaving the group...");

      // ✅ Leave the group
      await new Promise(resolve => setTimeout(resolve, 3000));
      await api.removeUserFromGroup(botID, threadID);

    } catch (err) {
      console.error("❌ Error in kickall command:", err);
      message.reply("⚠️ Something went wrong while trying to disband the group.");
    }
  }
};
