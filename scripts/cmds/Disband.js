const fs = require("fs-extra");

module.exports = {
  config: {
    name: "disband",
    version: "2.2",
    author: "Israfil ThronHalo",
    countDown: 5,
    role: 2,
    description: {
      en: "Rename group to 'Disband', remove everyone, invite bot admin back, promote them to admin, then bot leaves."
    },
    category: "box chat",
    guide: {
      en: "{pn}: Rename group to Disband, remove everyone, add bot admin, promote them, and the bot leaves."
    }
  },

  onStart: async function ({ message, event, api }) {
    const threadID = event.threadID;
    const botID = api.getCurrentUserID();

    // ✅ Replace this with the UID of the human who should become admin (the bot owner)
    const botAdmin = "61582147323218";

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const allMembers = threadInfo.participantIDs || [];
      const adminIDs = (threadInfo.adminIDs || []).map(a => a.id);

      // Bot must be admin to change title, remove members, or promote
      if (!adminIDs.includes(botID)) {
        return message.reply("❌ I need admin permissions to run this command. Please make the bot an admin first.");
      }

      await message.reply("⚠️ Disband procedure started: renaming group, removing everyone, then adding & promoting bot admin...");

      // Step 1: Rename group to "Disband"
      try {
        await api.setTitle("Disband", threadID);
        await message.reply("📛 Group title set to 'Disband'.");
      } catch (err) {
        console.log("❌ setTitle error:", err && err.message);
        await message.reply("⚠️ Couldn't rename the group (maybe permission or API error). Continuing...");
      }

      // Step 2: Kick everyone except the bot (will remove admins too)
      for (const uid of allMembers) {
        if (uid === botID) continue; // keep bot until end
        try {
          await api.removeUserFromGroup(uid, threadID);
          // small delay to reduce chance of rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log(`✅ Removed ${uid}`);
        } catch (err) {
          console.log(`❌ Failed to remove ${uid}:`, err && err.message);
        }
      }

      // Small pause to let Facebook process removals
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Invite / Add the bot admin back to the group
      try {
        await api.addUserToGroup(botAdmin, threadID);
        await message.reply("✉️ Bot admin invited/added to the group.");
      } catch (err) {
        console.log("❌ addUserToGroup error:", err && err.message);
        await message.reply("⚠️ Could not add the bot admin to the group. I'll still try to promote if they are already present.");
      }

      // wait a bit to ensure the user is in the thread participant list
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Refresh thread info to get updated participants
      let updatedInfo;
      try {
        updatedInfo = await api.getThreadInfo(threadID);
      } catch (err) {
        console.log("❌ getThreadInfo after add error:", err && err.message);
        updatedInfo = null;
      }

      const updatedParticipants = (updatedInfo && updatedInfo.participantIDs) || [];

      // Step 4: Promote the bot admin to admin (if present)
      if (updatedParticipants.includes(botAdmin)) {
        try {
          // changeAdminStatus(threadID, userID, isAdmin)
          await api.changeAdminStatus(threadID, botAdmin, true);
          await message.reply("⭐ Bot admin has been promoted to group admin.");
        } catch (err) {
          console.log("❌ changeAdminStatus error:", err && err.message);
          await message.reply("⚠️ Couldn't promote the bot admin (permission or API issue).");
        }
      } else {
        await message.reply("⚠️ Bot admin is not in the group after invite — promotion skipped.");
      }

      // Step 5: Final message and bot leaves
      await message.reply("🚪 Disband process finished (or attempted). Bot will now leave the group.");
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        await api.removeUserFromGroup(botID, threadID);
      } catch (err) {
        console.log("❌ Bot failed to leave:", err && err.message);
      }

    } catch (err) {
      console.error("❌ Error in disband command:", err);
      try {
        await message.reply("⚠️ An unexpected error occurred while trying to disband the group.");
      } catch (e) {
        console.log("❌ Failed to send error message:", e && e.message);
      }
    }
  }
};
