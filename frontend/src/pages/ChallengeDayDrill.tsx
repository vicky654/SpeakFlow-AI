import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChallengeStore } from '../store/challengeStore';
import { 
  ArrowLeft, ChevronRight, BookOpen, Volume2, Mic, Play, Pause, Award, 
  RefreshCw, CheckCircle2, ChevronLeft, Sparkles, Send, Gamepad2, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ChallengeDayDrill: React.FC = () => {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();
  const dayNum = parseInt(dayNumber || '1');

  const { activeDayContent, fetchDayContent, completeDay } = useChallengeStore();
  const [step, setStep] = useState<number>(1); // Steps 1 to 8

  // Vocabulary Flip index state
  const [vocabIndex, setVocabIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Grammar quiz answers state
  const [grammarAnswer, setGrammarAnswer] = useState<string | null>(null);

  // Speaking state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speakingSentIndex, setSpeakingSentIndex] = useState(0);

  // Listening state
  const [isPlaying, setIsPlaying] = useState(false);
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});

  // Writing state
  const [writingText, setWritingText] = useState('');
  const [writingWordsCount, setWritingWordsCount] = useState(0);

  // Final Day Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchDayContent(dayNum);
  }, [dayNum, fetchDayContent]);

  // Set up Speech Recognition for Speaking Step
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current = rec;
    }
  }, []);

  if (!activeDayContent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 flex-col space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading Day {dayNum} content drills...</p>
      </div>
    );
  }

  // Speak words phonetic helper
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Play audio dialogue transcript
  const togglePlayAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        window.speechSynthesis.cancel();
        const cleaned = activeDayContent.listening.transcript.replace(/\*/g, '');
        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  // Speaking Toggle
  const handleToggleRecord = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleNextStep = () => {
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Quiz submission
  const handleSubmitQuiz = async () => {
    const totalQuestions = activeDayContent.quiz.length;
    let correctCount = 0;
    activeDayContent.quiz.forEach((q: any) => {
      if (quizAnswers[q.id] === q.answer) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / totalQuestions) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    // Save progress triggers
    await completeDay(dayNum, {
      quizAnswers,
      writingText,
      grammarAnswer,
      listeningAnswers
    }, scorePct);

    // Confetti
    confetti({
      particleCount: 180,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 select-none max-w-lg mx-auto pb-8">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <button
          onClick={() => navigate('/challenge')}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Challenge</span>
        </button>
        <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
          Day {dayNum} Drill
        </span>
      </div>

      {/* STEP PROGRESS BAR */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
          <span>Drill Step {step} of 7</span>
          <span>
            {step === 1 ? 'Introduction' :
             step === 2 ? 'Vocabulary (10 words)' :
             step === 3 ? 'Grammar Lesson' :
             step === 4 ? 'Oral Practice' :
             step === 5 ? 'Listening Comprehension' :
             step === 6 ? 'Writing Review' :
             'Comprehensive Quiz'}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-650 transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* ================= STEP 1: INTRODUCTION ================= */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="glass-card rounded-3xl p-5 border border-slate-205/10 text-center space-y-4">
            <span className="text-4xl">🚀</span>
            <h2 className="text-xl font-extrabold text-white">Welcome to Day {dayNum}!</h2>
            <p className="text-xs text-slate-400 leading-relaxed px-2">
              Today you will learn 10 new vocabulary words, master <span className="text-indigo-400 font-bold">"{activeDayContent.grammar.conceptName}"</span>, practice oral speaking, complete interactive listening exercises, draft a client-ready message, and pass a comprehensive quiz.
            </p>
            <div className="pt-2 flex flex-col space-y-1 text-[10px] font-semibold text-slate-500">
              <span>⏰ Approx Time: 15 minutes</span>
              <span>💎 Completion Bonus: +150 XP & +25 Coins</span>
            </div>
          </div>
          <button
            onClick={handleNextStep}
            className="w-full py-2.5 bg-indigo-600 active:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md"
          >
            <span>Begin Guided Practice</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= STEP 2: VOCABULARY DECK ================= */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-200 text-base">1. Vocabulary Booster</h3>
            <p className="text-[10px] text-slate-405 leading-normal">Familiarize yourself with today's 10 target words. Tap cards to flip.</p>
          </div>

          {activeDayContent.vocabulary.length > 0 && (
            <div className="space-y-4">
              <div 
                className="w-full h-80 cursor-pointer flip-card"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className={`relative w-full h-full flip-card-inner rounded-3xl border border-slate-200/10 dark:border-slate-800/80 shadow-xl ${isFlipped ? 'flip-card-flipped' : ''}`}>
                  
                  {/* Front Card */}
                  <div className="absolute inset-0 w-full h-full p-5 flex flex-col justify-between rounded-3xl bg-slate-900/60 dark:bg-slate-950/60 flip-card-front">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 w-max">
                      {activeDayContent.vocabulary[vocabIndex].partOfSpeech}
                    </span>
                    
                    <div className="my-auto text-center space-y-2">
                      <h2 className="text-2xl font-black text-white tracking-wide">
                        {activeDayContent.vocabulary[vocabIndex].word}
                      </h2>
                      <div className="flex items-center justify-center space-x-1.5">
                        <span className="text-slate-400 font-mono text-xs">{activeDayContent.vocabulary[vocabIndex].pronunciation}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); speakText(activeDayContent.vocabulary[vocabIndex].word); }}
                          className="p-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 active:scale-95"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="pt-2">
                        <span className="text-[8px] text-slate-500 uppercase tracking-widest block font-bold">Hindi Meaning</span>
                        <p className="text-lg font-bold text-slate-100">{activeDayContent.vocabulary[vocabIndex].hindiMeaning}</p>
                      </div>
                    </div>

                    <p className="text-[9px] text-slate-500 text-center">Tap to see explanations & memory trick</p>
                  </div>

                  {/* Back Card */}
                  <div className="absolute inset-0 w-full h-full p-5 flex flex-col justify-between overflow-y-auto rounded-3xl bg-slate-900 dark:bg-slate-950 flip-card-back">
                    <div className="space-y-3 text-left">
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-slate-450 font-bold">Meaning</span>
                        <p className="text-xs text-slate-200 mt-0.5 leading-normal">{activeDayContent.vocabulary[vocabIndex].englishMeaning}</p>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-indigo-400 font-bold">Memory Trick</span>
                        <p className="text-xs text-indigo-200 italic mt-0.5 leading-normal bg-indigo-950/40 p-2 rounded-lg">
                          {activeDayContent.vocabulary[vocabIndex].memoryTrick}
                        </p>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-slate-450 font-bold">Example</span>
                        <p className="text-xs text-slate-300 italic mt-0.5 leading-normal">
                          "{activeDayContent.vocabulary[vocabIndex].exampleSentences[0]}"
                        </p>
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-600 text-center pt-2">Tap to flip back</span>
                  </div>

                </div>
              </div>

              {/* Deck controls */}
              <div className="flex justify-between items-center px-1 text-xs">
                <button
                  disabled={vocabIndex === 0}
                  onClick={() => { setVocabIndex(prev => prev - 1); setIsFlipped(false); }}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 disabled:opacity-20 active:scale-95"
                >
                  Previous Word
                </button>
                <span className="text-slate-500 font-mono">Word {vocabIndex + 1} of 10</span>
                <button
                  disabled={vocabIndex === 9}
                  onClick={() => { setVocabIndex(prev => prev + 1); setIsFlipped(false); }}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 disabled:opacity-20 active:scale-95"
                >
                  Next Word
                </button>
              </div>
            </div>
          )}

          {vocabIndex === 9 && (
            <button
              onClick={handleNextStep}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 mt-4"
            >
              <span>Continue to Grammar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ================= STEP 3: GRAMMAR TUTORIAL ================= */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-200 text-base">2. Grammar Lesson</h3>
            <p className="text-[10px] text-slate-400">Review grammar guides and answer the concept test.</p>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-slate-200/10 dark:border-slate-800/80 space-y-4">
            <h4 className="font-bold text-sm text-indigo-400 border-b border-slate-900 pb-1.5">
              {activeDayContent.grammar.conceptName}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeDayContent.grammar.explanation}
            </p>

            <div className="pt-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Examples</span>
              <ul className="list-disc list-inside text-xs text-slate-350 space-y-1 pl-1">
                {activeDayContent.grammar.examples.map((ex: string, i: number) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Grammar Concept Test Question */}
          {activeDayContent.grammar.interactiveQuiz.length > 0 && (
            <div className="glass-card rounded-3xl p-5 border border-slate-200/10 space-y-3.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Concept Quiz Check</span>
              <p className="text-xs font-bold text-slate-250">
                Q: {activeDayContent.grammar.interactiveQuiz[0].question}
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                {activeDayContent.grammar.interactiveQuiz[0].options.map((opt: string, i: number) => {
                  const isSelected = grammarAnswer === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => setGrammarAnswer(opt)}
                      className={`p-3 text-left text-xs rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold' 
                          : 'bg-slate-950/40 border-slate-900 text-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button onClick={handlePrevStep} className="px-4 py-2 border border-slate-800 text-slate-400 rounded-xl text-xs font-semibold">
              Back
            </button>
            <button
              onClick={handleNextStep}
              disabled={!grammarAnswer}
              className="flex-1 py-2 bg-indigo-600 active:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-40"
            >
              Continue to Speaking
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: SPEAKING DRILL ================= */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-200 text-base">3. Speaking Practice</h3>
            <p className="text-[10px] text-slate-400">Read the active prompt sentences aloud. Verify articulation.</p>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-slate-205/10 space-y-3">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Oral Prompt</span>
            <p className="text-xs text-slate-200 font-semibold leading-relaxed">
              {activeDayContent.speaking.prompt}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-slate-205/10 flex flex-col items-center text-center space-y-4">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Target Sentence</span>
            <p className="text-xs font-extrabold text-slate-200 px-3 bg-slate-950/40 py-2 border border-slate-900 rounded-xl leading-normal">
              "{activeDayContent.speaking.sentencesToRead[speakingSentIndex]}"
            </p>

            <button
              onClick={handleToggleRecord}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-rose-600 shadow-lg shadow-rose-600/20 scale-105' 
                  : 'bg-indigo-600 shadow-lg shadow-indigo-600/20 active:scale-90'
              }`}
            >
              <Mic className="w-5 h-5 text-white" />
            </button>
            <span className="text-[9px] font-bold text-slate-500">
              {isRecording ? 'Listening... Speak now' : 'Click mic and read aloud'}
            </span>

            {transcript && (
              <div className="w-full text-left bg-slate-950/70 p-3 border border-slate-900 rounded-xl space-y-1">
                <span className="text-[8px] font-bold text-slate-500 uppercase">Transcription Output:</span>
                <p className="text-xs text-slate-350 italic">"{transcript}"</p>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-2">
            <button onClick={handlePrevStep} className="px-4 py-2 border border-slate-800 text-slate-400 rounded-xl text-xs font-semibold">
              Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-2 bg-indigo-600 active:bg-indigo-500 text-white rounded-xl text-xs font-bold"
            >
              Continue to Listening
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: LISTENING COMPREHENSION ================= */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-200 text-base">4. Listening Room</h3>
            <p className="text-[10px] text-slate-400">Listen to the dialogue monologues and answer the retention test.</p>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-slate-200/10 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Audio Dialogues</span>
              <button
                onClick={togglePlayAudio}
                className="w-9 h-9 rounded-full bg-indigo-600 active:bg-indigo-500 text-white flex items-center justify-center shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
            </div>
            <p className="text-xs font-bold text-slate-300">
              Click play button above to stream transcription content.
            </p>
          </div>

          {/* Listening questions */}
          {activeDayContent.listening.multipleChoice.length > 0 && (
            <div className="glass-card rounded-3xl p-5 border border-slate-200/10 space-y-3.5">
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">Retention Check</span>
              <p className="text-xs font-bold text-slate-200">
                Q: {activeDayContent.listening.multipleChoice[0].question}
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                {activeDayContent.listening.multipleChoice[0].options.map((opt: string, i: number) => {
                  const isSelected = listeningAnswers[activeDayContent.listening.multipleChoice[0].question] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => setListeningAnswers(prev => ({ ...prev, [activeDayContent.listening.multipleChoice[0].question]: opt }))}
                      className={`p-3 text-left text-xs rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold' 
                          : 'bg-slate-950/40 border-slate-900 text-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button onClick={handlePrevStep} className="px-4 py-2 border border-slate-800 text-slate-400 rounded-xl text-xs font-semibold">
              Back
            </button>
            <button
              onClick={handleNextStep}
              disabled={Object.keys(listeningAnswers).length === 0}
              className="flex-1 py-2 bg-indigo-600 active:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-40"
            >
              Continue to Writing
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 6: WRITING DRILL ================= */}
      {step === 6 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-200 text-base">5. Writing Lab</h3>
            <p className="text-[10px] text-slate-450 leading-normal">Draft emails or reports based on today's target guidelines.</p>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-slate-200/10 space-y-2">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Prompt Instructions</span>
            <p className="text-xs font-bold text-slate-200 leading-relaxed">
              {activeDayContent.writing.prompt}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-slate-200/10 space-y-3">
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
              <span>Interactive Sandbox</span>
              <span>{writingWordsCount} words</span>
            </div>

            <textarea
              placeholder={activeDayContent.writing.placeholder}
              value={writingText}
              onChange={(e) => {
                setWritingText(e.target.value);
                const count = e.target.value.trim() === '' ? 0 : e.target.value.trim().split(/\s+/).length;
                setWritingWordsCount(count);
              }}
              className="w-full h-36 bg-slate-950/70 border border-slate-900 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button onClick={handlePrevStep} className="px-4 py-2 border border-slate-800 text-slate-400 rounded-xl text-xs font-semibold">
              Back
            </button>
            <button
              onClick={handleNextStep}
              disabled={writingWordsCount < 5}
              className="flex-1 py-2 bg-indigo-600 active:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-40"
            >
              Continue to Final Quiz
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 7: FINAL COMPREHENSIVE QUIZ ================= */}
      {step === 7 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-200 text-base">6. Final Curriculum Check</h3>
            <p className="text-[10px] text-slate-400">Complete the comprehensive day quiz to finalize day status.</p>
          </div>

          {!quizSubmitted ? (
            <div className="space-y-4">
              {activeDayContent.quiz.map((q: any, qIdx: number) => (
                <div key={q.id || qIdx} className="glass-card rounded-3xl p-5 border border-slate-200/10 space-y-3 text-left">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-indigo-400">
                    Question {qIdx + 1} • {q.skillType}
                  </span>
                  <p className="text-xs font-extrabold text-slate-200 leading-normal">
                    {q.question}
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt: string, i: number) => {
                      const isSelected = quizAnswers[q.id] === opt;
                      return (
                        <button
                          key={i}
                          onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className={`p-3 text-left text-xs rounded-xl border transition-all leading-normal ${
                            isSelected 
                              ? 'bg-indigo-600 border-indigo-500 text-white font-bold' 
                              : 'bg-slate-950/40 border-slate-900 text-slate-350'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizAnswers).length < activeDayContent.quiz.length}
                className="w-full py-3 bg-indigo-600 active:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-40 mt-2"
              >
                Submit & Finalize Challenge Day
              </button>
            </div>
          ) : (
            // SUCCESS COMPLETED PANEL
            <div className="glass-card rounded-3xl p-6 border border-slate-200/10 text-center space-y-5 bg-gradient-to-br from-indigo-950/20 to-slate-950/15">
              <span className="text-4xl animate-bounce inline-block">🎉</span>
              <h2 className="text-xl font-extrabold text-white">Day {dayNum} Drill Complete!</h2>
              
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500">Quiz Accuracy Score</span>
                <p className="text-3xl font-black text-indigo-400">{quizScore}% Accuracy</p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-900 rounded-2xl text-xs text-slate-300 space-y-2 max-w-xs mx-auto leading-normal">
                <p className="font-semibold text-slate-200">Earned Challenge Rewards:</p>
                <div className="flex justify-center space-x-5 text-indigo-400 font-bold">
                  <span>+150 XP Points</span>
                  <span>+25 Coins</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Timeline day status updated. Day {dayNum + 1 <= 15 ? dayNum + 1 : 15} is now unlocked!
                </p>
              </div>

              <button
                onClick={() => navigate('/challenge')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Return to Challenge Timeline
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
