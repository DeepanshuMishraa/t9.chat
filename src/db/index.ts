import { Message } from "@/types";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { messages } from "./schema";

export const db = drizzle(process.env.DATABASE_URL!);
