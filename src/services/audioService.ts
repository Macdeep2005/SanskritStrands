export async function playWordAudio(audioPath:string, word:string){
  if(audioPath){
    try{
      const audio=new Audio(audioPath);
      audio.preload='auto';
      await audio.play();
      return;
    }catch(error){
      console.warn('Recorded Sanskrit audio could not be played:', audioPath, error);
    }
  }

  // Fallback only if the supplied recording is unavailable.
  if('speechSynthesis' in window){
    speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(word);
    utterance.lang='sa-IN';
    utterance.rate=.8;
    const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('sa'));
    if(voice) utterance.voice=voice;
    speechSynthesis.speak(utterance);
  }
}
