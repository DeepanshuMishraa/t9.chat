import { convexAdapter } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireEnv } from "@convex-dev/better-auth/utils";
import { betterAuth } from "better-auth";
import { betterAuthComponent } from "@/convex/auth";
import { type GenericCtx } from "../convex/_generated/server";

const siteUrl = requireEnv("SITE_URL");

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    baseURL: siteUrl,
    database: convexAdapter(ctx, betterAuthComponent),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      }
    },
    plugins: [
      convex(),
    ],
  });
