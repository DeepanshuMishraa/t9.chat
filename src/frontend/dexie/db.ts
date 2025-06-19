import type { UIMessage } from "ai";
import Dexie, { type EntityTable } from "dexie";

interface Thread {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	lastMessageAt: Date;
}

interface Message {
	id: string;
	threadId: string;
	role: "user" | "assistant";
	content: string;
	createdAt: Date;
	parts: UIMessage["parts"];
}

interface MessageSummary {
	id: string;
	threadId: string;
	messageId: string;
	content: string;
	createdAt: Date;
}

export const idb = new Dexie("t9") as Dexie & {
	threads: EntityTable<Thread, "id">;
	messages: EntityTable<Message, "id">;
	messageSummary: EntityTable<MessageSummary, "id">;
};

idb.version(1).stores({
	threads: "id, title, updatedAt, lastMessageAt",
	messages: "id, threadId, createdAt, [threadId+createdAt]",
	messageSummaries: "id, threadId, messageId, createdAt, [threadId+createdAt]",
});

export type { Thread, Message, MessageSummary };
