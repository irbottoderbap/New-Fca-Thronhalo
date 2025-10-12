module.exports = {
  config: {
    name: "info",
    aliases: ["about", "me"],
    version: "2.1",
    author: "Israfil ThronHalo",
    countDown: 5,
    role: 0,
    shortDescription: "Display a high-tier royal profile",
    longDescription: "Returns a cyber-themed, dark royal profile card",
    category: "info"
  },

  onStart: async function ({ message, utils }) {
    const profile = `
██████████████████████─── CYBER ROYAL PROTOCOL: ACTIVE ───
██████████████████████

IDENTITY     : Israfil ThronHalo
GENESIS CODE : 01•01•200*
LOCATION     : Dhaka Sector, BD

NODE :: Facebook   → Israfil ThronHalo
NODE :: Instagram → @israfil_thronhalo
NODE :: Uplink     → Israfilthronhalo@gmail.com

██████████████████████ "Only shadows walk with kings in silence." 
██████████████████████
    `;

    return message.reply({
      body: profile,
      attachment: await global.utils.getStreamFromURL("https://files.catbox.moe/nhcqq0.gif")
    });
  }
};
