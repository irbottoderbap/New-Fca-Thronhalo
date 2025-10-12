const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "grok",
        version: "1.0.0",
        author: "Israfil ThronHalo",
        role: 0,
        description: {
            en: "Chat with Grok AI"
        },
        category: "ai",
        guide: {
            en: "{p}{n} <message> or reply with image + prompt"
        }
    },

    onStart: async function ({ message, event, args }) {
        try {
            const userPrompt = args.join(" ").trim();
            if (!userPrompt) {
                return message.reply("💡 Usage:\n- Chat: `grok hello`\n- Reply to image + text: `grok a character description`");
            }

            message.reaction("✅", event.messageID);

            const grokResponse = await this.queryGrok([
                {
                    role: "user",
                    content: [
                        { type: "text", text: userPrompt }
                    ]
                }
            ]);

            const botMessage = await message.reply(grokResponse);

            global.GoatBot.onReply.set(botMessage.messageID, {
                commandName: this.config.name,
                author: event.senderID,
                conversation: [
                    { role: "user", content: userPrompt },
                    { role: "assistant", content: grokResponse }
                ]
            });
        } catch (err) {
            console.error(err);
            return message.reply("❌ Error: Could not connect to Grok API.");
        }
    },

    onReply: async function ({ message, event, Reply }) {
        try {
            if (event.senderID !== Reply.author) return;

            let grokResponse;
            let newMessageContent = [];

            if (event.messageReply && event.messageReply.attachments?.length > 0) {
                const attachment = event.messageReply.attachments[0];
                if (attachment.type === "photo") {
                    const imageUrl = attachment.url;

                    if (event.body && event.body.trim() !== "") {
                        const userPrompt = event.body.trim();

                        newMessageContent = [
                            { type: "text", text: `Analyze this image and return only a MidJourney-style prompt. Do not explain. User prompt: ${userPrompt}` },
                            { type: "image_url", image_url: { url: imageUrl } }
                        ];
                    } else {
                        newMessageContent = [
                            { type: "text", text: "What is in this image?" },
                            { type: "image_url", image_url: { url: imageUrl } }
                        ];
                    }
                }
            } else {
                newMessageContent = [
                    { type: "text", text: event.body }
                ];
            }

            message.reaction("✅", event.messageID);

            grokResponse = await this.queryGrok([
                ...Reply.conversation,
                { role: "user", content: newMessageContent }
            ]);

            const botMessage = await message.reply(grokResponse);

            Reply.conversation.push({ role: "user", content: newMessageContent });
            Reply.conversation.push({ role: "assistant", content: grokResponse });

            global.GoatBot.onReply.set(botMessage.messageID, Reply);

        } catch (err) {
            console.error(err);
            return message.reply("❌ Error while handling reply.");
        }
    },

    queryGrok: async function (messages) {
        try {
            const response = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "x-ai/grok-4-fast:free",
                    messages
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.OPENROUTER_KEY || "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"}`
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (err) {
            console.error("Grok API error:", err?.response?.data || err.message);
            return "❌ Grok API error.";
        }
    }
};
