/**
 * 登录尝试限流（固定窗口，IP + 账号双维度）。
 *
 * 为什么不只在 Supabase 侧防：Supabase 自带的是按项目的邮件/令牌速率，
 * 密码撞库走的是 signInWithPassword，几乎不设防。这里挡第一层。
 *
 * ⚠️ 已知边界：状态存在进程内存里，只对「单实例」有效。
 *   - next dev / 单机 pm2 / 单个容器：够用
 *   - 多实例 / Serverless 横向扩容：每个实例各算各的，等于放宽了 N 倍
 *   到那时把 Map 换成 Redis（INCR + EXPIRE）即可，函数签名不用动。
 *   - 进程重启会清零：这是限流，不是审计日志，无需持久化。
 */

const WINDOW_MS = 5 * 60 * 1000; // 窗口 5 分钟
const IP_LIMIT = 10; // 同一 IP 一个窗口内最多 10 次
const ACCOUNT_LIMIT = 5; // 同一「IP + 邮箱」最多 5 次
const MAX_KEYS = 20_000; // 兜底，防止伪造 x-forwarded-for 把内存打爆
const PRUNE_INTERVAL_MS = 60 * 1000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastPruneAt = 0;

export type RateLimitVerdict = { allowed: true } | { allowed: false; retryAfterSeconds: number };

function prune(now: number): void {
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
  lastPruneAt = now;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  // 清完还是过大，说明有大量来源在刷，直接重置——宁可少限一次，也不 OOM
  if (buckets.size > MAX_KEYS) buckets.clear();
}

/** 命中则计数 +1；已到上限则返回拒绝与剩余秒数。 */
function take(key: string, limit: number, now: number): RateLimitVerdict {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  bucket.count += 1;
  return { allowed: true };
}

/**
 * 记录并判断一次登录尝试。
 *
 * @param input.ip 客户端 IP；拿不到时传 "unknown"（此时所有匿名请求共用一个桶）
 * @param input.email 已小写化的邮箱，避免大小写绕过
 * @returns allowed=false 时带上 retryAfterSeconds
 */
export function checkLoginRateLimit(input: { ip: string; email: string }, now = Date.now()): RateLimitVerdict {
  prune(now);

  // 先按 IP 判，再按账号判：两层都过才放行
  const byIp = take(`ip:${input.ip}`, IP_LIMIT, now);
  if (!byIp.allowed) return byIp;

  return take(`acct:${input.ip}:${input.email}`, ACCOUNT_LIMIT, now);
}

/** 登录成功后清掉该「IP + 邮箱」的计数，正常用户不该被自己刚才的输错拖累。 */
export function resetLoginRateLimit(input: { ip: string; email: string }): void {
  buckets.delete(`acct:${input.ip}:${input.email}`);
}

/** 仅测试用：清空全部计数。 */
export function __resetAllLoginRateLimits(): void {
  buckets.clear();
  lastPruneAt = 0;
}
