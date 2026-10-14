import type {
  Language,
  ThemeData,
} from '../types/gameTypes';

import { tr } from '../i18n';

type Props = {
  themes: ThemeData[];
  active: number;
  completed: Set<string>;
  bestScores: Record<string, number>;
  onSelect: (index: number) => void;
  language: Language;
};

export default function ThemeSidebar({
  themes,
  active,
  completed,
  bestScores,
  onSelect,
  language,
}: Props) {
  return (
    <aside className="theme-sidebar">
      <div className="side-head">
        <small>
          {tr(language, 'puzzleJourney')}
        </small>

        <strong>
          {tr(language, 'chooseTheme')}
        </strong>
      </div>

      <div className="theme-scroll">
        {themes.map((theme, index) => {
          const locked =
            index > 0 &&
            !completed.has(
              themes[index - 1].id,
            );

          const isComplete =
            completed.has(theme.id);

          return (
            <button
              key={theme.id}
              className={`theme-card ${
                index === active
                  ? 'active'
                  : ''
              } ${
                locked
                  ? 'locked'
                  : ''
              }`}
              disabled={locked}
              onClick={() =>
                onSelect(index)
              }
            >
              <div className="theme-number">
                {String(
                  index + 1,
                ).padStart(2, '0')}
              </div>

              <div className="theme-icon">
                {theme.icon}
              </div>

              <div className="theme-card-copy">
                <small>
                  {locked
                    ? tr(
                        language,
                        'locked',
                      )
                    : isComplete
                      ? tr(
                          language,
                          'completedReplay',
                        )
                      : language === 'sa'
                        ? theme.difficultySanskrit ||
                          theme.difficulty
                        : theme.difficulty}
                </small>

                <strong>
                  {theme.titleSanskrit}
                </strong>

                {language === 'en' && (
                  <span>
                    {theme.titleEnglish}
                  </span>
                )}

                {isComplete && (
                  <em>
                    {tr(
                      language,
                      'best',
                    )}{' '}
                    {bestScores[
                      theme.id
                    ] ?? 0}
                  </em>
                )}
              </div>

              <b className="theme-state">
                {isComplete
                  ? '✓'
                  : locked
                    ? '⌕'
                    : '›'}
              </b>
            </button>
          );
        })}
      </div>
    </aside>
  );
}