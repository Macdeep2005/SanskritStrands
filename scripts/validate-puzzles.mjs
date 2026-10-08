import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'public','data','themes.json');
const themes=JSON.parse(fs.readFileSync(file,'utf8'));

const normalize=(cell)=>Array.isArray(cell)?{row:cell[0],col:cell[1]}:cell;
const adjacent=(a,b)=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1;
const key=(c)=>`${c.row}-${c.col}`;
const direction=(a,b)=>`${Math.sign(b.row-a.row)},${Math.sign(b.col-a.col)}`;
const directionCount=(cells)=>new Set(cells.slice(1).map((cell,i)=>direction(cells[i],cell))).size;
const turnCount=(cells)=>{
  const dirs=cells.slice(1).map((cell,i)=>direction(cells[i],cell));
  return dirs.slice(1).reduce((count,dir,i)=>count+(dir!==dirs[i]?1:0),0);
};

if(themes.length<10) throw new Error(`Expected at least 10 levels, found ${themes.length}`);

for(const theme of themes){
  if(theme.grid.length!==theme.rows || theme.grid.some(row=>row.length!==theme.cols)){
    throw new Error(`${theme.id}: wrong grid dimensions`);
  }
  const used=new Set();
  const featured=theme.targets.filter(target=>target.spangram);
  if(featured.length!==1) throw new Error(`${theme.id}: expected exactly one featured/Spangram-style word`);

  for(const target of theme.targets){
    const cells=target.path.map(normalize);
    if(cells.length!==target.tokens.length) throw new Error(`${theme.id}/${target.word}: token/path length mismatch`);
    if(!target.audioPath?.startsWith('https://zat.am/bp26/')) throw new Error(`${theme.id}/${target.word}: invalid audio URL`);

    const rendered=[];
    cells.forEach((cell,index)=>{
      if(index && !adjacent(cells[index-1],cell)) throw new Error(`${theme.id}/${target.word}: non-touching path`);
      const token=theme.grid[cell.row]?.[cell.col];
      if(token!==target.tokens[index]) throw new Error(`${theme.id}/${target.word}: expected ${target.tokens[index]} at ${key(cell)}, found ${token}`);
      if(used.has(key(cell))) throw new Error(`${theme.id}: reused target cell ${key(cell)}`);
      used.add(key(cell));
      rendered.push(token);
    });
    if(rendered.join('')!==target.word) throw new Error(`${theme.id}/${target.word}: tokens do not spell displayed word`);

    const dirs=directionCount(cells);
    const bends=turnCount(cells);
    if(theme.pathDifficulty==='starter' && bends>1) throw new Error(`${theme.id}/${target.word}: starter path has too many bends`);
    if(theme.pathDifficulty==='two-direction' && cells.length>=3 && dirs>2) throw new Error(`${theme.id}/${target.word}: too many directions for Level 2-style path`);
    if(theme.pathDifficulty==='multi-bend' && cells.length>=3 && bends<1) throw new Error(`${theme.id}/${target.word}: harder level path should bend`);
  }

  console.log(`✓ Level ${theme.order}: ${theme.titleEnglish} — ${theme.targets.length} words, ${used.size}/${theme.rows*theme.cols} target cells, audio URLs valid`);
}
