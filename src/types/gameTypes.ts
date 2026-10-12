export type Cell = { row: number; col: number };
export type RawCell = Cell | [number, number];

export type TargetWord = {
  id: string;

  word: string;
  transliteration: string;
  meaning: string;

  audioPath: string;

  tokens: string[];
  path: Cell[];

  featured: boolean;
  bonus: boolean;
};

export type Theme = {
  id: string;
  order?: number;

  titleSanskrit: string;
  titleEnglish: string;

  clue: string;
  clueSanskrit: string;

  icon: string;

  difficulty: string;
  difficultySanskrit: string;

  pathDifficulty: 'starter' | 'two-direction' | 'multi-bend';

  rows: number;
  cols: number;

  grid: string[][];

  targets: TargetWord[];

  requiredWordCount: number;

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
