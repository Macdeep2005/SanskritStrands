import type { Language } from '../types/gameTypes';
import { tr } from '../i18n';

type Props = {
  hintsRemaining:number;
  hintsUsed:number;
  hintPenalty:number;
  onHint:()=>void;
  canHint:boolean;
  language:Language;
  onShowAnswer:()=>void;
  canShowAnswer:boolean;
};

export default function HintPanel({
  hintsRemaining,hintsUsed,hintPenalty,onHint,canHint,language,onShowAnswer,canShowAnswer
}:Props) {
  return (
    <section className="hint-panel">
      <div className="hint-bulb">?</div>
      <div>
        <small>{tr(language,'hints')}</small>
        <strong>{hintsRemaining} {tr(language,'remaining')}</strong>
        <p>{tr(language,'hintExplainer')} {hintPenalty} {tr(language,'points')}.</p>
      </div>
      <div className="hint-used">{tr(language,'used')}: {hintsUsed}</div>
      <div className="hint-actions">
        <button className="hint-btn" onClick={onHint} disabled={!canHint}>{tr(language,'useHint')}</button>
        <button className="answer-btn" onClick={onShowAnswer} disabled={!canShowAnswer}>
          {language === 'sa' ? 'उत्तरं दर्शयतु' : 'Show Answer'}
        </button>
      </div>
    </section>
  );
}
