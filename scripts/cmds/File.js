 const fs = require('fs-extra');

const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: 'file',
    version: '1.0',
    role: 0,
    coolDown: 5,
    author: 'Israfil ThronHalo',
    category: 'Admin',
    shortDescription: {
      en: 'sending file'
    },
    longDescription: {
      en: 'Sending file form bot scripts',
    },
  },
  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID } = event;
    const prefix = getPrefix(threadID);
    const commandName = this.config.name;
    const command = prefix + commandName;
    if (args.length === 0) {
      return message.reply(`Please provide a file name. Use: ${command} <file_name>`);
    }
    const fileName = args[0];
    const filePath = `${__dirname}/${fileName}`;
    if (!fs.existsSync(filePath)) {
      return message.reply(`File ${fileName} does not exist.`);
    }
    try {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      api.sendMessage(fileData, threadID, messageID);
    } catch (error) {
      console.error(error);
      message.reply(`An error occurred while sending the file.`);
    }
  }
};
