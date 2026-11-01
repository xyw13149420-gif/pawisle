"use client";

import { useState } from "react";

export function ShareActions({ text }: { text: string }) {
  const [status, setStatus] = useState("");

  async function share() {
    const payload = { title: "茸屿 · 小岛日记", text, url: window.location.href };

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        setStatus("分享出去了");
        return;
      } catch {
        // 用户自己取消，不提示
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setStatus("不能直接分享，已经复制好了");
    } catch {
      setStatus("这个浏览器不支持分享，截图也行");
    }
  }

  return (
    <div className="share-actions">
      <button type="button" className="btn-primary" onClick={share}>
        分享这张卡
      </button>
      <p className="foot-note">想发朋友圈：长按卡片保存图片，或者直接截图。</p>
      {status ? <p className="foot-note">{status}</p> : null}
    </div>
  );
}
