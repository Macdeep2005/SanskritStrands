import type { Language, Theme } from '../types/gameTypes';
import { playWordAudio } from '../services/audioService';
import { tr } from '../i18n';

type Props = { theme: Theme; found: Set<string>; revealed: Set<string>; language: Language; showAnswers?: boolean };

export default function WordPanel({ theme, found, revealed, language, showAnswers = false }: Props) {
  const foundCount = theme.targets.filter((target) => found.has(target.id)).length;
  const remaining = theme.targets.length - foundCount;

  return (
    <section className="word-panel">
      <div className="panel-title">
        <div>
          <small>{tr(language,'discoveries')}</small>
          <strong>{foundCount} {tr(language,'found')} • {remaining} {tr(language,'left')}</strong>
        </div>
        <span className="level-word-count">{theme.targets.length} words</span>
      </div>

      <div className="word-slot-list">
        {theme.targets.map((target) => {
          const isFound = found.has(target.id);
          const isVisible = isFound || showAnswers;
          const hinted = revealed.has(target.id);
          return (
            <div
              key={target.id}
              className={`word-slot ${isFound ? 'found' : ''} ${showAnswers && !isFound ? 'answer-revealed' : ''} ${target.spangram ? 'spangram' : ''} ${hinted && !isFound ? 'hinted' : ''}`}
            >
              {isVisible ? (
                <>
                  <button
                    type="button"
                    className="audio-button"
                    onClick={() => playWordAudio(target.audioPath, target.word)}
                    aria-label={`${tr(language,'playPronunciation')}: ${target.word}`}
                    title={tr(language,'playPronunciation')}
                  >
                    🔊
                  </button>
                  <div className="found-word-copy">
                    <strong>{target.word}</strong>
                    {language === 'en' && target.transliteration && <small>{target.transliteration}</small>}
                  </div>
                  <span className="word-check">{isFound ? '✓' : '→'}</span>
                </>
              ) : (
                <>
                  <div className="blank-word" aria-label={tr(language,'hiddenWord')}>
                    {target.tokens.map((_, index) => <span key={index} className="blank-piece" />)}
                  </div>
                  <small className="slot-label">
                    {target.spangram ? tr(language,'findSpangram') : tr(language,'hiddenWord')}
                  </small>
                </>
              )}
            </div>
          );
        })}
      </div>

      <p className="discovery-help">{tr(language,'discoveryHelp')}</p>
      {foundCount > 0 && <p className="audio-help">{tr(language,'audioHelp')}</p>}

      {revealed.size > 0 && (
        <div className="hint-note">
          <span>{tr(language,'hintActive')}</span>
          <p>{tr(language,'hintActiveText')}</p>
        </div>
      )}

      <div className="rule-card">
        <strong>{tr(language,'scoringWorks')}</strong>
        <p>{tr(language,'scoringText')}</p>
      </div>
    </section>
  );
}
