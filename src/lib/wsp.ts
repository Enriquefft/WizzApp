import mongoose from "mongoose";
import WAWebJS, {
	type Chat,
	Client,
	type Contact,
	type GroupChat,
	LocalAuth,
	RemoteAuth,
} from "whatsapp-web.js";
import { MongoStore } from "wwebjs-mongo";
import { env } from "@/env";

export async function getClient(
	localAuth: boolean = true,
	clientId?: string,
): Promise<Client> {
	if (localAuth) {
		console.log("Creating WhatsApp client...");
		return new Client({
			authStrategy: new LocalAuth(),
			puppeteer: {
				executablePath: env.CHROME_EXECUTABLE_PATH,
				headless: true,
			},
			takeoverOnConflict: true,
		});
	}

	console.log("Connecting to MongoDB...");
	await mongoose.connect(env.MONGODB_URI);
	const store = new MongoStore({ mongoose });

	console.log("Creating WhatsApp client...");
	return new Client({
		authStrategy: new RemoteAuth({
			backupSyncIntervalMs: 300000,
			clientId,
			store,
		}),
		puppeteer: {
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-accelerated-2d-canvas",
				"--disable-gpu",
			],
			executablePath: env.CHROME_EXECUTABLE_PATH,
			headless: true,
			timeout: 60000, // Increase navigation timeout
		},
		// Add these options
		qrMaxRetries: 1,
		takeoverOnConflict: true,
	});
}

const clientTimeout = 120000; // 2 minutes instead of 50 seconds
/**
 * Helper function to handle WhatsApp client lifecycle for operations
 * that require a fully initialized (ready) client.
 */
export async function withWhatsappClient<T>({
	localAuth,
	clientId,
	stayAlive,
	callback,
}: {
	localAuth: boolean;
	clientId?: string;
	stayAlive: boolean;
	callback: (client: Client) => Promise<T>;
}): Promise<T> {
	let client: Client | null = null;
	try {
		client = await getClient(localAuth, clientId);

		await new Promise<void>((resolve, reject) => {
			if (client === null) {
				throw new Error("Failed to create WhatsApp client");
			}

			client.on("disconnected", (reason) => {
				console.log("Client was disconnected", reason);
			});

			client.on("change_state", (state) => {
				console.log("Client state changed to", state);
			});

			client.on("ready", () => {
				console.log("WhatsApp client is ready");
				resolve();
			});

			client.on("authenticated", () => {
				console.log("WhatsApp client authenticated");
			});

			client.on("message_create", (message) => {
				if (message.body === "!ping") {
					client?.sendMessage(message.from, "pong");
				}
			});

			client.once("auth_failure", (msg) => {
				console.error("Authentication failure:", msg);
				reject(new Error(`Authentication failure: ${msg}`));
			});

			client.once("remote_session_saved", () => {
				console.log("Remote session saved event received.");
			});

			client.on("qr", (qr: string) => {
				const qrcode = require("qrcode-terminal");
				qrcode.generate(qr, { small: true });
			});

			console.log("Initializing client...");
			client.initialize();

			setTimeout(() => {
				console.log("Client initialization timed out");
				reject(new Error("Client initialization timed out"));
			}, clientTimeout);
		});

		// Add a small delay after ready to ensure WhatsApp Web is fully loaded
		stayAlive && (await new Promise((resolve) => setTimeout(resolve, 3000)));

		console.log("Client initialized, executing callback...");
		return await callback(client);
	} catch (err) {
		console.error("Error in WhatsApp client operation:", err);
		throw err;
	} finally {
		if (client) {
			await client.destroy();
			console.log("WhatsApp client destroyed");
		}
		if (!localAuth) {
			await mongoose.disconnect();
			console.log("Disconnected from MongoDB");
		}
	}
}

export async function tagAll({
	localAuth,
	clientId,
	groupId,
	stayAlive,
	message,
}: {
	localAuth: boolean;
	clientId?: string;
	groupId: string;
	stayAlive: boolean;
	message: string;
}) {
	return withWhatsappClient({
		callback: async (client) => {
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
		},
		clientId,
		localAuth,
		stayAlive,
	});
}

