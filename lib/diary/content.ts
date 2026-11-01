/** 小岛日记的静态定义：记录项、选项、天气词库。改文案只动这里。 */

export type EntryKind = "meal" | "water" | "poop" | "vomit" | "weight" | "mood" | "photo";

/** 云量：晴 / 多云 / 雨。决定天气句和卡片色调。 */
export type Tone = "sun" | "cloud" | "rain";

export type ChoiceOption = {
  value: string;
  label: string;
  tone: Tone;
};

export type EntryKindConfig = {
  kind: EntryKind;
  label: string;
  input: "choice" | "number" | "photo";
  options?: ChoiceOption[];
  unit?: string;
  hint: string;
};

export const ENTRY_KINDS: EntryKindConfig[] = [
  {
    kind: "meal",
    label: "吃饭",
    input: "choice",
    hint: "吃完了吗",
    options: [
      { value: "full", label: "吃完了", tone: "sun" },
      { value: "half", label: "吃了一半", tone: "cloud" },
      { value: "none", label: "没吃", tone: "rain" },
    ],
  },
  {
    kind: "water",
    label: "喝水",
    input: "choice",
    hint: "喝得怎么样",
    options: [
      { value: "normal", label: "正常", tone: "sun" },
      { value: "low", label: "偏少", tone: "cloud" },
      { value: "more", label: "喝得多", tone: "cloud" },
    ],
  },
  {
    kind: "poop",
    label: "便便",
    input: "choice",
    hint: "成型吗",
    options: [
      { value: "normal", label: "成型", tone: "sun" },
      { value: "soft", label: "偏软", tone: "cloud" },
      { value: "loose", label: "腹泻", tone: "rain" },
      { value: "none", label: "今天没拉", tone: "rain" },
    ],
  },
  {
    kind: "vomit",
    label: "呕吐",
    input: "choice",
    hint: "吐了吗",
    options: [
      { value: "none", label: "没有", tone: "sun" },
      { value: "once", label: "1 次", tone: "cloud" },
      { value: "more", label: "2 次以上", tone: "rain" },
    ],
  },
  {
    kind: "weight",
    label: "体重",
    input: "number",
    unit: "kg",
    hint: "称一下，记个数",
  },
  {
    kind: "mood",
    label: "心情",
    input: "choice",
    hint: "今天什么状态",
    options: [
      { value: "calm", label: "平静", tone: "sun" },
      { value: "clingy", label: "粘人", tone: "sun" },
      { value: "grumpy", label: "有点烦", tone: "cloud" },
      { value: "hiding", label: "躲起来", tone: "rain" },
    ],
  },
  {
    kind: "photo",
    label: "照片",
    input: "photo",
    hint: "拍一张今天就够了",
  },
];

export const KIND_BY_VALUE: Record<EntryKind, EntryKindConfig> = ENTRY_KINDS.reduce(
  (acc, item) => ({ ...acc, [item.kind]: item }),
  {} as Record<EntryKind, EntryKindConfig>,
);

export function findOption(kind: EntryKind, value: string | null): ChoiceOption | undefined {
  return KIND_BY_VALUE[kind]?.options?.find((option) => option.value === value);
}

/** 天气词：只有这四项参与造句，体重和照片不参与。 */
export const WEATHER_PHRASES: Record<string, Record<Tone, string>> = {
  meal: { sun: "胃口晴朗", cloud: "胃口多云", rain: "胃口下雨" },
  poop: { sun: "便便晴朗", cloud: "便便多云", rain: "便便下雨" },
  water: { sun: "喝水正常", cloud: "喝水偏少", rain: "喝水有点少" },
  mood: { sun: "心情放晴", cloud: "心情多云", rain: "心情有点阴" },
  vomit: { sun: "", cloud: "还吐了一次", rain: "吐了不止一次" },
};

export const WEATHER_ORDER: EntryKind[] = ["meal", "poop", "water", "mood", "vomit"];

export const SUNNY_SENTENCES = [
  "今天整座岛都在放晴。",
  "风很好，它也很好。",
  "今天没什么事，就是很好。",
];

export const RAIN_ADVICE = "今天多看它两眼，明天还是这样就记下来带给医生。";

export const EMPTY_WEATHER = "岛上还没有记录。";

/** 记录项在时间线上的显示文案 */
export function describeEntry(kind: EntryKind, valueText: string | null, valueNum: number | null): string {
  if (kind === "weight") {
    return valueNum === null ? "体重" : `体重 ${valueNum.toFixed(1)} kg`;
  }
  if (kind === "photo") return "留了一张照片";
  const option = findOption(kind, valueText);
  return option ? `${KIND_BY_VALUE[kind].label} · ${option.label}` : KIND_BY_VALUE[kind].label;
}
