export type Cell = { row: number; col: number };
export type RawCell = Cell | [number, number];

export type TargetWord = {
  id: string;
  word: string;
  meaning?: string;
  transliteration: string;
  audioPath: string;
  tokens: string[];
  path: Cell[];
  spangram: boolean;
};

export type Theme = {
  id: string;
  titleSanskrit: string;
  titleEnglish: string;
  clue: string;
  clueSanskrit?: string;
  icon: string;
  difficulty: string;
  difficultySanskrit?: string;
  pathDifficulty: 'starter' | 'two-direction' | 'multi-bend';
  rows: number;
  cols: number;
  grid: string[][];
  targets: TargetWord[];
  bonusWords?: string[];
  startingHints: number;
  themeWordPoints: number;
  spangramPoints: number;
  completionPoints: number;
  maxSpeedBonus: number;
  speedBonusLossPerMinute: number;
  hintPenalty: number;
  background: string;
  status?: string;
  order?: number;
};

export type Language = 'en' | 'sa';

export type ScoreBreakdown = {
  wordPoints: number;
  completionPoints: number;
  speedBonus: number;
  hintPenalty: number;
  total: number;
  elapsedSeconds: number;
  hintsUsed: number;
  stars: 1 | 2 | 3;
};
