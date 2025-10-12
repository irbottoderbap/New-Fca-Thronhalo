const { getStreamsFromAttachment } = global.utils;

module.exports = {
	config: {
		name: "notification2",
		aliases: ["notify", "noti"],
		version: "3.1",
		author: "NTKhang & GPT VIP",
		countDown: 5,
		role: 2,
		description: {
			en: "Send Ultra VIP notification with single summary message",
			vi: "Gửi thông báo VIP Ultra với một tin nhắn tổng hợp"
		},
		category: "owner",
		guide: { en: "{pn} <message>" },
		envConfig: { delayPerGroup: 200 }
	},

	langs: {
		en: {
			missingMessage: "❌ Please enter the message to send to all groups",
			notificationHeader: "──『 𝑵𝑶𝑻𝑰𝑭𝑰𝑪𝑨𝑻𝑰𝑶𝑵 』──"
		},
		vi: {
			missingMessage: "❌ Vui lòng nhập tin nhắn bạn muốn gửi đến tất cả nhóm",
			notificationHeader: "───『 𝑵𝑶𝑻𝑰𝑭𝑰𝑪𝑨𝑻𝑰𝑶𝑵 』──"
		}
	},

	onStart: async function ({ message, api, event, args, envCommands, threadsData, getLang }) {
		const { delayPerGroup } = envCommands.notification;
		if (!args[0]) return message.reply(getLang("missingMessage"));

		const formSend = {
			body: `${getLang("notificationHeader")}\n──────────────────────────────\n${args.join(" ")}`,
			attachment: await getStreamsFromAttachment(
				[
					...event.attachments,
					...(event.messageReply?.attachments || [])
				].filter(item => ["photo","png","animated_image","video","audio"].includes(item.type))
			)
		};

		const allThreads = (await threadsData.getAll())
			.filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);

		if (allThreads.length === 0) return message.reply("❌ No group found!");

		let sendSuccess = 0;
		const sendError = [];

		for (let i = 0; i < allThreads.length; i++) {
			const thread = allThreads[i];
			try {
				await api.sendMessage(formSend, thread.threadID);
				sendSuccess++;
			} catch (err) {
				sendError.push({ threadID: thread.threadID, name: thread.name });
			}
			await new Promise(r => setTimeout(r, delayPerGroup));
		}

		// Single summary VIP message
		let report = `💎━━━━━━━━━━━━━━💎\n`;
		report += `✅ Successfully sent notification to ${sendSuccess} group(s)\n`;
		if (sendError.length > 0) {
			report += `⚠️ Failed to send to ${sendError.length} group(s)\n`;
			report += sendError.map(e => `🔹 ${e.name}`).join("\n") + "\n";
		}
		report += `💎━━━━━━━━━━━━━━💎`;

		message.reply(report);
	}
};
