import { createAuth } from "@/lib/auth";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { betterAuthComponent } from "./auth";

export const CreateThread = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = createAuth(ctx);

    const header = await betterAuthComponent.getHeaders(ctx);
    const session = await auth.api.getSession({
      headers: header,
    });

    if (!session) {
      throw new ConvexError("Unauthorized")
    }

    const user = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("email"), session.user.email))
      .first();

    if (!user) {
      throw new ConvexError("User not found")
    }

    const newThread = await ctx.db.insert("threads", {
      title: args.title,
      userId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return newThread;
  }
})

export const getThreads = query({
  args: {},
  handler: async (ctx, args) => {
    const auth = createAuth(ctx);

    const header = await betterAuthComponent.getHeaders(ctx);
    const session = await auth.api.getSession({
      headers: header,
    });

    if (!session) {
      throw new ConvexError("Unauthorized")
    }

    const user = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("email"), session.user.email))
      .first();

    if (!user) {
      throw new ConvexError("User not found")
    }

    const threads = await ctx.db.query("threads")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    return threads;
  }
})

export const getThread = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const auth = createAuth(ctx);

    const header = await betterAuthComponent.getHeaders(ctx);
    const session = await auth.api.getSession({
      headers: header,
    });

    if (!session) {
      throw new ConvexError("Unauthorized")
    }

    const thread = await ctx.db.get(args.threadId);

    if (!thread) {
      throw new ConvexError("Thread not found")
    }

    const user = await ctx.db.get(thread.userId);

    if (!user) {
      throw new ConvexError("User not found")
    }

    if (user._id !== session.user.id) {
      throw new ConvexError("Unauthorized")
    }

    return thread;
  }
})

export const getMessages = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const auth = createAuth(ctx);

    const header = await betterAuthComponent.getHeaders(ctx);
    const session = await auth.api.getSession({
      headers: header,
    });

    if (!session) {
      throw new ConvexError("Unauthorized")
    }

    const thread = await ctx.db.get(args.threadId);

    if (!thread) {
      throw new ConvexError("Thread not found")
    }

    const user = await ctx.db.get(thread.userId);

    if (!user) {
      throw new ConvexError("User not found")
    }

    if (user._id !== session.user.id) {
      throw new ConvexError("Unauthorized")
    }

    const messages = await ctx.db.query("messages")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .collect();

    return messages;
  }
})


export const  createMessages = mutation({
  args:{
    threadId: v.id("threads"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = createAuth(ctx);

    const header = await betterAuthComponent.getHeaders(ctx);
    const session = await auth.api.getSession({
      headers: header,
    });

    if (!session) {
      throw new ConvexError("Unauthorized")
    }

    const thread = await ctx.db.get(args.threadId);

    if (!thread) {
      throw new ConvexError("Thread not found")
    }

    const user = await ctx.db.get(thread.userId);
    
    if (!user) {
      throw new ConvexError("User not found")
    }

    if (user._id !== session.user.id) {
      throw new ConvexError("Unauthorized")
    }
    
    const newMessage = await ctx.db.insert("messages", {
      threadId: args.threadId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });

    return newMessage;
  }
})