const getGroupChats = (chats: Chat[]): GroupChat[] =>
	chats.filter((chat) => chat.isGroup) as GroupChat[];
export async function getAllGroups({
	localAuth,
	clientId,
	stayAlive,
}: {
	localAuth: boolean;
	clientId?: string;
	stayAlive: boolean;
}) {
	return withWhatsappClient({
		callback: async (client) => {
			const chats = await client.getChats();
			console.log(`Found ${chats.length} chats`);
			const groups = getGroupChats(chats);
			console.log(`Found ${groups.length} groups`);
			const groupDetails = groups.map((group: GroupChat) => ({
				id: group.id._serialized,
				name: group.name,
				participantsCount: group.participants?.length || 0,
			}));
			console.log("Group Details:", groupDetails);
		},
		clientId,
		localAuth,
		stayAlive,
	});
}

export async function dmEveryone({
	localAuth,
	clientId,
	groupId,
	stayAlive,
	exclude,
	message,
}: {
	localAuth: boolean;
	clientId?: string;
	exclude: string[];
	groupId: string;
	stayAlive: boolean;
	message: string;
}) {
	return withWhatsappClient({
		callback: async (client) => {
			const excludeContactsPromise = exclude.map(async (contact) =>
				client.getNumberId(contact),
			);
			// await all
			const excludeContacts = (
				await Promise.all(excludeContactsPromise)
			).filter(Boolean) as WAWebJS.ContactId[];

			const chat = (await client.getChatById(groupId)) as GroupChat;
			if (!chat.isGroup)
				throw new Error("The provided ID does not belong to a group.");
			if (!chat.participants || chat.participants.length === 0)
				throw new Error("Could not fetch group participants.");

			console.log(
				`Sending message to ${chat.participants.length} participants of "${chat.name}"...`,
			);

			const results = {
				errors: [] as Array<{ participant: string; error: string }>,
				failed: 0,
				sent: 0,
				total: chat.participants.length,
			};

			const participants = chat.participants;
			console.log("Participants: ", participants);

			for (const participant of participants) {
				if (participant.id.user === client.info.wid.user) {
					console.log("Skipping self...");
					continue;
				}
				// exclude
				if (
					excludeContacts.some(
						(contact) => contact._serialized === participant.id._serialized,
					)
				) {
					console.log(
						`Skipping excluded contact: ${participant.id._serialized}`,
					);
					continue;
				}

				try {
					await new Promise((resolve) => setTimeout(resolve, 600));
					await client.sendMessage(participant.id._serialized, message);
					console.log(`Message sent to ${participant.id._serialized}`);
					results.sent++;
				} catch (err: unknown) {
					if (err instanceof Error) {
						console.error(
							`Failed to send message to ${participant.id._serialized}: ${err.message}`,
						);
						results.failed++;
						results.errors.push({
							error: err.message,
							participant: participant.id._serialized,
						});
					}
				}
			}
			console.log(
				`Completed sending messages. Successful: ${results.sent}, Failed: ${results.failed}`,
			);
		},
		clientId,
		localAuth,
		stayAlive,
	});
}

