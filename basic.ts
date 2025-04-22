import type { GroupChat } from "whatsapp-web.js";

const qrcode = require("qrcode-terminal");

import { getClient } from "@/lib/wsp";

const client = await getClient();

// const groupId = "120363195877975691@g.us"; // main
// const groupId = "120363162435047981@g.us"; // internal
//
const groupId = "120363274638084601@g.us"; // grouty

// --- Group Chat Related Types & Functions ---
export type GroupDetail = {
	id: string;
	name: string;
	participantsCount: number;
};
const message =
	"♻✅Estamos lanzando la primera e-commerce digital de materiales reciclables para empresas Perú.\n\n✅ Transparencia total\n✅ Seguridad garantizada\n✅ Buenos precios\n\n Registrate en el siguiente link, recibiras atencion personalizada y escribenos o visista reganvi.pe si tienes alguna duda.\n\n🔗 https://tally.so/r/w7EgJ0";
client.on("ready", async () => {
	console.log("Client is ready!");

	const chat = (await client.getChatById(groupId)) as GroupChat;
	if (!chat.isGroup)
		throw new Error("The provided ID does not belong to a group.");
	if (!chat.participants || chat.participants.length === 0)
		throw new Error("Could not fetch group participants.");

	// Build mention text and array of mention identifiers.
	const mentions = chat.participants.map(
		(participant) => `${participant.id.user}@c.us`,
	);
	const mentionText = chat.participants
		.map((participant) => `@${participant.id.user}`)
		.join(" ");

	const fullMessage = `${message}\n\n${mentionText}`;
	await chat.sendMessage(fullMessage, { mentions });

	// const chats = await client.getChats();
	// console.log(`Found ${chats.length} chats`);
	// const groups = getGroupChats(chats);
	// console.log(`Found ${groups.length} groups`);
	// const groupDetails = groups.map((group: GroupChat) => ({
	// 	id: group.id._serialized,
	// 	name: group.name,
	// 	participantsCount: group.participants?.length || 0,
	// }));
	//
	// console.log("Group Details:", groupDetails);
	// const chat = (await client.getChatById(groupId)) as GroupChat;
	// if (!chat.isGroup)
	// 	throw new Error("The provided ID does not belong to a group.");
	// if (!chat.participants || chat.participants.length === 0)
	// 	throw new Error("Could not fetch group participants.");
	//
	// console.log(
	// 	`Sending message to ${chat.participants.length} participants of "${chat.name}"...`,
	// );
	//
	// const results = {
	// 	errors: [] as Array<{ participant: string; error: string }>,
	// 	failed: 0,
	// 	sent: 0,
	// 	total: chat.participants.length,
	// };
	//
	// // remove first 200 from participants
	// const participants = chat.participants.slice(200);
	//
	// for (const participant of participants) {
	// 	try {
	// 		// Skip sending a DM to the WhatsApp account used by the client.
	// 		if (participant.id.user === client.info.wid.user) {
	// 			console.log("Skipping self...");
	// 			continue;
	// 		}
	// 		// Delay to avoid potential rate limits.
	// 		await new Promise((resolve) => setTimeout(resolve, 1000));
	// 		await client.sendMessage(participant.id._serialized, message);
	// 		console.log(`Message sent to ${participant.id._serialized}`);
	// 		results.sent++;
	// 	} catch (err: unknown) {
	// 		if (err instanceof Error) {
	// 			console.error(
	// 				`Failed to send message to ${participant.id._serialized}: ${err.message}`,
	// 			);
	// 			results.failed++;
	// 			results.errors.push({
	// 				error: err.message,
	// 				participant: participant.id._serialized,
	// 			});
	// 		}
	// 	}
	// }
	//
	// console.log(
	// 	`Completed sending messages. Successful: ${results.sent}, Failed: ${results.failed}`,
	// );
});

client.on("qr", (qr: string) => {
	qrcode.generate(qr, { small: true });
});

client.initialize();
