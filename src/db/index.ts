import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { chat, thread } from './schema';
import { Provider } from '@/store/apiKeyManager';

export const db = drizzle(process.env.DATABASE_URL!);


export async function createThread(userId: string, provider: Provider, model: string) {
  const threads = await db.insert(thread).values({
    id: crypto.randomUUID(),
    name: "New Thread",
    userId: userId,
    provider,
    model
  })
}

export async function createChat(threadId: string, message: string) {
  const chats = await db.insert(chat).values({
    id: crypto.randomUUID(),
    threadId,
    message
  })
}
