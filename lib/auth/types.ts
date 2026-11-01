/** 表单 action 的返回结构。"use server" 文件只能导出异步函数，所以类型放这里。 */

export type AuthField = "email" | "password" | "confirmPassword" | "form";

export type AuthState = {
  status: "idle" | "error" | "notice";
  message: string;
  field?: AuthField;
};

export const initialAuthState: AuthState = {
  status: "idle",
  message: "",
};

export const NOT_CONFIGURED_STATE: AuthState = {
  status: "error",
  field: "form",
  message: "还没接上 Supabase：把 .env.local 里的地址和 anon key 填上再试。",
};