export enum PhoneFormat {
	Peru,
	Intl,
}
export async function sendMessageToList({
	localAuth,
	clientId,
	messages,
	phones,
	stayAlive = false,
}: {
	localAuth: boolean;
	clientId?: string;
	messages: string[];
	phones: string[];
	stayAlive?: false;
}) {
	return withWhatsappClient({
		callback: async (client) => {
			console.log("whoami", client.info.wid.user);

			const results = {
				errors: [] as Array<{ participant: string; error: string }>,
				failed: 0,
				sent: 0,
				total: phones.length,
			};
			for (let phone of phones) {
				const contact = await client.getNumberId(phone);

				if (contact === null) {
					console.error(`Invalid phone number: ${phone}`);
					results.failed++;
					results.errors.push({
						error: "Invalid phone number",
						participant: phone,
					});
					continue;
				}

				try {
					await new Promise((resolve) => setTimeout(resolve, 600));

					const message = messages.join("\n\n");

					await client.sendMessage(contact._serialized, message);
					results.sent++;
				} catch (err: unknown) {
					if (err instanceof Error) {
						console.error(
							`Failed to send message to ${contact}: ${err.message}`,
						);
						results.failed++;
						results.errors.push({
							error: err.message,
							participant: phone,
						});
					}
				}
			}

			console.log(
				`Completed sending messages. Successful: ${results.sent}, Failed: ${results.failed}`,
			);
		},
		clientId,
		localAuth,
		stayAlive,
	});
}
/**
 * Fetches the full Contact objects for every participant in a WhatsApp group.
 *
 * @param params.localAuth – whether to use LocalAuth (true) or RemoteAuth (false)
 * @param params.clientId – optional clientId for RemoteAuth
 * @param params.groupId – the serialized ID of the group chat (e.g. "12345-67890@g.us")
 * @param params.stayAlive – if true, waits 3s after ready to avoid race conditions
 * @returns a Promise resolving to an array of Contact objects
 * @throws if the ID isn’t a group or participants can’t be fetched
 */
export async function getGroupContacts({
	localAuth,
	clientId,
	groupId,
	stayAlive,
}: {
	localAuth: boolean;
	clientId?: string;
	groupId: string;
	stayAlive: boolean;
}): Promise<Contact[]> {
	return withWhatsappClient<Contact[]>({
		callback: async (client: Client) => {
			// 1. Load the chat
			const chat = (await client.getChatById(groupId)) as GroupChat;
			if (!chat.isGroup) {
				throw new Error(`ID ${groupId} is not a group chat.`);
			}
			const parts = chat.participants;
			if (!parts || parts.length === 0) {
				throw new Error(`No participants found for group ${groupId}.`);
			}

			// 2. For each participant, fetch their Contact object
			//    using the serialized ID (e.g. "999888777@c.us")
			const contactPromises = parts.map((p) =>
				client.getContactById(p.id._serialized),
			);

			// 3. Await all, or propagate any fetch error
			const contacts = await Promise.all(contactPromises);

			return contacts;
		},
		clientId,
		localAuth,
		stayAlive,
	});
}
export async function sendMessageToContacts({
	localAuth,
	clientId,
	contacts,
	messages,
	exclude,
	stayAlive = false,
}: {
	localAuth: boolean;
	clientId?: string;
	contacts: Contact[];
	messages: string[];
	exclude: string[];
	stayAlive?: boolean;
}) {
	return withWhatsappClient({
		callback: async (client) => {
			const excludeContactsPromise = exclude.map(async (contact) =>
				client.getNumberId(contact),
			);
			// await all
			const excludeContacts = (
				await Promise.all(excludeContactsPromise)
			).filter(Boolean) as WAWebJS.ContactId[];

			const payload = messages.join("\n\n");
			const results = {
				errors: [] as Array<{ participant: string; error: string }>,
				failed: 0,
				sent: 0,
				total: contacts.length,
			};

			for (const contact of contacts) {
				if (
					excludeContacts.some(
						(excludeContact) =>
							excludeContact._serialized === contact.id._serialized,
					)
				) {
					console.log(`Skipping excluded contact: ${contact.id._serialized}`);
					continue;
				}

				const to = contact.id._serialized;
				try {
					// simple rate-limit
					await new Promise((r) => setTimeout(r, 900));
					await client.sendMessage(to, payload);
					results.sent++;
					console.log(`✔️  Sent to ${to}`);
				} catch (err: unknown) {
					const msg = err instanceof Error ? err.message : String(err);
					results.failed++;
					results.errors.push({ error: msg, participant: to });
					console.error(`❌  Failed on ${to}: ${msg}`);
				}
			}

			console.log(
				`Done: ${results.sent}/${results.total} succeeded, ${results.failed} failed.`,
			);
			return results;
		},
		clientId,
		localAuth,
		stayAlive,
	});
}
