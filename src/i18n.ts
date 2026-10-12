import type { Language } from './types/gameTypes';

const EN = {
  games:'Games', brandKicker:'SANSKRIT STRANDS', brandLine:'Connect • Discover • Learn',
  bestTotal:'BEST TOTAL', thisRun:'THIS RUN', login:'Zat.am Login', signingIn:'Signing in…', signOut:'Sign out', language:'SA',
  puzzleJourney:'PUZZLE JOURNEY', chooseTheme:'Choose a level', locked:'LOCKED', completedReplay:'COMPLETED • REPLAY', best:'Best',
  todaysTheme:'LEVEL THEME', currentMessage:'CURRENT MESSAGE', found:'found',
  ready:'READY?', elapsed:'ELAPSED TIME', speedBonusNow:'Speed bonus now', startPuzzle:'Start Puzzle',
  boardHelp:'Press and hold, drag through touching cells, then release to submit.',
  hints:'HINTS', remaining:'remaining', hintExplainer:'Highlights one unfound path in blue. Each hint costs', points:'points', used:'Used', useHint:'Use Hint',
  discoveries:'DISCOVERIES', left:'left', findSpangram:'Find the Spangram', hiddenWord:'Hidden word',
  discoveryHelp:'The blanks show how many grid pieces belong to each answer. Found words are revealed here.',
  hintActive:'Hint active', hintActiveText:'The blue glowing cells belong to one unfound word. Trace them in order.',
  scoringWorks:'How scoring works', scoringText:'Word points + completion points + speed bonus − hint cost. The timer counts upward, so finishing sooner keeps more bonus points.',
  puzzleComplete:'PUZZLE COMPLETE', pointsThisRun:'points this run', wordsSpangram:'Words + spangram', completion:'Completion',
  speedBonus:'Speed bonus', hintCost:'Hint cost', runScore:'Run score', bestTheme:'Best for this level',
  savedNote:'Completed levels and best scores are saved. Progress inside an unfinished level is not.',
  replay:'Replay', nextTheme:'Next Level', leavePuzzle:'LEAVE THIS LEVEL?', loseProgress:'Your current level progress will be lost.',
  loseProgressBody:"Completed levels stay saved and can be replayed anytime, but unfinished words, elapsed time and this run's score are not saved.",
  stayContinue:'Stay & Continue', leaveLevel:'Leave Level', playPronunciation:'Play pronunciation',
  audioHelp:'Use the speaker beside a discovered word to hear its Sanskrit pronunciation again.'
 , answersShown: 'Answers shown',words: 'words',findFeatured: 'Find the Featured Word',bonusWords: 'Bonus Words',
};

const SA = {
  games:'क्रीडाः', brandKicker:'संस्कृत स्ट्रैण्ड्स्', brandLine:'संयोजय • अन्वेषय • शिक्षस्व',
  bestTotal:'श्रेष्ठाङ्कः', thisRun:'अस्यां क्रीडायाम्', login:'Zat.am प्रवेशः', signingIn:'प्रवेशः क्रियते…', signOut:'निर्गमनम्', language:'EN',
  puzzleJourney:'प्रहेलिकायात्रा', chooseTheme:'स्तरं चिनोतु', locked:'बद्धम्', completedReplay:'समाप्तम् • पुनः क्रीडतु', best:'श्रेष्ठम्',
  todaysTheme:'स्तरविषयः', currentMessage:'वर्तमानसन्देशः', found:'लब्धाः',
  ready:'सिद्धम्?', elapsed:'गतसमयः', speedBonusNow:'वर्तमानः शीघ्रतालाभः', startPuzzle:'आरभताम्',
  boardHelp:'प्रथमकोष्ठे स्पृशित्वा धारयतु, समीपकोष्ठेषु कर्षतु, अन्ते मुञ्चतु।',
  hints:'सूचनाः', remaining:'अवशिष्टाः', hintExplainer:'एका अलब्धपन्था नीलवर्णेन प्रकाश्यते। प्रत्येकसूचनायाः मूल्यं', points:'अङ्काः', used:'प्रयुक्ताः', useHint:'सूचनां प्रयोजयतु',
  discoveries:'लब्धशब्दाः', left:'अवशिष्टाः', findSpangram:'विशेषशब्दं अन्वेषयतु', hiddenWord:'गुप्तशब्दः',
  discoveryHelp:'रेखाः प्रत्येकस्य उत्तरस्य कोष्ठसंख्यां दर्शयन्ति। लब्धः शब्दः अत्र दृश्यते।',
  hintActive:'सूचना सक्रियाऽस्ति', hintActiveText:'नीलदीप्तकोष्ठाः एकस्य अलब्धशब्दस्य भागाः। क्रमेण तान् योजयतु।',
  scoringWorks:'अङ्कगणना', scoringText:'शब्दाङ्काः + पूर्त्यङ्काः + शीघ्रतालाभः − सूचनाव्ययः। समयः शून्यात् वर्धते; शीघ्रसमाप्त्या अधिकः लाभः।',
  puzzleComplete:'प्रहेलिका समाप्ता', pointsThisRun:'अस्यां क्रीडायाम् अङ्काः', wordsSpangram:'शब्दाः + विशेषशब्दः', completion:'पूर्तिः',
  speedBonus:'शीघ्रतालाभः', hintCost:'सूचनाव्ययः', runScore:'क्रीडाङ्कः', bestTheme:'अस्य स्तरस्य श्रेष्ठम्',
  savedNote:'समाप्तस्तराः श्रेष्ठाङ्काश्च रक्ष्यन्ते। असमाप्तस्तरस्य मध्यप्रगतिः न रक्ष्यते।',
  replay:'पुनः क्रीडतु', nextTheme:'अग्रिमस्तरः', leavePuzzle:'स्तरं त्यजति?', loseProgress:'अस्य स्तरस्य वर्तमानप्रगतिः नश्यति।',
  loseProgressBody:'समाप्तस्तराः रक्षिताः भवन्ति तथा पुनः क्रीडितुं शक्यन्ते, किन्तु असमाप्तशब्दाः, गतसमयः, अस्यां क्रीडायाम् अङ्काश्च न रक्ष्यन्ते।',
  stayContinue:'अत्रैव तिष्ठतु', leaveLevel:'स्तरं त्यजतु', playPronunciation:'उच्चारणं शृणोतु',
  audioHelp:'लब्धशब्दस्य समीपे ध्वनिचिह्नं नुदित्वा संस्कृतोच्चारणं पुनः शृणोतु।',answersShown: 'उत्तराणि दर्शितानि',words: 'पदानि',findFeatured: 'विशिष्टपदं अन्विष्यतु',bonusWords: 'अतिरिक्तपदानि',};

export type TextKey = keyof typeof EN;
export function tr(lang: Language, key: TextKey): string {
  return (lang === 'sa' ? SA : EN)[key];
}
