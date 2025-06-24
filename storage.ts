import { promises as fs } from "fs";
import path from "path";
import type { Contact } from "whatsapp-web.js";

// adjust path/filename as you like:
const CONTACTS_FILE = path.resolve(process.cwd(), "contacts.json");

export async function saveContacts(contacts: Contact[]): Promise<void> {
	try {
		const json = JSON.stringify(contacts, null, 2);
		await fs.writeFile(CONTACTS_FILE, json, "utf-8");
		console.log(`✅ Contacts saved to ${CONTACTS_FILE}`);
	} catch (err) {
		console.error("❌ Failed to save contacts:", err);
		throw new Error(`saveContacts error: ${(err as Error).message}`);
	}
}

export async function loadContacts(): Promise<Contact[]> {
	try {
		const raw = await fs.readFile(CONTACTS_FILE, "utf-8");
		return JSON.parse(raw) as Contact[];
	} catch (err) {
		// if file doesn't exist yet, return empty array
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			return [];
		}
		console.error("❌ Failed to load contacts:", err);
		throw new Error(`loadContacts error: ${(err as Error).message}`);
	}
}
