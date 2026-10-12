import type { Cell, RawCell, Theme } from '../types/gameTypes';
import { adjacent, cellKey } from '../utils/board';

function normalizeCell(cell: RawCell): Cell {
  if (Array.isArray(cell)) {
    return {
      row: Number(cell[0]),
      col: Number(cell[1]),
    };
  }

  return {
    row: Number(cell.row),
    col: Number(cell.col),
  };
}

function normalizeTheme(raw: any): Theme {
  const theme: Theme = {
    ...raw,

    targets: (raw.targets ?? []).map((target: any) => ({
      ...target,

      // Current format uses "featured".
      // Fallback keeps compatibility with older v7 data.
      featured:
        typeof target.featured === 'boolean'
          ? target.featured
          : Boolean(target.spangram),

      bonus: Boolean(target.bonus),

      meaning: target.meaning ?? '',

      path: (target.path ?? []).map(normalizeCell),
    })),
  };

  validateTheme(theme);

  return theme;
}

function directionCount(path: Cell[]) {
  return new Set(
    path.slice(1).map((cell, index) => {
      const previous = path[index];

      return `${Math.sign(
        cell.row - previous.row,
      )},${Math.sign(
        cell.col - previous.col,
      )}`;
    }),
  ).size;
}

function turnCount(path: Cell[]) {
  const directions = path
    .slice(1)
    .map((cell, index) => {
      const previous = path[index];

      return `${Math.sign(
        cell.row - previous.row,
      )},${Math.sign(
        cell.col - previous.col,
      )}`;
    });

  return directions
    .slice(1)
    .reduce(
      (count, direction, index) =>
        count +
        (direction !== directions[index]
          ? 1
          : 0),
      0,
    );
}

