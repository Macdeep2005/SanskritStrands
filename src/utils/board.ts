import type { Cell, Theme } from '../types/gameTypes';

export const cellKey = (c: Cell) => `${c.row}-${c.col}`;

export function adjacent(a: Cell, b: Cell) {
  return Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col)) === 1;
}

export function samePath(a: Cell[], b: Cell[]) {
  if (a.length !== b.length) return false;
  return a.every((c, i) => c.row === b[i].row && c.col === b[i].col);
}

export function reversePath(path: Cell[]) {
  return [...path].reverse();
}

export function pathText(theme: Theme, path: Cell[]) {
  return path.map((c) => theme.grid[c.row]?.[c.col] ?? '').join('');
}

export function targetForPath(theme: Theme, path: Cell[]) {
  // First check the intended stored path.
  const exactTarget = theme.targets.find(
    (target) =>
      samePath(target.path, path) ||
      samePath(target.path, reversePath(path)),
  );

  if (exactTarget) return exactTarget;

  // If repeated letters create the same valid Sanskrit word
  // through another connected route, still accept it.
  const selectedWord = pathText(theme, path);

  return theme.targets.find(
    (target) => target.word === selectedWord,
  );
}

export function selectionIsValid(path: Cell[], next: Cell) {
  if (path.some((c) => cellKey(c) === cellKey(next))) return false;
  const last = path[path.length - 1];
  return !last || adjacent(last, next);
}

export function targetCells(theme: Theme, targetId: string) {
  return new Set(
    theme.targets.find((target) => target.id === targetId)?.path.map(cellKey) ?? [],
  );
}
