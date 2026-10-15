import {
  collection,
  getDocs,
} from 'firebase/firestore';

import { db } from '../firebase/firebase-config';

import type {
  ThemeData,
} from '../types/gameTypes';

function normalizeTheme(
  raw: any,
): ThemeData {
  const theme: ThemeData = {
    id: String(raw.id ?? ''),

    order:
      typeof raw.order === 'number'
        ? raw.order
        : undefined,

    titleSanskrit:
      String(
        raw.titleSanskrit ?? '',
      ),

    titleEnglish:
      String(
        raw.titleEnglish ?? '',
      ),

    clue:
      String(raw.clue ?? ''),

    clueSanskrit:
      String(
        raw.clueSanskrit ?? '',
      ),

    icon:
      String(raw.icon ?? ''),

    difficulty:
      String(
        raw.difficulty ?? '',
      ),

    difficultySanskrit:
      String(
        raw.difficultySanskrit ?? '',
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
              target.audioPath ?? '',
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
                    String(token),
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
        raw.startingHints ?? 0,
      ),

    themeWordPoints:
      Number(
        raw.themeWordPoints ?? 0,
      ),

    featuredWordPoints:
      Number(
        raw.featuredWordPoints ??
          0,
      ),

    bonusWordPoints:
      Number(
        raw.bonusWordPoints ?? 0,
      ),

    completionPoints:
      Number(
        raw.completionPoints ?? 0,
      ),

    maxSpeedBonus:
      Number(
        raw.maxSpeedBonus ?? 0,
      ),

    speedBonusLossPerMinute:
      Number(
        raw.speedBonusLossPerMinute ??
          0,
      ),

    hintPenalty:
      Number(
        raw.hintPenalty ?? 0,
      ),

    background:
      String(
        raw.background ?? '',
      ),
  };

  validateThemeData(theme);

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
    )
  ) {
    throw new Error(
      `${theme.titleEnglish}: invalid board size.`,
    );
  }

  if (
    !Array.isArray(
      theme.targets,
    ) ||
    theme.targets.length === 0
  ) {
    throw new Error(
      `${theme.titleEnglish}: no targets found.`,
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
      `${theme.titleEnglish}: exactly one Featured Word is required.`,
    );
  }

  const totalTokens =
    theme.targets.reduce(
      (total, target) =>
        total +
        target.tokens.length,
      0,
    );

  const boardCells =
    theme.rows *
    theme.cols;

  if (
    totalTokens !==
    boardCells
  ) {
    throw new Error(
      `${theme.titleEnglish}: ${totalTokens} tokens cannot fill ${boardCells} cells.`,
    );
  }
}

export async function loadThemes(): Promise<{
  themes: ThemeData[];
  source: 'firestore';
}> {
  const snapshot =
    await getDocs(
      collection(
        db,
        'strands-themes',
      ),
    );

  if (snapshot.empty) {
    throw new Error(
      'No Sanskrit Strands themes were found in Firestore.',
    );
  }

  const themes =
    snapshot.docs
      .map((document) =>
        normalizeTheme({
          ...document.data(),

          // Use the Firestore document ID
          // if id is ever missing.
          id:
            document.data()
              .id ||
            document.id,
        }),
      )
      .sort(
        (a, b) =>
          (a.order ?? 0) -
          (b.order ?? 0),
      );

  console.log(
    `Loaded ${themes.length} themes from Firestore.`,
  );

  return {
    themes,
    source: 'firestore',
  };
}