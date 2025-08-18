import type { UIMessage } from "ai";
import { idb } from "./db";

export const getThreads = async () => {
	return await idb.threads.orderBy("lastMessageAt").reverse().toArray();
};

export const createThread = async (title: string) => {
	const id = crypto.randomUUID();
	await idb.threads.add({
		id,
		title: title.slice(0, 50) || "New Chat",
		createdAt: new Date(),
		updatedAt: new Date(),
		lastMessageAt: new Date(),
	});
	return { id };
};

export const updateThread = async (id: string, title: string) => {
	return await idb.threads.update(id, {
		title,
		updatedAt: new Date(),
	});
};

export const createMessage = async (threadId: string, message: any) => {
	return await idb.transaction("rw", [idb.messages, idb.threads], async () => {
		await idb.messages.add({
			id: message.id,
			threadId,
			parts: message.parts || [],
			role: message.role as "user" | "assistant",
			content: message.content,
			createdAt: message.createdAt || new Date(),
		});

		await idb.threads.update(threadId, {
			lastMessageAt: message.createdAt || new Date(),
		});
	});
};

export const getMessages = async (threadId: string) => {
	return await idb.messages
		.where("threadId")
		.equals(threadId)
		.sortBy("createdAt");
};

export const updateMessage = async (
	messageId: string,
	updates: any,
) => {
	return await idb.messages.update(messageId, {
		content: updates.content,
		parts: updates.parts,
		createdAt: updates.createdAt || new Date(),
	});
};
