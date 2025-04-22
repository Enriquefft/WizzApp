"use server";
import mongoose from "mongoose";
import { type Chat, type GroupChat } from "whatsapp-web.js";
import { withWhatsappClient } from "@/lib/wsp";
import { getClient } from "@/lib/wsp";

/**
 * Fetches a QR code by initializing a WhatsApp client that emits a QR.
 * The function returns the QR code immediately. It then waits in the background
 * until the "remote_session_saved" event is emitted before performing cleanup.
 * If the client is already authenticated, it rejects immediately.
 */
export const getQr = async (clientId: string): Promise<string> => {
	const client = await getClient(clientId);

	try {
		const onReady = () => {
			console.log("Client is already authenticated; no QR needed");
		};

		const onAuthFailure = (msg: unknown) => {
			console.error("Authentication failure:", msg);
		};

		client.once("ready", onReady);
		client.once("auth_failure", onAuthFailure);
		client.once("authenticated", () => {
			console.log("Client authenticated");
		});

		// Wait for the QR code (or any error condition) from client initialization.
		const qr: string = await new Promise((resolve, reject) => {
			console.log("Initializing client to get QR...");

			const onQr = (qr: string) => {
				console.log("QR Code received");
				client.off("ready", onReady);
				client.off("auth_failure", onAuthFailure);
				resolve(qr);
			};
			client.once("qr", onQr);

			client.initialize().catch(reject);
		});

		// Fire-and-forget: After returning the QR, remain in background until
		// the "remote_session_saved" event is received, then clean up.
		(async () => {
			try {
				console.log("Waiting for remote_session_saved event...");
				await new Promise<void>((resolve) => {
					client.once("remote_session_saved", () => {
						console.log("Remote session saved event received.");
						resolve();
					});
				});
			} catch (error) {
				console.error("Error while waiting for remote_session_saved:", error);
			} finally {
				client.destroy();
				await mongoose.disconnect();
				console.log("Client and MongoDB cleanup completed after session save.");
			}
		})();

		// Return QR code immediately.
		return qr;
	} catch (err) {
		client.destroy();
		await mongoose.disconnect();
		console.error("Error in getQr:", err);
		throw err;
	}
};

// Helper to filter group chats from an array of chats.
const getGroupChats = (chats: Chat[]): GroupChat[] =>
	chats.filter((chat) => chat.isGroup) as GroupChat[];

// --- Group Chat Related Types & Functions ---
export type GroupDetail = {
	id: string;
	name: string;
	participantsCount: number;
};

/**
 * Lists details of all WhatsApp groups for the provided client.
 */
export const listAllGroups = async (clientId: string): Promise<GroupDetail[]> =>
	withWhatsappClient(clientId, async (client) => {
		const chats = await client.getChats();
		const groups = getGroupChats(chats);
		console.log(`Found ${groups.length} groups`);
		const groupDetails = groups.map((group: GroupChat) => ({
			id: group.id._serialized,
			name: group.name,
			participantsCount: group.participants?.length || 0,
		}));
		return groupDetails;
	});

/**
 * Sends a message tagging all group participants.
 */
export const tagEveryone = async (
	clientId: string,
	groupId: string,
	message: string = "Attention everyone:",
): Promise<void> =>
	withWhatsappClient(clientId, async (client) => {
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
	});

/**
 * Sends a direct message to each participant in a group individually.
 */
export const sendDmToGroupMembers = async (
	clientId: string,
	groupId: string,
	message: string,
) => {
	if (!clientId) {
		throw new Error("Client ID is required.");
	}

	return withWhatsappClient(clientId, async (client) => {
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

		for (const participant of chat.participants) {
			try {
				// Skip sending a DM to the WhatsApp account used by the client.
				if (participant.id.user === client.info.wid.user) {
					console.log("Skipping self...");
					continue;
				}
				// Delay to avoid potential rate limits.
				await new Promise((resolve) => setTimeout(resolve, 1000));
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
		return results;
	});
};
