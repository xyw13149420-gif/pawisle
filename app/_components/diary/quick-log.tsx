"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { EntryIcon } from "@/app/_components/icons";
import { addEntryAction } from "@/lib/diary/actions";
import { ENTRY_KINDS, type EntryKind } from "@/lib/diary/content";

export function QuickLog({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState<EntryKind | null>(null);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const activeConfig = ENTRY_KINDS.find((item) => item.kind === active) ?? null;

  function open(kind: EntryKind) {
    setError("");
    if (kind === "photo") {
      if (demo) {
        setError("演示模式不支持上传照片，接上数据库后再试");
        return;
      }
      fileRef.current?.click();
      return;
    }
    setActive((current) => (current === kind ? null : kind));
  }

  function choose(kind: EntryKind, valueText: string) {
    setError("");
    startTransition(async () => {
      const result = await addEntryAction({ kind, valueText });
      if (!result.ok) {
        setError(result.message ?? "没记上，稍后再试");
        return;
      }
      setActive(null);
      router.refresh();
    });
  }

  function saveWeight() {
    const value = Number(weight);
    if (!Number.isFinite(value) || value <= 0 || value > 30) {
      setError("体重填 0.1 到 30 之间");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await addEntryAction({ kind: "weight", valueNum: value });
      if (!result.ok) {
        setError(result.message ?? "没记上，稍后再试");
        return;
      }
      setWeight("");
      setActive(null);
      router.refresh();
    });
  }

  async function upload(file: File) {
    setUploading(true);
    setError("");

    try {
      const body = new FormData();
      body.append("photo", file);
      const response = await fetch("/api/diary/photo", { method: "POST", body });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.message ?? "照片没传上去");
        return;
      }

      router.refresh();
    } catch {
      setError("照片没传上去，检查一下网络");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="quicklog">
      <h2 className="section-title">记一笔</h2>

      <div className="quickgrid">
        {ENTRY_KINDS.map((item) => (
          <button
            key={item.kind}
            type="button"
            className="quickbtn"
            data-active={active === item.kind}
            onClick={() => open(item.kind)}
            disabled={pending || uploading}
          >
            <span className="quickicon" aria-hidden="true">
              <EntryIcon kind={item.kind} size={22} />
            </span>
            <span className="quicklabel">{item.label}</span>
          </button>
        ))}
      </div>

      {activeConfig?.input === "choice" ? (
        <div className="quickpanel">
          <p className="quickpanel-hint">{activeConfig.hint}</p>
          <div className="chips">
            {activeConfig.options?.map((option) => (
              <button
                key={option.value}
                type="button"
                className="chip"
                onClick={() => choose(activeConfig.kind, option.value)}
                disabled={pending}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activeConfig?.input === "number" ? (
        <div className="quickpanel">
          <p className="quickpanel-hint">{activeConfig.hint}</p>
          <div className="weight-row">
            <input
              className="weight-input"
              type="number"
              inputMode="decimal"
              step={0.1}
              min={0.1}
              max={30}
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="3.2"
              aria-label="体重（公斤）"
            />
            <span className="weight-unit">kg</span>
            <button type="button" className="btn-primary weight-save" onClick={saveWeight} disabled={pending}>
              记下
            </button>
          </div>
        </div>
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="visually-hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }}
      />

      {uploading ? <p className="hint">照片上传中…</p> : null}
      {error ? <p className="task-error">{error}</p> : null}
    </section>
  );
}
