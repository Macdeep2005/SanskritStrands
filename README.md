# Sanskrit Strands

A Sanskrit connected-word puzzle for the Zat.am game portal. The interaction follows the familiar Strands-style mechanic—trace touching cells, find every theme word, and discover one spangram—but the UI, scoring, content, branding and implementation are original for Zat.am.

## Current MVP

- Two approved-development themes in `public/data/themes.json`: School and Food.
- Three later/draft themes remain separate in `public/data/future-themes.json` and are not loaded by the game.
- 6×8 board with mouse, pen and touch pointer tracing.
- A visible connecting path while dragging.
- Every theme word path is validated against the board at load time so bad JSON cannot silently create impossible answers.
- Exactly one spangram per theme; every board cell belongs to exactly one theme answer.
- Countdown timer with a speed bonus. Reaching 00:00 does **not** fail the level; the player can finish in overtime and still receives guaranteed completion points.
- Two starting hints. A hint highlights an unfound theme word and reduces the final score.
- Completed themes and each theme's best score persist in localStorage; signed-in users also attempt Firestore sync through `strands-progress/{uid}`.
- In-level progress is intentionally **not** saved. Leaving an active puzzle shows a confirmation modal and resets that run.
- Any completed theme can be replayed. Replays can improve the saved best score, but cannot farm unlimited permanent points because the header total is the sum of each theme's best score.
- Firebase Authentication and the existing Zat.am Firestore leaderboard pattern are included.
- Local JSON fallback allows development before the `strands-themes` Firestore collection is created.

## Scoring model

The values are data-driven per theme. The initial two themes use:

- Regular theme word: +15
- Spangram: +40
- Guaranteed completion: +100
- Time bonus: up to +120, proportional to time remaining
- Hint penalty: −15 per hint used
- Minimum completed run score: 100 points

Stars are calculated at completion:

- 3 stars: finish with at least 50% of the timer remaining and use no hints
- 2 stars: finish before time reaches zero
- 1 star: finish in overtime

## Run locally

```bash
npm install
npm run dev
```

The Vite dev server uses port 8443. Production:

```bash
npm run build
```

`vite.config.ts` uses `base: './'` so the production bundle can be hosted from the Zat.am `Games/SanskritStrands/` subdirectory.

## Important data rule

Do not manually change a target path without changing the board. `themeService.ts` validates token/path alignment, adjacency, cell reuse, full board coverage and the spangram. If a future Firebase/JSON puzzle is invalid, the game will fail loudly instead of giving players impossible answers.

## Main source structure

```text
src/
  components/
    ExitConfirmModal.tsx
    GameHeader.tsx
    HintPanel.tsx
    ResultsModal.tsx
    ScoreBreakdown.tsx
    StrandBoard.tsx
    ThemeSidebar.tsx
    TimerCard.tsx
    WordPanel.tsx
  firebase/firebase-config.ts
  hooks/useAuth.ts
  services/
    audioService.ts
    leaderboardService.ts
    themeService.ts
  styles/
    global.css
    game.css
    responsive.css
  types/gameTypes.ts
  utils/board.ts
  App.tsx
```

The color system is intentionally different from the Dialogue Game. It uses the warmer proposal direction: parchment/ivory surfaces, forest green, sky blue, gold and terracotta.


## v3 updates
- Theme 1 reduced to 8 words on a 6×6 board with a 5-minute beginner timer.
- SA/EN interface switch added; Sanskrit grid and target words remain Sanskrit.
- Discovered words pronounce automatically and have a persistent replay speaker button.


## v4 gameplay update

- Timer changed from countdown to **count-up from 00:00**.
- Speed bonus decreases by a configured amount after each completed minute; faster completions score higher.
- Level progression is now deliberate:
  - Level 1 School: **6×6, 5 words, 3 hints**
  - Level 2 Food: **6×7, 7 words, 3 hints**
  - Level 3 Nature: **6×8, 9 words, 2 hints**
- Discoveries now appear as **blank word slots** before being found.
- Found Sanskrit words reveal with a **speaker button in front** and automatic pronunciation on discovery.
- Hint paths use a separate **blue highlight**.
- SA/EN interface switching remains available while the grid and game words stay in Sanskrit.
- Completion/best-score persistence remains; unfinished in-level progress remains intentionally unsaved.
