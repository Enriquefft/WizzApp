import mongoose from "mongoose";
import { Client, LocalAuth, RemoteAuth } from "whatsapp-web.js";
import { MongoStore } from "wwebjs-mongo";
import { env } from "@/env";

export async function getClient(
	clientId?: string,
	localAuth?: boolean,
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

/**
 * Helper function to handle WhatsApp client lifecycle for operations
 * that require a fully initialized (ready) client.
 */
export async function withWhatsappClient<T>(
	clientId: string,
	callback: (client: Client) => Promise<T>,
): Promise<T> {
	let client: Client | null = null;
	try {
		client = await getClient(clientId);

		// Add timeout options
		const timeout = 120000; // 2 minutes instead of 50 seconds

		await new Promise<void>((resolve, reject) => {
			if (client === null) {
				throw new Error("Failed to create WhatsApp client");
			}

			// Add more event listeners for debugging
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

			client.once("auth_failure", (msg) => {
				console.error("Authentication failure:", msg);
				reject(new Error(`Authentication failure: ${msg}`));
			});

			console.log("Initializing client...");
			client.initialize();

			setTimeout(() => {
				console.log("Client initialization timed out");
				reject(new Error("Client initialization timed out"));
			}, timeout);
		});

		// Add a small delay after ready to ensure WhatsApp Web is fully loaded
		await new Promise((resolve) => setTimeout(resolve, 3000));

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
		await mongoose.disconnect();
		console.log("Disconnected from MongoDB");
	}
}
