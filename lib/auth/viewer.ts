import { connection } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string;
  demo: boolean;
};

/**
 * 演示模式：不连数据库，用固定的演示身份和内存数据跑通全部界面。
 * 两个开关：
 *   1. PAWISLE_DEMO=1 —— 显式强制开启，即使 .env.local 里配了 Supabase 也生效
 *   2. 自动兜底 —— 没配 Supabase 时自动进入
 * 生产构建（next start / 部署）里恒为 false，演示数据不可能泄漏到线上。
 */
export function isDemoMode(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.PAWISLE_DEMO === "1") return true;
  return !isSupabaseConfigured();
}

export async function getViewer(): Promise<Viewer | null> {
  // 会话随 cookie 变化，必须按请求渲染
  await connection();

  if (isDemoMode()) {
    return { id: "demo-user", email: "demo@pawisle.local", demo: true };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return { id: user.id, email: user.email ?? "", demo: false };
  } catch {
    // 后端不可达 / 超时：按「未登录」处理，让页面正常渲染并引导登录，
    // 而不是整页抛 500。真正的错误会在用户提交表单时以人话提示。
    return null;
  }
}
