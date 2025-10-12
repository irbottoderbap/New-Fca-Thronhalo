module.exports = {
  config: {
    name: "hi",
    version: "1.1",
    author: "Israfil ThronHalo",
    role: 0,
    description: "Auto reply when someone says hi",
    guide: {
      en: "Just type hi, no prefix needed"
    },
    category: "fun"
  },

  onStart: async function ({ api, event }) {
    // This function is required but won't be used for auto-reply
    api.sendMessage("🤖 Hi command is active! Just type 'hi' in the chat and I'll respond.", event.threadID);
  },

  onChat: async function ({ api, event }) {
    if (!event.body) return;

    const message = event.body.toLowerCase().trim();
    
    // Check if message is "hi" or starts with "hi" followed by space/punctuation
    if (message === "hi" || 
        message === "hi!" || 
        message === "hi." || 
        message.startsWith("hi ") ||
        message === "hello" ||
        message === "hey") {
      
      const replies = [
        "👋 Hello there!",
        "😍 Hi! How are you?",
        "😶 Greetings human!",
        "🌟 Hey there!",
        "💫 Hi! Nice to see you!",
        "🎉 Hello! What's up?",
        "✨ Hey! How's your day going?"
      ];
      
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      return api.sendMessage(randomReply, event.threadID, event.messageID);
    }
  }
};
