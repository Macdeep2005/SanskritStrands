import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  generateBoard,
} from '../src/utils/generateBoard.ts';

import {
  pathText,
  targetForPath,
} from '../src/utils/board.ts';

const ITERATIONS_PER_THEME =
  Number(
    process.env.BOARD_TEST_ITERATIONS ||
      250,
  );

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

const key = (cell) =>
  `${cell.row}-${cell.col}`;

const adjacent = (a, b) =>
  Math.max(
    Math.abs(a.row - b.row),
    Math.abs(a.col - b.col),
  ) === 1;

function verifyGeneratedBoard(theme) {
  const totalCells =
    theme.rows * theme.cols;

  const used = new Set();

  if (
    theme.grid.length !==
      theme.rows ||
    theme.grid.some(
      (row) =>
        row.length !==
        theme.cols,
    )
  ) {
    throw new Error(
      `${theme.id}: generated grid dimensions are wrong`,
    );
  }

  for (
    const target of
    theme.targets
  ) {
    if (
      target.path.length !==
      target.tokens.length
    ) {
      throw new Error(
        `${theme.id}/${target.word}: generated path length mismatch`,
      );
    }

    const rendered = [];

    target.path.forEach(
      (cell, index) => {
        if (
          cell.row < 0 ||
          cell.col < 0 ||
          cell.row >= theme.rows ||
          cell.col >= theme.cols
        ) {
          throw new Error(
            `${theme.id}/${target.word}: generated cell is out of bounds`,
          );
        }

        if (
          index > 0 &&
          !adjacent(
            target.path[
              index - 1
            ],
            cell,
          )
        ) {
          throw new Error(
            `${theme.id}/${target.word}: generated path is disconnected`,
          );
        }

        const cellKey =
          key(cell);

        if (
          used.has(cellKey)
        ) {
          throw new Error(
            `${theme.id}: generated paths overlap at ${cellKey}`,
          );
        }

        used.add(cellKey);

        const actual =
          theme.grid[
            cell.row
          ]?.[cell.col];

        const expected =
          target.tokens[
            index
          ];

        if (
          actual !== expected
        ) {
          throw new Error(
            `${theme.id}/${target.word}: generated grid/token mismatch at ${cellKey}`,
          );
        }

        rendered.push(
          actual,
        );
      },
    );

    if (
      rendered.join('') !==
      target.word
    ) {
      throw new Error(
        `${theme.id}/${target.word}: generated path does not spell the word`,
      );
    }

    const foundForward =
      targetForPath(
        theme,
        target.path,
      );

    if (
      !foundForward ||
      foundForward.id !==
        target.id
    ) {
      throw new Error(
        `${theme.id}/${target.word}: targetForPath failed on the generated path`,
      );
    }

    const reversedPath = [
      ...target.path,
    ].reverse();

    const foundReverse =
      targetForPath(
        theme,
        reversedPath,
      );

    if (
      !foundReverse ||
      foundReverse.id !==
        target.id
    ) {
      throw new Error(
        `${theme.id}/${target.word}: targetForPath failed on the reversed path`,
      );
    }

    if (
      pathText(
        theme,
        target.path,
      ) !== target.word
    ) {
      throw new Error(
        `${theme.id}/${target.word}: pathText does not match the word`,
      );
    }
  }

  if (
    used.size !==
    totalCells
  ) {
    throw new Error(
      `${theme.id}: generated board covers ${used.size}/${totalCells} cells`,
    );
  }

  if (
    theme.grid
      .flat()
      .some(
        (token) =>
          token === '',
      )
  ) {
    throw new Error(
      `${theme.id}: generated board contains empty cells`,
    );
  }
}

let totalBoards = 0;

for (
  const sourceTheme of
  themes
) {
  const layouts =
    new Set();

  for (
    let i = 0;
    i <
    ITERATIONS_PER_THEME;
    i += 1
  ) {
    const generated =
      generateBoard(
        sourceTheme,
      );

    verifyGeneratedBoard(
      generated,
    );

    layouts.add(
      JSON.stringify(
        generated.grid,
      ),
    );

    totalBoards += 1;
  }

  if (layouts.size < 2) {
    throw new Error(
      `${sourceTheme.id}: randomization produced only one unique grid across ${ITERATIONS_PER_THEME} runs`,
    );
  }

  console.log(
    `✓ Level ${sourceTheme.order}: ${sourceTheme.titleEnglish} — ${ITERATIONS_PER_THEME} generated boards passed (${layouts.size} unique layouts)`,
  );
}

console.log(
  `\n✓ Random-board stress test passed: ${totalBoards} generated boards across ${themes.length} levels.`,
);