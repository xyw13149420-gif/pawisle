import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

let cached: SupabaseClient | null = null;

/**
 * 浏览器端 Supabase 客户端（单例）。
 * 当前登录流程全部走 Server Actions，此处仅供后续客户端实时能力使用。
 */
export function createSupabaseBrowserClient(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) return null;

  if (!cached) {
    cached = createBrowserClient(env.url, env.anonKey);
  }

  return cached;
}
