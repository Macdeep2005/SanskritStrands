import type { Language, Theme } from '../types/gameTypes';
import { playWordAudio } from '../services/audioService';
import { tr } from '../i18n';

type Props = {
  theme: Theme;
  found: Set<string>;
  revealed: Set<string>;
  language: Language;
  showAnswers?: boolean;
};

export default function WordPanel({
  theme,
  found,
  revealed,
  language,
  showAnswers = false,
}: Props) {
  const required = theme.targets.filter((target) => !target.bonus);
  const bonus = theme.targets.filter((target) => target.bonus);

  const foundRequired = required.filter((target) =>
    found.has(target.id),
  );

  const foundBonus = bonus.filter((target) =>
    found.has(target.id),
  );

  const remaining = required.length - foundRequired.length;

  return (
    <section className="word-panel">
      <div className="panel-title">
        <div>
          <small>{tr(language, 'discoveries')}</small>

          <strong>
            {showAnswers
              ? tr(language, 'answersShown')
              : `${foundRequired.length} ${tr(
                  language,
                  'found',
                )} • ${remaining} ${tr(language, 'left')}`}
          </strong>
        </div>

        <span className="level-word-count">
          {required.length} {tr(language, 'words')}
        </span>
      </div>

      <div className="word-slot-list">
        {required.map((target) => {
          const isFound = found.has(target.id);
          const isVisible = isFound || showAnswers;

          const hinted =
            revealed.has(target.id) && !showAnswers;

          return (
            <div
              key={target.id}
              className={`word-slot
                ${isFound ? 'found' : ''}
                ${
                  showAnswers && !isFound
                    ? 'answer-revealed'
                    : ''
                }
                ${target.featured ? 'spangram' : ''}
                ${
                  hinted && !isFound
                    ? 'hinted'
                    : ''
                }`}
            >
              {isVisible ? (
                <>
                  <button
                    type="button"
                    className="audio-button"
                    onClick={() =>
                      playWordAudio(
                        target.audioPath,
                        target.word,
                      )
                    }
                    aria-label={`${tr(
                      language,
                      'playPronunciation',
                    )}: ${target.word}`}
                    title={tr(
                      language,
                      'playPronunciation',
                    )}
                  >
                    🔊
                  </button>

                  <div className="found-word-copy">
                    <strong>{target.word}</strong>

                    {language === 'en' && (
                      <>
                        {target.transliteration && (
                          <small>
                            {target.transliteration}
                          </small>
                        )}

                        {target.meaning && (
                          <span className="word-meaning">
                            {target.meaning}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <span className="word-check">
                    {isFound ? '✓' : '→'}
                  </span>
                </>
              ) : (
                <>
                  <div
                    className="blank-word"
                    aria-label={tr(
                      language,
                      'hiddenWord',
                    )}
                  >
                    {target.tokens.map((_, index) => (
                      <span
                        key={index}
                        className="blank-piece"
                      />
                    ))}
                  </div>

                  <small className="slot-label">
                    {target.featured
                      ? tr(language, 'findFeatured')
                      : tr(language, 'hiddenWord')}
                  </small>
                </>
              )}
            </div>
          );
        })}
      </div>

      {(foundBonus.length > 0 || showAnswers) &&
        bonus.length > 0 && (
          <div className="bonus-discoveries">
            <small>{tr(language, 'bonusWords')}</small>

            <div className="bonus-chip-list">
              {(showAnswers
                ? bonus
                : foundBonus
              ).map((target) => (
                <button
                  type="button"
                  key={target.id}
                  className="bonus-chip"
                  onClick={() =>
                    playWordAudio(
                      target.audioPath,
                      target.word,
                    )
                  }
                  title={tr(
                    language,
                    'playPronunciation',
                  )}
                >
                  <span>🔊</span>

                  <strong>{target.word}</strong>

                  {language === 'en' && (
                    <>
                      <em>
                        {target.transliteration}
                      </em>

                      {target.meaning && (
                        <span className="bonus-meaning">
                          {target.meaning}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

      <p className="discovery-help">
        {tr(language, 'discoveryHelp')}
      </p>

      {(foundRequired.length > 0 ||
        foundBonus.length > 0) && (
        <p className="audio-help">
          {tr(language, 'audioHelp')}
        </p>
      )}

      {!showAnswers && revealed.size > 0 && (
        <div className="hint-note">
          <span>
            {tr(language, 'hintActive')}
          </span>

          <p>
            {tr(language, 'hintActiveText')}
          </p>
        </div>
      )}

      <div className="rule-card">
        <strong>
          {tr(language, 'scoringWorks')}
        </strong>

        <p>
          {tr(language, 'scoringText')}
        </p>
      </div>
    </section>
  );
}