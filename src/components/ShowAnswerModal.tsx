import type { Language } from '../types/gameTypes';

type Props = {
  open: boolean;
  language: Language;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ShowAnswerModal({ open, language, onCancel, onConfirm }: Props) {
  if (!open) return null;
  const sa = language === 'sa';
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="exit-card answer-warning-card">
        <div className="exit-icon">?</div>
        <small>{sa ? 'उत्तरं दर्शयतु?' : 'SHOW ANSWER?'}</small>
        <h2>{sa ? 'अस्य स्तरस्य वर्तमानप्रगतिः नश्यति।' : 'You will lose your progress for this level.'}</h2>
        <p>
          {sa
            ? 'उत्तरं दर्शिते अस्य प्रयासस्य शब्दाः, समयः, अङ्काः च न रक्ष्यन्ते। स्तरं पुनः आरभ्य अङ्कान् प्राप्तुं शक्नोति।'
            : 'Showing the solution turns this run into answer mode. Your current words, timer and score will be cleared and this run will not count as a completion. You can restart the level afterward.'}
        </p>
        <div className="result-actions">
          <button onClick={onCancel}>{sa ? 'न' : 'Cancel'}</button>
          <button className="danger" onClick={onConfirm}>{sa ? 'उत्तरं दर्शयतु' : 'Show Answer'}</button>
        </div>
      </div>
    </div>
  );
}
