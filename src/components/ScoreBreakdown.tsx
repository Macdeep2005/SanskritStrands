import type { Language, ScoreBreakdown as Breakdown } from '../types/gameTypes';
import { tr } from '../i18n';

type Props = { breakdown: Breakdown; bestScore: number; language: Language };

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}

export default function ScoreBreakdown({ breakdown, bestScore, language }: Props) {
  return (
    <div className="score-breakdown">
      <div><span>{tr(language,'wordsSpangram')}</span><b>+{breakdown.wordPoints}</b></div>
      <div><span>{tr(language,'completion')}</span><b>+{breakdown.completionPoints}</b></div>
      <div><span>{tr(language,'speedBonus')} ({formatTime(breakdown.elapsedSeconds)})</span><b>+{breakdown.speedBonus}</b></div>
      <div><span>{tr(language,'hintCost')}</span><b className="penalty">-{breakdown.hintPenalty}</b></div>
      <div className="score-total"><span>{tr(language,'runScore')}</span><b>{breakdown.total}</b></div>
      <div><span>{tr(language,'bestTheme')}</span><b>{Math.max(bestScore, breakdown.total)}</b></div>
    </div>
  );
}
