import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { createClient } from "@supabase/supabase-js";
import { getAppConfig } from "../config/app-config";

const config = getAppConfig();

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

export const requireAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      throw new HTTPException(401, { message: "No authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new HTTPException(401, { message: "Invalid or expired token" });
    }

    c.set("user", user);
    await next();
  };
};
