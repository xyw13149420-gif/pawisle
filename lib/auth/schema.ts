/** 登录相关的纯函数校验，无副作用，便于单独测试。 */

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

export type Validated<T> = { ok: true; value: T } | { ok: false; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function toRawString(value: FormDataEntryValue | string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateEmail(value: FormDataEntryValue | string | null | undefined): Validated<string> {
  const email = toRawString(value);

  if (!email) return { ok: false, message: "请输入邮箱" };
  if (email.length > 254) return { ok: false, message: "邮箱太长了" };
  if (!EMAIL_PATTERN.test(email)) return { ok: false, message: "邮箱格式好像不对，再检查一下" };

  return { ok: true, value: email.toLowerCase() };
}

export function validatePassword(value: FormDataEntryValue | string | null | undefined): Validated<string> {
  // 密码不 trim：首尾空格也属于密码内容
  const password = typeof value === "string" ? value : "";

  if (!password) return { ok: false, message: "请输入密码" };
  if (password.length < PASSWORD_MIN) return { ok: false, message: `密码至少 ${PASSWORD_MIN} 位` };
  if (password.length > PASSWORD_MAX) return { ok: false, message: `密码最多 ${PASSWORD_MAX} 位` };
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return { ok: false, message: "密码里要有字母和数字" };
  }

  return { ok: true, value: password };
}

export function validatePasswordConfirm(
  password: string,
  confirm: FormDataEntryValue | string | null | undefined,
): Validated<string> {
  const value = typeof confirm === "string" ? confirm : "";

  if (!value) return { ok: false, message: "再输入一次密码" };
  if (value !== password) return { ok: false, message: "两次输入的密码不一致" };

  return { ok: true, value };
}

/**
 * 只允许站内相对路径，挡掉 //evil.com、http:// 之类的开放重定向。
 */
export function sanitizeNextPath(value: FormDataEntryValue | string | null | undefined, fallback = "/"): string {
  const raw = typeof value === "string" ? value.trim() : "";

  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  if (raw.includes("\\")) return fallback;

  return raw;
}
