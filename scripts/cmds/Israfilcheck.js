module.exports = {
  config: {
    name: "Israfilcheck",
    author: "Israfil ThronHalo",
    category: "fun",
    version: "1.3"
  },

  onStart: async function ({ api, event }) {
    // onStart এ কিছু লাগবে না
  },

  onChat: async function ({ api, event }) {
    try {
      const message = event.body?.toLowerCase();

      // "apon" (english) বা "ইসরাফিল" (bangla) থাকলে
      if (message && (message.includes("israfil") || message.includes("ইসরাফিল"))) {
        api.sendMessage(
          "এই তুই আমার ক্রিয়েটার ইসরাফিল এর নাম নিলি কেন ? তোর কি মরার চুলকানি উঠেছে 😡",
          event.threadID,
          event.messageID
        );
      }
    } catch (e) {
      console.error(e);
    }
  }
};
