import { WeatherIcon } from "@/app/_components/icons";
import type { DayWeather } from "@/lib/diary/weather";

export function WeatherCard({ weather }: { weather: DayWeather }) {
  return (
    <section className="weather" data-tone={weather.tone}>
      <div className="weather-sky" aria-hidden="true">
        <span className="weather-orb" />
        <span className="weather-haze" />
      </div>

      <div className="weather-head">
        <span className="weather-badge" aria-hidden="true">
          <WeatherIcon tone={weather.hasData ? weather.tone : "cloud"} size={20} />
        </span>
        <p className="weather-kicker">今日小岛天气</p>
      </div>

      <p className="weather-sentence" key={weather.sentence}>
        {weather.sentence}
      </p>

      {weather.parts.length > 0 ? (
        <div className="weather-chips">
          {weather.parts.map((part) => (
            <span className="weather-chip" data-tone={part.tone} key={part.kind}>
              {part.phrase}
            </span>
          ))}
        </div>
      ) : null}

      {weather.advice ? <p className="weather-advice">{weather.advice}</p> : null}
    </section>
  );
}
