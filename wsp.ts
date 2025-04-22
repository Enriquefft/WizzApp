import mongoose from "mongoose";
import { type Chat, Client, type GroupChat, RemoteAuth } from "whatsapp-web.js";
import { MongoStore } from "wwebjs-mongo";
import { env } from "@/env";

const clientId = "0h86600zypg";

// Helper to filter group chats from an array of chats.
const getGroupChats = (chats: Chat[]): GroupChat[] =>
	chats.filter((chat) => chat.isGroup) as GroupChat[];

// --- Group Chat Related Types & Functions ---
export type GroupDetail = {
	id: string;
	name: string;
	participantsCount: number;
};

export const listAllGroups = async (): Promise<GroupDetail[]> => {
	console.log("Connecting to MongoDB for listing groups...");
	await mongoose.connect(env.MONGODB_URI);
	const store = new MongoStore({ mongoose });
	console.log("Mongo store created for listing groups");

	const client = new Client({
		authStrategy: new RemoteAuth({
			backupSyncIntervalMs: 300000,
			clientId,
			store,
		}),
		puppeteer: {
			args: ["--no-sandbox"],
			executablePath: env.CHROME_EXECUTABLE_PATH,
			headless: true,
		},
	});

	return new Promise<GroupDetail[]>((resolve, reject) => {
		// Listener when the client is ready to fetch chats.
		client.once("ready", async () => {
			console.log("Client is ready");
			try {
				const chats = await client.getChats();
				const groups = getGroupChats(chats);
				console.log(`Found ${groups.length} groups`);
				const groupDetails = groups.map((group: GroupChat) => ({
					id: group.id._serialized,
					name: group.name,
					participantsCount: group.participants?.length || 0,
				}));
				resolve(groupDetails);
			} catch (err) {
				reject(err);
			} finally {
				client.destroy();
				mongoose
					.disconnect()
					.catch((disconnectErr) =>
						console.error("Error during mongoose disconnect:", disconnectErr),
					);
			}
		});

		// Log authentication status; this listener doesn't affect the returned value.
		client.once("authenticated", () => {
			console.log("Client authenticated");
		});

		// Handle authentication failures by rejecting the promise.
		client.once("auth_failure", (msg: unknown) => {
			console.error("Authentication failure:", msg);
			client.destroy();
			mongoose
				.disconnect()
				.catch((disconnectErr) =>
					console.error("Error during mongoose disconnect:", disconnectErr),
				);
			reject(new Error(`Authentication failure: ${msg}`));
		});

		// Begin client initialization and attach error handling.
		client.initialize().catch((err: Error) => {
			client.destroy();
			mongoose
				.disconnect()
				.catch((disconnectErr) =>
					console.error("Error during mongoose disconnect:", disconnectErr),
				);
			reject(err);
		});
	});
};

console.log("MongoDB connection established for listing groups");
const groupDetails = await listAllGroups();
console.log("Group details:", groupDetails);
