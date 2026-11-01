/**
 * Supabase 环境变量读取。
 * 只读 process.env，任何情况下都不抛异常：缺配置时返回 null，
 * 由调用方降级为「未配置」提示，保证页面不白屏、构建不需要真实密钥。
 */
export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  // 新项目用 publishable key（sb_publishable_…），老项目用 anon key（eyJ…），两者等价
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const legacyAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const anonKey = publishable || legacyAnon;

  if (!url || !anonKey) return null;
  if (!/^https?:\/\/.+/.test(url)) return null;

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}
