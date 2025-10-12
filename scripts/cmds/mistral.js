const axios = require("axios");

module.exports = {
    config: {
        name: "mistral",
        version: "2.3",
        author: "Israfil ThronHalo",
        role: 0,
        description: {
            en: "Chat with Mistral AI"
        },
        category: "ai",
        guide: {
            en: "{p}{n} <message>\nReply to continue chatting."
        }
    },

    onStart: async function ({ message, event, args }) {
        try {
            const userPrompt = args.join(" ").trim();
            if (!userPrompt) {
                return message.reply("💡 Usage: mistral <your message>");
            }

            message.reaction("✅", event.messageID);

            const responseText = await this.queryMistral([
                { role: "user", content: userPrompt }
            ]);

            const botMessage = await message.reply(responseText);

            global.GoatBot.onReply.set(botMessage.messageID, {
                commandName: this.config.name,
                author: event.senderID,
                conversation: [
                    { role: "user", content: userPrompt },
                    { role: "assistant", content: responseText }
                ]
            });
        } catch (err) {
            console.error(err);
            return message.reply("❌ Error: Could not connect to Mistral API.");
        }
    },

    onReply: async function ({ message, event, Reply }) {
        try {
            if (event.senderID !== Reply.author) return;

            const userPrompt = event.body?.trim();
            if (!userPrompt) return;

            message.reaction("✅", event.messageID);

            const newConversation = [
                ...Reply.conversation,
                { role: "user", content: userPrompt }
            ];

            const responseText = await this.queryMistral(newConversation);

            const botMessage = await message.reply(responseText);

            Reply.conversation = [
                ...newConversation,
                { role: "assistant", content: responseText }
            ];
            global.GoatBot.onReply.set(botMessage.messageID, Reply);

        } catch (err) {
            console.error(err);
            return message.reply("❌ Error while continuing chat.");
        }
    },

    queryMistral: async function (messages) {
        try {
            const res = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "mistralai/mistral-nemo:free",
                    messages
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY || "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"}`
                    }
                }
            );

            return res.data.choices?.[0]?.message?.content || "⚠️ No response from Mistral.";
        } catch (err) {
            console.error("Mistral API error:", err?.response?.data || err.message);
            return "❌ Mistral API error.";
        }
    }
};
