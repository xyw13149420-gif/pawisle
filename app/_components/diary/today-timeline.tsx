"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EntryIcon, TrashIcon } from "@/app/_components/icons";
import { EmptyDiaryArt } from "@/app/_components/illustrations";
import { deleteEntryAction } from "@/lib/diary/actions";
import { describeEntry } from "@/lib/diary/content";
import type { DiaryEntry } from "@/lib/diary/data";

const TIME_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function TodayTimeline({ entries }: { entries: DiaryEntry[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);

  function remove(id: string) {
    setRemoving(id);
    setError("");

    startTransition(async () => {
      const result = await deleteEntryAction(id);
      setRemoving(null);
      if (!result.ok) {
        setError(result.message ?? "没删掉，稍后再试");
        return;
      }
      router.refresh();
    });
  }

  if (entries.length === 0) {
    return (
      <section className="section">
        <h2 className="section-title">今天</h2>
        <div className="empty-state">
          <EmptyDiaryArt className="empty-art" />
          <p className="empty-title">岛上还很安静</p>
          <p className="empty-hint">想起来就点一下上面任意一个，不用写长句。记满三条，今天的天气就会自己长出来。</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <h2 className="section-title">今天 · {entries.length} 条</h2>

      <ul className="timeline">
        {entries.map((entry) => (
          <li className="timeline-row" key={entry.id} data-dim={removing === entry.id}>
            <span className="timeline-icon" aria-hidden="true">
              <EntryIcon kind={entry.kind} size={17} />
            </span>

            <span className="timeline-main">
              <span className="timeline-text">{describeEntry(entry.kind, entry.valueText, entry.valueNum)}</span>
              <span className="timeline-time">{TIME_FORMAT.format(new Date(entry.occurredAt))}</span>
            </span>

            {entry.photoUrl ? (
              // 私有桶签名地址，不能用 next/image 的固定域名白名单
              // eslint-disable-next-line @next/next/no-img-element
              <img className="timeline-photo" src={entry.photoUrl} alt="今天的照片" />
            ) : null}

            <button
              type="button"
              className="timeline-del"
              onClick={() => remove(entry.id)}
              disabled={pending}
              aria-label="删掉这条记录"
            >
              <TrashIcon size={16} />
            </button>
          </li>
        ))}
      </ul>

      {error ? <p className="task-error">{error}</p> : null}
    </section>
  );
}
