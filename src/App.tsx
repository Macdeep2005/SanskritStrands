import { useEffect, useMemo, useState } from 'react';

import type { Cell, Language, ScoreBreakdown, Theme } from './types/gameTypes';

import { loadThemes } from './services/themeService';

import { pathText, targetForPath } from './utils/board';

import { postScore } from './services/leaderboardService';

import { loadCloudProgress, saveCloudProgress } from './services/progressService';

import { playWordAudio } from './services/audioService';

import { useAuth } from './hooks/useAuth';

import { tr } from './i18n';

import GameHeader from './components/GameHeader';

import ThemeSidebar from './components/ThemeSidebar';

import StrandBoard from './components/StrandBoard';

import WordPanel from './components/WordPanel';

import HintPanel from './components/HintPanel';

import TimerCard, { speedBonusFor } from './components/TimerCard';

import ResultsModal from './components/ResultsModal';

import ExitConfirmModal from './components/ExitConfirmModal';

import TutorialOverlay from './components/TutorialOverlay';

import ShowAnswerModal from './components/ShowAnswerModal';

import { generateBoard } from './utils/generateBoard';



const COMPLETED_KEY = 'sanskrit-strands-completed-v7';

const BEST_SCORES_KEY = 'sanskrit-strands-best-scores-v7';

const LANGUAGE_KEY = 'sanskrit-strands-language';

const TUTORIAL_KEY = 'sanskrit-strands-tutorial-seen-v5';

type PendingExit = { type:'back' } | { type:'theme'; index:number } | null;



function loadCompleted() {

  try {

    const value = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');

    return new Set<string>(Array.isArray(value) ? value : []);

  } catch { return new Set<string>(); }

}

function loadBestScores() {

  try {

    const value = JSON.parse(localStorage.getItem(BEST_SCORES_KEY) || '{}');

    return value && typeof value === 'object' ? value as Record<string,number> : {};

  } catch { return {}; }

}

function loadLanguage(): Language {

  return localStorage.getItem(LANGUAGE_KEY) === 'sa' ? 'sa' : 'en';

}



