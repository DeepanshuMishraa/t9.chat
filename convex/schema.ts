import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  threads: defineTable({
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
  messages: defineTable({
    threadId: v.id("threads"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    tokenCount: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_thread", ["threadId"]),
});
