import Link from "next/link";
import { JOURNEY_DAYS } from "@/lib/journey/content";
import { dayProgress, type DayState } from "@/lib/journey/progress";

type JourneyMapProps = {
  states: Map<number, DayState>;
  done: Set<string>;
};

export function JourneyMap({ states, done }: JourneyMapProps) {
  return (
    <ol className="map">
      {JOURNEY_DAYS.map((day) => {
        const state = states.get(day.day) ?? "locked";
        const { completed, total } = dayProgress(day, done);
        const locked = state === "locked";

        const inner = (
          <>
            <span className="map-node" data-state={state} aria-hidden="true">
              {state === "done" ? "✓" : day.day}
            </span>
            <span className="map-body">
              <span className="map-title">{day.title}</span>
              <span className="map-note">
                第 {day.day} 天 · {completed}/{total}
                {state === "current" ? " · 今天" : null}
                {locked ? " · 未解锁" : null}
              </span>
            </span>
          </>
        );

        return (
          <li className="map-row" data-state={state} key={day.day}>
            {locked ? (
              <div className="map-link" aria-disabled="true">
                {inner}
              </div>
            ) : (
              <Link className="map-link" href={`/journey/day/${day.day}`}>
                {inner}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
