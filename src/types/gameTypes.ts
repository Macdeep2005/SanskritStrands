export type Cell = {
  row: number;
  col: number;
};

export type TargetWordData = {
  id: string;

  word: string;
  transliteration: string;
  meaning: string;

  audioPath: string;

  tokens: string[];

  featured: boolean;
  bonus: boolean;
};

export type TargetWord =
  TargetWordData & {
    path: Cell[];
  };

export type ThemeData = {
  id: string;
  order?: number;

  titleSanskrit: string;
  titleEnglish: string;

  clue: string;
  clueSanskrit: string;

  icon: string;

  difficulty: string;
  difficultySanskrit: string;

  rows: number;
  cols: number;

  targets: TargetWordData[];

  startingHints: number;

  themeWordPoints: number;
  featuredWordPoints: number;
  bonusWordPoints: number;

  completionPoints: number;

  maxSpeedBonus: number;
  speedBonusLossPerMinute: number;

  hintPenalty: number;

  background: string;
};

export type Theme =
  Omit<ThemeData, 'targets'> & {
    grid: string[][];
    targets: TargetWord[];
  };

export type Language =
  'en' | 'sa';

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