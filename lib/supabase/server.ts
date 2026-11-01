import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/**
 * 服务端 Supabase 客户端（基于 cookie 的会话）。
 * 未配置环境变量时返回 null，不抛异常。
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const env = getSupabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component 渲染期间禁止写 cookie。
          // 会话续期由 Server Action / Route Handler 完成，这里静默跳过。
        }
      },
    },
  });
}
