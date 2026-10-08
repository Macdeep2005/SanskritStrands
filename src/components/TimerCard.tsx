import type { CSSProperties } from 'react';
import type { Language, Theme } from '../types/gameTypes';
import { tr } from '../i18n';

type Props = {
  elapsedSeconds: number;
  started: boolean;
  onStart: () => void;
  language: Language;
  theme: Theme;
};

export function speedBonusFor(theme: Theme, elapsedSeconds: number) {
  const minutesPassed = Math.floor(Math.max(0, elapsedSeconds) / 60);
  return Math.max(0, theme.maxSpeedBonus - minutesPassed * theme.speedBonusLossPerMinute);
}

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2,'0')}:${String(safe % 60).padStart(2,'0')}`;
}

export default function TimerCard({ elapsedSeconds, started, onStart, language, theme }: Props) {
  const bonus = speedBonusFor(theme, elapsedSeconds);
  const lost = theme.maxSpeedBonus - bonus;
  const progress = Math.min(1, lost / Math.max(1, theme.maxSpeedBonus));
  return (
    <section className="timer-card count-up">
      <div className="timer-copy">
        <small>{started ? tr(language,'elapsed') : tr(language,'ready')}</small>
        <strong>{formatTime(elapsedSeconds)}</strong>
        <span>{tr(language,'speedBonusNow')}: <b>+{bonus}</b></span>
      </div>
      <div
        className="timer-ring"
        style={{ '--timer-progress': `${(1-progress)*360}deg` } as CSSProperties}
        aria-label={`${bonus} speed bonus points remaining`}
      >
        <span>+{bonus}</span>
      </div>
      {!started && <button className="start-button" onClick={onStart}>{tr(language,'startPuzzle')}</button>}
    </section>
  );
}
