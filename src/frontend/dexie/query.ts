import { UIMessage } from "ai";
import { idb } from "./db"


export const getThreads = async () => {
  return await idb.threads.orderBy('lastMessageAt').reverse().toArray();
}

export const createThread = async (id: string) => {
  return await idb.threads.add({
    id,
    title: 'New Chat',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessageAt: new Date(),
  })
}

export const updateThread = async (id: string, title: string) => {
  return await idb.threads.update(id, {
    title,
    updatedAt: new Date(),
  })
}

export const createMessage = async (threadId: string, message: UIMessage) => {
  return await idb.transaction('rw', [idb.messages, idb.threads], async () => {
    await idb.messages.add({
      id: message.id,
      threadId,
      parts: message.parts,
      role: message.role as 'user' | 'ai',
      content: message.content,
      createdAt: message.createdAt || new Date(),
    });

    await idb.threads.update(threadId, {
      lastMessageAt: message.createdAt || new Date(),
    });
  });
};
