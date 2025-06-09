import { headers } from "next/headers"
import { auth } from "./auth"

export const getSession = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new Error("User not authorised")
    };

    return session;
  } catch (error) {
    return {
      error: "Something went wrong",
      status: 500
    }
  }
}
