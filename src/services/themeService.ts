import type { Cell, RawCell, Theme } from '../types/gameTypes';
import { adjacent, cellKey } from '../utils/board';

function normalizeCell(cell: RawCell): Cell {
  if (Array.isArray(cell)) return { row: Number(cell[0]), col: Number(cell[1]) };
  return { row: Number(cell.row), col: Number(cell.col) };
}

function normalizeTheme(raw:any): Theme {
  const theme:Theme = {
    ...raw,
    targets:(raw.targets ?? []).map((target:any)=>({
      ...target,
      path:(target.path ?? []).map(normalizeCell),
    })),
  };
  validateTheme(theme);
  return theme;
}

function directionCount(path:Cell[]) {
  return new Set(path.slice(1).map((cell,index)=>{
    const previous=path[index];
    return `${Math.sign(cell.row-previous.row)},${Math.sign(cell.col-previous.col)}`;
  })).size;
}

function turnCount(path:Cell[]) {
  const dirs=path.slice(1).map((cell,index)=>{
    const previous=path[index];
    return `${Math.sign(cell.row-previous.row)},${Math.sign(cell.col-previous.col)}`;
  });
  return dirs.slice(1).reduce((count,dir,index)=>count+(dir!==dirs[index]?1:0),0);
}

function validateTheme(theme:Theme) {
  if(!theme.id || !theme.rows || !theme.cols) throw new Error('A theme is missing required metadata.');
  if(theme.grid.length!==theme.rows || theme.grid.some(row=>row.length!==theme.cols)){
    throw new Error(`${theme.titleEnglish}: grid dimensions do not match rows/cols.`);
  }

  const used=new Set<string>();
  const spangrams=theme.targets.filter(target=>target.spangram);
  if(spangrams.length!==1) throw new Error(`${theme.titleEnglish}: exactly one featured/Spangram-style word is required.`);

  for(const target of theme.targets){
    if(!target.word || !target.audioPath) throw new Error(`${theme.titleEnglish}: a target is missing word/audio data.`);
    if(!target.audioPath.startsWith('https://zat.am/bp26/')){
      throw new Error(`${theme.titleEnglish}: ${target.word} must use a full https://zat.am/bp26/ audio URL.`);
    }
    if(target.tokens.length!==target.path.length){
      throw new Error(`${theme.titleEnglish}: ${target.word} tokens/path length mismatch.`);
    }

    const dirs=directionCount(target.path);
    const bends=turnCount(target.path);
    if(theme.pathDifficulty==='starter' && bends>1){
      throw new Error(`${theme.titleEnglish}: ${target.word} is too complex for the starter level.`);
    }
    if(theme.pathDifficulty==='two-direction' && target.path.length>=3 && dirs>2){
      throw new Error(`${theme.titleEnglish}: ${target.word} uses more than two movement directions.`);
    }
    if(theme.pathDifficulty==='multi-bend' && target.path.length>=3 && bends<1){
      throw new Error(`${theme.titleEnglish}: ${target.word} should contain a bend.`);
    }

    target.path.forEach((cell,index)=>{
      if(!Number.isInteger(cell.row)||!Number.isInteger(cell.col)||cell.row<0||cell.col<0||cell.row>=theme.rows||cell.col>=theme.cols){
        throw new Error(`${theme.titleEnglish}: ${target.word} contains an out-of-bounds cell.`);
      }
      if(index>0 && !adjacent(target.path[index-1],cell)){
        throw new Error(`${theme.titleEnglish}: ${target.word} contains non-touching cells.`);
      }
      const actual=theme.grid[cell.row][cell.col];
      if(actual!==target.tokens[index]){
        throw new Error(`${theme.titleEnglish}: ${target.word} token/grid mismatch at ${cellKey(cell)}.`);
      }
      const k=cellKey(cell);
      if(used.has(k)) throw new Error(`${theme.titleEnglish}: target paths overlap at ${k}.`);
      used.add(k);
    });
  }

  // v7 allows distractor cells because the supplied padakoSaH words are short
  // while the requested game board remains 6×6.
}

export async function loadThemes():Promise<{themes:Theme[];source:'json'}>{
  const response=await fetch('./data/themes.json');
  if(!response.ok) throw new Error('Could not load public/data/themes.json');
  const raw=await response.json();
  return { themes:raw.map((theme:any)=>normalizeTheme(theme)), source:'json' };
}
