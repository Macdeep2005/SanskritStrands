import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const file = path.join(
  root,
  'public',
  'data',
  'themes.json',
);

const themes = JSON.parse(
  fs.readFileSync(file, 'utf8'),
);

const normalize = (cell) =>
  Array.isArray(cell)
    ? {
        row: Number(cell[0]),
        col: Number(cell[1]),
      }
    : {
        row: Number(cell.row),
        col: Number(cell.col),
      };

const adjacent = (a, b) =>
  Math.max(
    Math.abs(a.row - b.row),
    Math.abs(a.col - b.col),
  ) === 1;

const key = (cell) =>
  `${cell.row}-${cell.col}`;

if (
  !Array.isArray(themes) ||
  themes.length === 0
) {
  throw new Error(
    'themes.json must contain at least one theme.',
  );
}

for (const theme of themes) {
  if (!theme.id) {
    throw new Error(
      'A theme is missing an id.',
    );
  }

  if (
    !Number.isInteger(theme.rows) ||
    !Number.isInteger(theme.cols) ||
    theme.rows < 1 ||
    theme.cols < 1
  ) {
    throw new Error(
      `${theme.id}: invalid rows/cols`,
    );
  }

  if (
    !Array.isArray(theme.grid) ||
    theme.grid.length !== theme.rows ||
    theme.grid.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== theme.cols,
    )
  ) {
    throw new Error(
      `${theme.id}: wrong grid dimensions`,
    );
  }

  if (
    !Array.isArray(theme.targets) ||
    theme.targets.length === 0
  ) {
    throw new Error(
      `${theme.id}: no targets`,
    );
  }

  const required =
    theme.targets.filter(
      (target) => !target.bonus,
    );

  const featured =
    required.filter(
      (target) =>
        target.featured === true,
    );

  if (
    required.length !==
    theme.requiredWordCount
  ) {
    throw new Error(
      `${theme.id}: requiredWordCount=${theme.requiredWordCount}, but found ${required.length} required targets`,
    );
  }

  if (featured.length !== 1) {
    throw new Error(
      `${theme.id}: expected exactly one required featured word, found ${featured.length}`,
    );
  }

  const used = new Set();

  for (const target of theme.targets) {
    if (!target.id) {
      throw new Error(
        `${theme.id}: target missing id`,
      );
    }

    if (!target.word) {
      throw new Error(
        `${theme.id}/${target.id}: missing Sanskrit word`,
      );
    }

    if (
      !Array.isArray(target.tokens) ||
      target.tokens.length === 0
    ) {
      throw new Error(
        `${theme.id}/${target.word}: missing tokens`,
      );
    }

    if (!Array.isArray(target.path)) {
      throw new Error(
        `${theme.id}/${target.word}: missing path`,
      );
    }

    if (
      target.path.length !==
      target.tokens.length
    ) {
      throw new Error(
        `${theme.id}/${target.word}: token/path length mismatch`,
      );
    }

    if (
      !target.audioPath?.startsWith(
        'https://zat.am/bp26/',
      )
    ) {
      throw new Error(
        `${theme.id}/${target.word}: invalid audio URL`,
      );
    }

    const cells =
      target.path.map(normalize);

    const rendered = [];

    cells.forEach(
      (cell, index) => {
        if (
          !Number.isInteger(cell.row) ||
          !Number.isInteger(cell.col) ||
          cell.row < 0 ||
          cell.col < 0 ||
          cell.row >= theme.rows ||
          cell.col >= theme.cols
        ) {
          throw new Error(
            `${theme.id}/${target.word}: invalid cell ${key(cell)}`,
          );
        }

        if (
          index > 0 &&
          !adjacent(
            cells[index - 1],
            cell,
          )
        ) {
          throw new Error(
            `${theme.id}/${target.word}: path contains non-touching cells`,
          );
        }

        const actual =
          theme.grid[cell.row]?.[
            cell.col
          ];

        const expected =
          target.tokens[index];

        if (actual !== expected) {
          throw new Error(
            `${theme.id}/${target.word}: expected "${expected}" at ${key(cell)}, found "${actual}"`,
          );
        }

        if (used.has(key(cell))) {
          throw new Error(
            `${theme.id}: target paths overlap at ${key(cell)}`,
          );
        }

        used.add(key(cell));
        rendered.push(actual);
      },
    );

    if (
      rendered.join('') !==
      target.word
    ) {
      throw new Error(
        `${theme.id}/${target.word}: tokens do not spell the displayed word`,
      );
    }
  }

  const totalCells =
    theme.rows * theme.cols;

  if (used.size !== totalCells) {
    console.warn(
      `⚠ Level ${theme.order}: ${theme.titleEnglish} uses ${used.size}/${totalCells} cells`,
    );
  }

  console.log(
    `✓ Level ${theme.order}: ${theme.titleEnglish} — ${theme.targets.length} targets, ${required.length} required, ${used.size}/${totalCells} cells`,
  );
}

console.log(
  `\n✓ Puzzle data validation passed for ${themes.length} levels.`,
);