import {
  EMPTY_WEATHER,
  RAIN_ADVICE,
  SUNNY_SENTENCES,
  WEATHER_ORDER,
  WEATHER_PHRASES,
  findOption,
  type EntryKind,
  type Tone,
} from "./content";

export type WeatherEntry = {
  kind: EntryKind;
  valueText: string | null;
  valueNum: number | null;
  occurredAt: string;
};

export type WeatherPart = {
  kind: EntryKind;
  label: string;
  tone: Tone;
  phrase: string;
  value: string;
};

export type DayWeather = {
  hasData: boolean;
  tone: Tone;
  sentence: string;
  advice: string | null;
  parts: WeatherPart[];
};

/** 同一天多次记录同一种，取最后一次 —— 早上没吃、晚上吃完了，算吃完。 */
function latestByKind(entries: WeatherEntry[]): Map<EntryKind, WeatherEntry> {
  const sorted = [...entries].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const latest = new Map<EntryKind, WeatherEntry>();

  for (const entry of sorted) {
    latest.set(entry.kind, entry);
  }

  return latest;
}

function pickSunnySentence(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }
  return SUNNY_SENTENCES[hash % SUNNY_SENTENCES.length];
}

export function buildDayWeather(entries: WeatherEntry[], seed = ""): DayWeather {
  const latest = latestByKind(entries);
  const parts: WeatherPart[] = [];

  for (const kind of WEATHER_ORDER) {
    const entry = latest.get(kind);
    if (!entry) continue;

    const option = findOption(kind, entry.valueText);
    if (!option) continue;

    const phrase = WEATHER_PHRASES[kind]?.[option.tone] ?? "";
    if (!phrase) continue;

    parts.push({
      kind,
      label: option.label,
      tone: option.tone,
      phrase,
      value: option.value,
    });
  }

  if (parts.length === 0) {
    return { hasData: false, tone: "cloud", sentence: EMPTY_WEATHER, advice: null, parts };
  }

  const anyRain = parts.some((part) => part.tone === "rain");
  const anyCloud = parts.some((part) => part.tone === "cloud");
  const tone: Tone = anyRain ? "rain" : anyCloud ? "cloud" : "sun";

  const sentence =
    tone === "sun"
      ? pickSunnySentence(seed || parts.map((part) => part.value).join("-"))
      : `今天${parts.map((part) => part.phrase).join("，")}。`;

  return {
    hasData: true,
    tone,
    sentence,
    advice: anyRain ? RAIN_ADVICE : null,
    parts,
  };
}