function validateTheme(theme: Theme) {
  // -----------------------------
  // BASIC THEME VALIDATION
  // -----------------------------

  if (!theme.id) {
    throw new Error(
      'A theme is missing an id.',
    );
  }

  if (!theme.rows || !theme.cols) {
    throw new Error(
      `${theme.titleEnglish ?? theme.id}: rows/cols are missing.`,
    );
  }

  if (!Array.isArray(theme.grid)) {
    throw new Error(
      `${theme.titleEnglish}: grid is missing.`,
    );
  }

  if (
    theme.grid.length !== theme.rows ||
    theme.grid.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== theme.cols,
    )
  ) {
    throw new Error(
      `${theme.titleEnglish}: grid dimensions do not match rows/cols.`,
    );
  }

  if (
    !Array.isArray(theme.targets) ||
    theme.targets.length === 0
  ) {
    throw new Error(
      `${theme.titleEnglish}: no targets were provided.`,
    );
  }

  // -----------------------------
  // REQUIRED / FEATURED WORDS
  // -----------------------------

  const requiredTargets =
    theme.targets.filter(
      (target) => !target.bonus,
    );

  if (
    requiredTargets.length !==
    theme.requiredWordCount
  ) {
    throw new Error(
      `${theme.titleEnglish}: requiredWordCount does not match the number of required targets.`,
    );
  }

  const featuredWords =
    requiredTargets.filter(
      (target) =>
        target.featured === true,
    );

  if (featuredWords.length !== 1) {
    throw new Error(
      `${theme.titleEnglish}: exactly one Featured Word is required.`,
    );
  }

  // -----------------------------
  // TARGET VALIDATION
  // -----------------------------

  const used = new Set<string>();

  for (const target of theme.targets) {
    if (!target.id) {
      throw new Error(
        `${theme.titleEnglish}: a target is missing an id.`,
      );
    }

    if (!target.word) {
      throw new Error(
        `${theme.titleEnglish}: a target is missing its Sanskrit word.`,
      );
    }

    if (!target.audioPath) {
      throw new Error(
        `${theme.titleEnglish}: ${target.word} is missing its audio path.`,
      );
    }

    if (
      !target.audioPath.startsWith(
        'https://zat.am/bp26/',
      )
    ) {
      throw new Error(
        `${theme.titleEnglish}: ${target.word} must use a full https://zat.am/bp26/ audio URL.`,
      );
    }

    if (!Array.isArray(target.tokens)) {
      throw new Error(
        `${theme.titleEnglish}: ${target.word} is missing tokens.`,
      );
    }

    if (!Array.isArray(target.path)) {
      throw new Error(
        `${theme.titleEnglish}: ${target.word} is missing a path.`,
      );
    }

    if (
      target.tokens.length !==
      target.path.length
    ) {
      throw new Error(
        `${theme.titleEnglish}: ${target.word} tokens/path length mismatch.`,
      );
    }

    if (target.path.length === 0) {
      throw new Error(
        `${theme.titleEnglish}: ${target.word} has an empty path.`,
      );
    }

    // -----------------------------
    // DIFFICULTY VALIDATION
    // -----------------------------

    const directions =
      directionCount(target.path);

    const bends =
      turnCount(target.path);

    // Starter can contain a small number
    // of bends, including the current
    // Level 1 layouts.
    if (
      theme.pathDifficulty ===
        'starter' &&
      bends > 2
    ) {
      console.warn(
        `${theme.titleEnglish}: ${target.word} has ${bends} bends in a starter level.`,
      );
    }

    // Level 2 should stay within
    // two movement directions.
    if (
      theme.pathDifficulty ===
        'two-direction' &&
      target.path.length >= 3 &&
      directions > 2
    ) {
      throw new Error(
        `${theme.titleEnglish}: ${target.word} uses more than two movement directions.`,
      );
    }

    // We intentionally do NOT require
    // every multi-bend word to bend.
    // A harder level may still contain
    // some short straight words.

    // -----------------------------
    // PATH / GRID VALIDATION
    // -----------------------------

    target.path.forEach(
      (cell, index) => {
        if (
          !Number.isInteger(cell.row) ||
          !Number.isInteger(cell.col)
        ) {
          throw new Error(
            `${theme.titleEnglish}: ${target.word} contains a non-integer cell.`,
          );
        }

        if (
          cell.row < 0 ||
          cell.col < 0 ||
          cell.row >= theme.rows ||
          cell.col >= theme.cols
        ) {
          throw new Error(
            `${theme.titleEnglish}: ${target.word} contains an out-of-bounds cell.`,
          );
        }

        if (
          index > 0 &&
          !adjacent(
            target.path[index - 1],
            cell,
          )
        ) {
          throw new Error(
            `${theme.titleEnglish}: ${target.word} contains non-touching cells.`,
          );
        }

        const actual =
          theme.grid[cell.row][cell.col];

        const expected =
          target.tokens[index];

        if (actual !== expected) {
          throw new Error(
            `${theme.titleEnglish}: ${target.word} token/grid mismatch at ${cellKey(
              cell,
            )}. Expected "${expected}" but found "${actual}".`,
          );
        }

        const key = cellKey(cell);

        if (used.has(key)) {
          throw new Error(
            `${theme.titleEnglish}: target paths overlap at ${key}.`,
          );
        }

        used.add(key);
      },
    );
  }

  // -----------------------------
  // OPTIONAL COVERAGE CHECK
  // -----------------------------
  //
  // v8 uses required + bonus words
  // to cover the board, but we do not
  // block the app if some future level
  // intentionally contains filler cells.

  const totalCells =
    theme.rows * theme.cols;

  if (used.size !== totalCells) {
    console.warn(
      `${theme.titleEnglish}: ${used.size}/${totalCells} grid cells are used by target paths.`,
    );
  }
}

export async function loadThemes(): Promise<{
  themes: Theme[];
  source: 'json';
}> {
  const response = await fetch(
    './data/themes.json',
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(
      `Could not load public/data/themes.json (${response.status}).`,
    );
  }

  const raw = await response.json();

  if (!Array.isArray(raw)) {
    throw new Error(
      'themes.json must contain an array of themes.',
    );
  }

  const themes = raw
    .map((theme: any) =>
      normalizeTheme(theme),
    )
    .sort(
  (a: Theme, b: Theme) =>
    (a.order ?? 0) - (b.order ?? 0),
);

  return {
    themes,
    source: 'json',
  };
}