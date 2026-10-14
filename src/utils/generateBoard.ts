import type {
  Cell,
  Theme,
  ThemeData,
  TargetWord,
} from '../types/gameTypes';

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function rowSnake(rows: number, cols: number): Cell[] {
  const cells: Cell[] = [];

  for (let row = 0; row < rows; row += 1) {
    if (row % 2 === 0) {
      for (let col = 0; col < cols; col += 1) {
        cells.push({ row, col });
      }
    } else {
      for (let col = cols - 1; col >= 0; col -= 1) {
        cells.push({ row, col });
      }
    }
  }

  return cells;
}

function columnSnake(rows: number, cols: number): Cell[] {
  const cells: Cell[] = [];

  for (let col = 0; col < cols; col += 1) {
    if (col % 2 === 0) {
      for (let row = 0; row < rows; row += 1) {
        cells.push({ row, col });
      }
    } else {
      for (let row = rows - 1; row >= 0; row -= 1) {
        cells.push({ row, col });
      }
    }
  }

  return cells;
}

function flipHorizontal(path: Cell[], cols: number): Cell[] {
  return path.map((cell) => ({
    row: cell.row,
    col: cols - 1 - cell.col,
  }));
}

function flipVertical(path: Cell[], rows: number): Cell[] {
  return path.map((cell) => ({
    row: rows - 1 - cell.row,
    col: cell.col,
  }));
}

function buildRoute(rows: number, cols: number): Cell[] {
  const base =
    Math.random() < 0.5
      ? rowSnake(rows, cols)
      : columnSnake(rows, cols);

  let route = base;

  if (Math.random() < 0.5) {
    route = flipHorizontal(route, cols);
  }

  if (Math.random() < 0.5) {
    route = flipVertical(route, rows);
  }

  if (Math.random() < 0.5) {
    route = [...route].reverse();
  }

  return route;
}
export function generateBoard(
  sourceTheme: ThemeData,
): Theme {
  const totalCells = sourceTheme.rows * sourceTheme.cols;

  const totalTokens = sourceTheme.targets.reduce(
    (sum, target) => sum + target.tokens.length,
    0,
  );

  if (totalTokens !== totalCells) {
    throw new Error(
      `${sourceTheme.titleEnglish}: runtime board generation expects exactly ` +
        `${totalCells} tokens, but this theme has ${totalTokens}.`,
    );
  }

  /*
   * Shuffling targets changes which part of the board each word occupies.
   * The word itself and its Sanskrit tokens are never altered.
   */
  const shuffledTargets = shuffle(sourceTheme.targets);

  const route = buildRoute(
    sourceTheme.rows,
    sourceTheme.cols,
  );

  const grid: string[][] = Array.from(
    { length: sourceTheme.rows },
    () => Array(sourceTheme.cols).fill(''),
  );

  let cursor = 0;

  const generatedTargets: TargetWord[] =
    shuffledTargets.map((target) => {
      const path = route.slice(
        cursor,
        cursor + target.tokens.length,
      );

      if (path.length !== target.tokens.length) {
        throw new Error(
          `${sourceTheme.titleEnglish}: could not generate a complete path for ${target.word}.`,
        );
      }

      path.forEach((cell, index) => {
        grid[cell.row][cell.col] =
          target.tokens[index];
      });

      cursor += target.tokens.length;

      return {
        ...target,
        path,
      };
    });

  return {
    ...sourceTheme,
    grid,
    targets: generatedTargets,
  };
}