export default function App() {

  const [themes,setThemes] = useState<Theme[]>([]);

  const [loadError,setLoadError] = useState('');

  const [active,setActive] = useState(0);

  const [selection,setSelection] = useState<Cell[]>([]);

  const [found,setFound] = useState(new Set<string>());

  const [revealed,setRevealed] = useState(new Set<string>());

  const [completed,setCompleted] = useState<Set<string>>(() => loadCompleted());

  const [bestScores,setBestScores] = useState<Record<string,number>>(() => loadBestScores());

  const [wordPoints,setWordPoints] = useState(0);

  const [hintsRemaining,setHintsRemaining] = useState(0);

  const [hintsUsed,setHintsUsed] = useState(0);

  const [started,setStarted] = useState(false);

  const [elapsedSeconds,setElapsedSeconds] = useState(0);

  const [message,setMessage] = useState('');

  const [done,setDone] = useState(false);

  const [breakdown,setBreakdown] = useState<ScoreBreakdown|null>(null);

  const [leaderboard,setLeaderboard] = useState('');

  const [pendingExit,setPendingExit] = useState<PendingExit>(null);

  const [language,setLanguage] = useState<Language>(() => loadLanguage());

  const [tutorialOpen,setTutorialOpen] = useState(() => localStorage.getItem(TUTORIAL_KEY) !== '1');

  const [boardFeedback,setBoardFeedback] = useState<''|'correct'|'wrong'>('');

  const [showAnswerConfirm,setShowAnswerConfirm] = useState(false);

  const [answerMode,setAnswerMode] = useState(false);



  const { user,loading,signingIn,login,logout } = useAuth();



  const sourceTheme = themes[active];
  const [boardVersion,setBoardVersion] = useState(0);

  const theme = useMemo(() => {
    if (!sourceTheme) return undefined;

    const generated = generateBoard(sourceTheme);

    console.log(
      'NEW RANDOM BOARD:',
      generated.id,
      generated.grid,
    );

    return generated;
  }, [sourceTheme, boardVersion]);

  const requiredTargets = useMemo(

  () => theme?.targets.filter((target) => !target.bonus) ?? [],

  [theme],

);



const foundRequiredCount = useMemo(

  () =>

    requiredTargets.filter((target) =>

      found.has(target.id),

    ).length,

  [requiredTargets, found],

);



  useEffect(() => {

    loadThemes()

      .then(({themes:loaded}) => setThemes(loaded))

      .catch((error) => setLoadError(error instanceof Error ? error.message : String(error)));

  }, []);



  useEffect(() => { localStorage.setItem(COMPLETED_KEY,JSON.stringify([...completed])); }, [completed]);

  useEffect(() => { localStorage.setItem(BEST_SCORES_KEY,JSON.stringify(bestScores)); }, [bestScores]);

  useEffect(() => { localStorage.setItem(LANGUAGE_KEY,language); }, [language]);



  useEffect(() => {

    if (!user) return;

    let live = true;

    loadCloudProgress(user).then((cloud) => {

      if (!live || !cloud) return;

      setCompleted((local) => new Set([...local,...cloud.completedThemeIds]));

      setBestScores((local) => {

        const merged = {...local};

        for (const [id,score] of Object.entries(cloud.bestScores)) {

          merged[id] = Math.max(merged[id] ?? 0, Number(score) || 0);

        }

        return merged;

      });

    }).catch((error) => console.warn('Cloud progress unavailable; local progress remains.',error));

    return () => { live = false; };

  }, [user]);



  function readyMessage() {

    return language === 'sa' ? 'सिद्धे सति “आरभताम्” नुदतु।' : 'Press Start Puzzle when you are ready.';

  }



  function resetRun(nextTheme = theme) {

    setSelection([]);

    setFound(new Set());

    setRevealed(new Set());

    setWordPoints(0);

    setHintsUsed(0);

    setHintsRemaining(nextTheme?.startingHints ?? 0);

    setStarted(false);

    setElapsedSeconds(0);

    setMessage(readyMessage());

    setDone(false);

    setBreakdown(null);

    setLeaderboard('');

    setBoardFeedback('');

    setShowAnswerConfirm(false);

    setAnswerMode(false);

  }

  function restartCurrentTheme() {
    setBoardVersion((version) => version + 1);
  }



  useEffect(() => {

    if (theme) resetRun(theme);

    // Each level/replay starts fresh; only completed levels and best scores persist.

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [active, boardVersion, sourceTheme?.id]);



  useEffect(() => {

    if (!started && !done) setMessage(readyMessage());

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [language]);



  useEffect(() => {

    if (!started || done || answerMode) return;

    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);

    return () => window.clearInterval(timer);

  }, [started,done]);



const hasInProgressRun = Boolean(

  theme &&

  started &&

  !done &&

  !answerMode &&

  foundRequiredCount < requiredTargets.length

);

  useEffect(() => {

    const warnBeforeUnload = (event:BeforeUnloadEvent) => {

      if (!hasInProgressRun) return;

      event.preventDefault();

      event.returnValue = '';

    };

    window.addEventListener('beforeunload',warnBeforeUnload);

    return () => window.removeEventListener('beforeunload',warnBeforeUnload);

  }, [hasInProgressRun]);



  const totalBestPoints = useMemo(

    () => Object.values(bestScores).reduce((sum,score) => sum + (Number(score)||0),0),

    [bestScores]

  );

  const runDisplayPoints = breakdown?.total ?? wordPoints;



  function flashBoard(type:'correct'|'wrong') {

    setBoardFeedback('');

    window.requestAnimationFrame(() => {

      setBoardFeedback(type);

      window.setTimeout(() => setBoardFeedback(''), 420);

    });

  }



  function closeTutorial() {

    setTutorialOpen(false);

    localStorage.setItem(TUTORIAL_KEY,'1');

  }



  function startPuzzle() {

    if (started) return;

    setStarted(true);

    setMessage(language === 'sa'

      ? 'सर्वान् विषयशब्दान् अन्वेषयतु। समयगणना आरब्धा!'

      : 'Find all theme words. The timer is running!');

  }



  function calculateBreakdown(
    activeTheme: Theme,
    finalWordPoints: number,
  ): ScoreBreakdown {

    const speedBonus = speedBonusFor(activeTheme,elapsedSeconds);

    const penalty = hintsUsed * activeTheme.hintPenalty;

    const rawTotal =
      finalWordPoints +
      activeTheme.completionPoints +
      speedBonus -
      penalty;

    const total = Math.max(
      activeTheme.completionPoints,
      rawTotal,
    );

    const minutes = elapsedSeconds / 60;

    const stars:1|2|3 =

      hintsUsed === 0 && minutes < 3 ? 3 :

      minutes < 6 ? 2 : 1;

    return {

      wordPoints:finalWordPoints,

      completionPoints:activeTheme.completionPoints,

      speedBonus,

      hintPenalty:penalty,

      total,

      elapsedSeconds,

      hintsUsed,

      stars

    };

  }



  async function submit(path:Cell[]) {

    if (!theme || path.length === 0 || !started || done) {

      setSelection([]);

      return;

    }



    const target = targetForPath(theme,path);

    const selectedText = pathText(theme,path).trim();



    if (target && !found.has(target.id)) {

      flashBoard('correct');

      const nextFound = new Set(found).add(target.id);

    const gained = target.bonus

    ? theme.bonusWordPoints

    : target.featured

      ? theme.featuredWordPoints

      : theme.themeWordPoints;

      const nextWordPoints = wordPoints + gained;



      setFound(nextFound);

      setWordPoints(nextWordPoints);

      setRevealed((current) => {

        const next = new Set(current);

        next.delete(target.id);

        return next;

      });



      // Finding a word is a user-initiated pointer action, so pronunciation is attempted immediately.

      playWordAudio(target.audioPath,target.word).catch(() => undefined);



      setMessage(

  target.bonus

    ? (

        language === 'sa'

          ? `अतिरिक्तशब्दः! ${target.word} +${gained}`

          : `Bonus word! ${target.word} — ${target.meaning} +${gained}`

      )

    : target.featured

      ? (

          language === 'sa'

            ? `विशिष्टशब्दः! ${target.word} +${gained}`

            : `Featured Word! ${target.word} — ${target.meaning} +${gained}`

        )

      : (

          language === 'sa'

            ? `${target.word} +${gained}`

            : `${target.word} — ${target.meaning} +${gained}`

        )

);



      const nextRequiredCount = requiredTargets.filter(

        (item) => nextFound.has(item.id),

      ).length;



      if (nextRequiredCount === requiredTargets.length) {

        const finalBreakdown = calculateBreakdown(theme,nextWordPoints);

        setBreakdown(finalBreakdown);

        setDone(true);



        const nextCompleted = new Set(completed).add(theme.id);

        setCompleted(nextCompleted);



        const previousBest = bestScores[theme.id] ?? 0;

        const nextBestScores = {...bestScores,[theme.id]:Math.max(previousBest,finalBreakdown.total)};

        setBestScores(nextBestScores);



        if (user) {

          saveCloudProgress(user,[...nextCompleted],nextBestScores)

            .catch((error) => console.warn('Could not sync completed progress; local progress is saved.',error));



          const overallBest = Object.values(nextBestScores)

            .reduce((sum,score) => sum + (Number(score)||0),0);

          try {

            const saved = await postScore(user,overallBest);

            setLeaderboard(saved

              ? 'Leaderboard updated with your best total.'

              : 'Your existing daily leaderboard score is higher.');

          } catch (error) {

            console.error('Could not submit Strands score:',error);

            setLeaderboard('Puzzle completed. Leaderboard submission could not be completed.');

          }

        }

      }

    } else if (target) {

      flashBoard('wrong');

      setMessage(language === 'sa' ? `${target.word} पूर्वमेव लब्धः।` : `${target.word} is already found.`);

    } else {

      flashBoard('wrong');

      setMessage(language === 'sa'

        ? (selectedText ? `“${selectedText}” अस्य विषयस्य शब्दः नास्ति।` : 'अन्यं पन्थानं प्रयतताम्।')

        : (selectedText ? `“${selectedText}” is not one of this puzzle's theme words.` : 'Try another path.'));

    }

    setSelection([]);

  }



  function useHint() {

    if (!theme || !started || hintsRemaining < 1 || done) return;

  const target = theme.targets.find(

    (item) =>

      !item.bonus &&

      !found.has(item.id) &&

      !revealed.has(item.id)

  );

    if (!target) {

      setMessage(language === 'sa'

        ? 'सर्वेषाम् अवशिष्टशब्दानां सूचना सक्रियाऽस्ति।'

        : 'Every remaining word already has a hint active.');

      return;

    }

    setHintsRemaining((count) => count - 1);

    setHintsUsed((count) => count + 1);

    setRevealed((current) => new Set(current).add(target.id));

    setMessage(language === 'sa'

      ? `नीलसूचना प्रयुक्ता। अन्तिमाङ्काः −${theme.hintPenalty}।`

      : `Blue hint active. Final score −${theme.hintPenalty}.`);

  }



  function requestShowAnswer() {

    if (done || answerMode) return;

    setShowAnswerConfirm(true);

  }



  function confirmShowAnswer() {

    if (!theme) return;

    setShowAnswerConfirm(false);

    setSelection([]);

    setFound(new Set());

    setRevealed(new Set(theme.targets.map((target) => target.id)));

    setWordPoints(0);

    setHintsUsed(0);

    setHintsRemaining(theme.startingHints);

    setStarted(false);

    setElapsedSeconds(0);

    setBreakdown(null);

    setLeaderboard('');

    setAnswerMode(true);

    setMessage(language === 'sa'

      ? 'उत्तरपन्थाः दर्शिताः। अस्य प्रयासस्य प्रगतिः न रक्षिता।'

      : 'Answer mode: this run has been cleared and will not count as a completion.');

  }



  function requestBack() {

    if (hasInProgressRun) setPendingExit({type:'back'});

    else window.history.back();

  }

  function requestThemeChange(index:number) {

    if (index === active) return;

    if (hasInProgressRun) setPendingExit({type:'theme',index});

    else setActive(index);

  }

  function confirmExit() {

    const action = pendingExit;

    setPendingExit(null);

    if (!action) return;

    if (action.type === 'back') window.history.back();

    else setActive(action.index);

  }



  if (loadError) return <main className="load-state"><h1>Sanskrit Strands</h1><p>{loadError}</p></main>;

  if (!theme) return <main className="load-state"><h1>Sanskrit Strands</h1><p>Loading puzzle data…</p></main>;



  return (

    <div className="portal-game-shell">

      <GameHeader

        totalPoints={totalBestPoints}

        runPoints={runDisplayPoints}

        user={user}

        onLogin={login}

        onLogout={logout}

        signingIn={signingIn || loading}

        onBack={requestBack}

        language={language}

        onLanguageToggle={() => setLanguage((value) => value === 'en' ? 'sa' : 'en')}

      />



      <div className="portal-body">

        <ThemeSidebar

          themes={themes}

          active={active}

          completed={completed}

          bestScores={bestScores}

          onSelect={requestThemeChange}

          language={language}

        />



        <main className="game-main" style={{background:theme.background}}>

          <section className="theme-banner">

            <div className="theme-heading">

              <div className="theme-eyebrow">{tr(language,'todaysTheme')}</div>

              <h1>{theme.titleSanskrit} {language === 'en' && <span>{theme.titleEnglish}</span>}</h1>

              <p>{language === 'sa' ? (theme.clueSanskrit || theme.clue) : theme.clue}</p>

            </div>

            <div className="theme-meta">

              <span>{language === 'sa' ? (theme.difficultySanskrit || theme.difficulty) : theme.difficulty}</span>

              <b>{theme.rows} × {theme.cols}</b>

              <b>{theme.targets.length} words</b>

              <button className="tutorial-help-btn" onClick={() => setTutorialOpen(true)} aria-label="How to play">?</button>

            </div>

          </section>



          <div className="game-grid">

            <section className="board-card">

              <div className="status-line">

                <div><small>{tr(language,'currentMessage')}</small><strong>{message}</strong></div>

                  <span>

                    {answerMode

                      ? 'Answers shown'

                      : `${foundRequiredCount}/${requiredTargets.length} ${tr(language,'found')}`}

                  </span>              </div>

              {!answerMode && (

  <div

    className="level-progress"

    aria-label={`${foundRequiredCount} of ${requiredTargets.length} required words found`}

  >

    <div

      className="level-progress-fill"

      style={{

        width: `${

          requiredTargets.length

            ? (foundRequiredCount / requiredTargets.length) * 100

            : 0

        }%`,

      }}

    />

  </div>

)}



              <TimerCard

                elapsedSeconds={elapsedSeconds}

                started={started}

                onStart={startPuzzle}

                language={language}

                theme={theme}

              />



              <StrandBoard

                theme={theme}

                selection={selection}

                found={found}

                revealed={revealed}

                disabled={!started || done || answerMode}

                onChange={setSelection}

                onSubmit={submit}

                language={language}

                feedback={boardFeedback}

                showAnswers={answerMode}

              />



              <HintPanel

                hintsRemaining={hintsRemaining}

                hintsUsed={hintsUsed}

                hintPenalty={theme.hintPenalty}

                canHint={started && !done && hintsRemaining > 0}

                onHint={useHint}

                language={language}

                onShowAnswer={requestShowAnswer}

                canShowAnswer={!done && !answerMode}

              />



              {answerMode && (

                <div className="answer-mode-bar">

                  <div>

                    <strong>{language === 'sa' ? 'उत्तरमोड्' : 'Answer Mode'}</strong>

                    <span>{language === 'sa' ? 'अस्य प्रयासस्य अङ्काः न रक्ष्यन्ते।' : 'This run will not be saved or scored.'}</span>

                  </div>

                  <button onClick={restartCurrentTheme}>{language === 'sa' ? 'स्तरं पुनः आरभताम्' : 'Restart Level'}</button>

                </div>

              )}

            </section>



            <WordPanel theme={theme} found={found} revealed={revealed} language={language} showAnswers={answerMode} />

          </div>

        </main>

      </div>



      <ResultsModal

        open={done}

        theme={theme.titleSanskrit}

        breakdown={breakdown}

        bestScore={bestScores[theme.id] ?? 0}

        leaderboard={leaderboard}

        onReplay={restartCurrentTheme}

        onNext={() => setActive((index) => Math.min(index + 1,themes.length - 1))}

        onBack={() => window.history.back()}

        hasNext={active < themes.length - 1}

        language={language}

      />



      <TutorialOverlay open={tutorialOpen && !started && !answerMode && !showAnswerConfirm} language={language} onClose={closeTutorial} />



      <ShowAnswerModal

        open={showAnswerConfirm}

        language={language}

        onCancel={() => setShowAnswerConfirm(false)}

        onConfirm={confirmShowAnswer}

      />



      <ExitConfirmModal

        open={pendingExit !== null}

        onStay={() => setPendingExit(null)}

        onLeave={confirmExit}

        language={language}

      />

    </div>

  );

}
