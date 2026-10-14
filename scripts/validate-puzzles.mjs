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

  if (featured.length !== 1) {
    throw new Error(
      `${theme.id}: expected exactly one required featured word`,
    );
  }

  let totalTokens = 0;

  const ids = new Set();

  for (const target of theme.targets) {
    if (!target.id) {
      throw new Error(
        `${theme.id}: target missing id`,
      );
    }

    if (ids.has(target.id)) {
      throw new Error(
        `${theme.id}: duplicate target id "${target.id}"`,
      );
    }

    ids.add(target.id);

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

    if (
      target.tokens.join('') !==
      target.word
    ) {
      throw new Error(
        `${theme.id}/${target.word}: tokens do not spell the displayed word`,
      );
    }

    if (
      typeof target.featured !==
      'boolean'
    ) {
      throw new Error(
        `${theme.id}/${target.word}: featured must be boolean`,
      );
    }

    if (
      typeof target.bonus !==
      'boolean'
    ) {
      throw new Error(
        `${theme.id}/${target.word}: bonus must be boolean`,
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

    totalTokens +=
      target.tokens.length;
  }

  const totalCells =
    theme.rows * theme.cols;

  if (
    totalTokens !== totalCells
  ) {
    throw new Error(
      `${theme.id}: ${totalTokens} tokens for ${totalCells} cells`,
    );
  }

  console.log(
    `✓ Level ${theme.order}: ${theme.titleEnglish} — ${theme.targets.length} targets, ${required.length} required, ${totalTokens}/${totalCells} tokens`,
  );
}

console.log(
  `\n✓ Source theme validation passed for ${themes.length} levels.`,
);