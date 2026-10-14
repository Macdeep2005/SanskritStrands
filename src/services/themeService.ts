import type {
  ThemeData,
} from '../types/gameTypes';

function normalizeTheme(
  raw: any,
): ThemeData {
  const theme: ThemeData = {
    id: String(
      raw.id ?? '',
    ),

    order:
      typeof raw.order ===
      'number'
        ? raw.order
        : undefined,

    titleSanskrit:
      String(
        raw.titleSanskrit ??
          '',
      ),

    titleEnglish:
      String(
        raw.titleEnglish ??
          '',
      ),

    clue:
      String(
        raw.clue ?? '',
      ),

    clueSanskrit:
      String(
        raw.clueSanskrit ??
          '',
      ),

    icon:
      String(
        raw.icon ?? '',
      ),

    difficulty:
      String(
        raw.difficulty ?? '',
      ),

    difficultySanskrit:
      String(
        raw.difficultySanskrit ??
          '',
      ),

    rows:
      Number(raw.rows),

    cols:
      Number(raw.cols),

    targets:
      (raw.targets ?? []).map(
        (target: any) => ({
          id:
            String(
              target.id ?? '',
            ),

          word:
            String(
              target.word ?? '',
            ),

          transliteration:
            String(
              target.transliteration ??
                '',
            ),

          meaning:
            String(
              target.meaning ?? '',
            ),

          audioPath:
            String(
              target.audioPath ??
                '',
            ),

          tokens:
            Array.isArray(
              target.tokens,
            )
              ? target.tokens.map(
                  (
                    token:
                      unknown,
                  ) =>
                    String(
                      token,
                    ),
                )
              : [],

          featured:
            Boolean(
              target.featured,
            ),

          bonus:
            Boolean(
              target.bonus,
            ),
        }),
      ),

    startingHints:
      Number(
        raw.startingHints ??
          0,
      ),

    themeWordPoints:
      Number(
        raw.themeWordPoints ??
          0,
      ),

    featuredWordPoints:
      Number(
        raw.featuredWordPoints ??
          0,
      ),

    bonusWordPoints:
      Number(
        raw.bonusWordPoints ??
          0,
      ),

    completionPoints:
      Number(
        raw.completionPoints ??
          0,
      ),

    maxSpeedBonus:
      Number(
        raw.maxSpeedBonus ??
          0,
      ),

    speedBonusLossPerMinute:
      Number(
        raw.speedBonusLossPerMinute ??
          0,
      ),

    hintPenalty:
      Number(
        raw.hintPenalty ??
          0,
      ),

    background:
      String(
        raw.background ?? '',
      ),
  };

  validateThemeData(
    theme,
  );

  return theme;
}

function validateThemeData(
  theme: ThemeData,
) {
  if (!theme.id) {
    throw new Error(
      'A theme is missing an id.',
    );
  }

  if (
    !Number.isInteger(
      theme.rows,
    ) ||
    !Number.isInteger(
      theme.cols,
    ) ||
    theme.rows < 1 ||
    theme.cols < 1
  ) {
    throw new Error(
      `${theme.titleEnglish}: invalid rows/cols.`,
    );
  }

  if (
    !Array.isArray(
      theme.targets,
    ) ||
    theme.targets.length ===
      0
  ) {
    throw new Error(
      `${theme.titleEnglish}: no targets were provided.`,
    );
  }

  const required =
    theme.targets.filter(
      (target) =>
        !target.bonus,
    );

  const featured =
    required.filter(
      (target) =>
        target.featured,
    );

  if (
    featured.length !== 1
  ) {
    throw new Error(
      `${theme.titleEnglish}: exactly one required Featured Word is required.`,
    );
  }

  let tokenCount = 0;

  for (
    const target of
    theme.targets
  ) {
    if (!target.id) {
      throw new Error(
        `${theme.titleEnglish}: target missing id.`,
      );
    }

    if (!target.word) {
      throw new Error(
        `${theme.titleEnglish}: target missing Sanskrit word.`,
      );
    }

    if (
      !Array.isArray(
        target.tokens,
      ) ||
      target.tokens.length ===
        0
    ) {
      throw new Error(
        `${theme.titleEnglish}: ${target.word} is missing tokens.`,
      );
    }

    if (
      target.tokens.join('') !==
      target.word
    ) {
      throw new Error(
        `${theme.titleEnglish}: ${target.word} tokens do not spell the word.`,
      );
    }

    if (
      !target.audioPath.startsWith(
        'https://zat.am/bp26/',
      )
    ) {
      throw new Error(
        `${theme.titleEnglish}: ${target.word} has an invalid audio URL.`,
      );
    }

    tokenCount +=
      target.tokens.length;
  }

  const cells =
    theme.rows *
    theme.cols;

  if (
    tokenCount !== cells
  ) {
    throw new Error(
      `${theme.titleEnglish}: ${tokenCount} tokens cannot fill ${cells} cells.`,
    );
  }
}

export async function loadThemes(): Promise<{
  themes: ThemeData[];
  source: 'json';
}> {
  const response =
    await fetch(
      './data/themes.json',
      {
        cache:
          'no-store',
      },
    );

  if (!response.ok) {
    throw new Error(
      `Could not load themes.json (${response.status}).`,
    );
  }

  const raw =
    await response.json();

  if (
    !Array.isArray(raw)
  ) {
    throw new Error(
      'themes.json must contain an array.',
    );
  }

  const themes =
    raw
      .map(
        (
          theme: any,
        ) =>
          normalizeTheme(
            theme,
          ),
      )
      .sort(
        (
          a,
          b,
        ) =>
          (a.order ??
            0) -
          (b.order ??
            0),
      );

  return {
    themes,
    source: 'json',
  };
}