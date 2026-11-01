import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

/**
 * 照片走 Route Handler 而不是 Server Action：
 * Server Action 默认 1MB 请求体上限，5MB 照片会被截断拒绝。
 */
export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return fail("请先登录", 401);
  if (viewer.demo) return fail("演示模式不支持上传照片", 400);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("上传内容读不出来", 400);
  }

  const file = form.get("photo");
  if (!(file instanceof File)) return fail("没有选中照片", 400);
  if (file.size === 0) return fail("照片是空的", 400);
  if (file.size > MAX_BYTES) return fail("照片太大了，5MB 以内", 413);
  if (!ALLOWED.has(file.type)) return fail("只支持 jpg / png / webp / heic", 415);

  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("还没接上 Supabase", 503);

  const path = `${viewer.id}/${crypto.randomUUID()}.${EXT[file.type] ?? "jpg"}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("diary-photos")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (uploadError) return fail("照片没传上去，稍后再试", 502);

  const { error: insertError } = await supabase.from("diary_events").insert({
    user_id: viewer.id,
    kind: "photo",
    photo_path: path,
  });

  if (insertError) {
    // 回滚，别留孤儿文件
    await supabase.storage.from("diary-photos").remove([path]);
    return fail("记上了图但没记上日记，稍后再试", 500);
  }

  revalidatePath("/diary", "layout");
  return NextResponse.json({ ok: true });
}
