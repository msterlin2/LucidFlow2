import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Gamepad2, 
  BarChart3, 
  User, 
  Play, 
  Timer, 
  Brain, 
  Zap, 
  LayoutGrid, 
  Type, 
  Calculator,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Rocket,
  Camera,
  Edit2,
  Check,
  Trophy,
  Star,
  Heart,
  Flame,
  Cloud,
  Sun,
  Moon,
  Ghost,
  Coffee,
  Music,
  Info,
  Palette,
  Search,
  BrainCircuit
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Types ---
type Screen = 'home' | 'games' | 'stats' | 'profile' | 'stroop' | 'word' | 'memory' | 'math';

interface GameModule {
  id: Screen;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tag: string;
}

interface UserStats {
  level: number;
  isManualLevel: boolean;
  points: number;
  streak: number;
  sessions: number;
  totalTrainingTime: number; // in seconds
  peakFocus: number; // 0-100
  todayFocusProgress: number; // 0-100
  cognitiveProfile: {
    linguistic: number;
    logic: number;
    memory: number;
    focus: number;
    reaction: number;
  };
  achievements: string[];
  lastSessionDate: string | null;
  gameStats: Record<string, { timePlayed: number }>;
  tutorialsSeen: Record<string, boolean>;
}

const INITIAL_STATS: UserStats = {
  level: 1,
  isManualLevel: false,
  points: 0,
  streak: 0,
  sessions: 0,
  totalTrainingTime: 0,
  peakFocus: 0,
  todayFocusProgress: 0,
  cognitiveProfile: {
    linguistic: 50,
    logic: 50,
    memory: 50,
    focus: 50,
    reaction: 50,
  },
  achievements: [],
  lastSessionDate: null,
  gameStats: {
    stroop: { timePlayed: 0 },
    memory: { timePlayed: 0 },
    word: { timePlayed: 0 },
    math: { timePlayed: 0 },
  },
  tutorialsSeen: {
    stroop: false,
    memory: false,
    word: false,
    math: false,
  },
};

// --- Constants ---
const GAMES: GameModule[] = [
  {
    id: 'stroop',
    title: 'Stroop Challenge',
    description: 'Enhances cognitive flexibility and reaction speed.',
    icon: <Zap className="w-8 h-8 text-primary" />,
    color: 'bg-primary/10',
    tag: 'Improves Focus',
  },
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Strengthens short-term recall and visual scanning.',
    icon: <LayoutGrid className="w-8 h-8 text-tertiary" />,
    color: 'bg-tertiary/10',
    tag: 'Recall Power',
  },
  {
    id: 'word',
    title: 'Word Unscramble',
    description: 'Boosts linguistic processing and vocabulary retrieval.',
    icon: <Type className="w-8 h-8 text-secondary" />,
    color: 'bg-secondary/10',
    tag: 'Language Skills',
  },
  {
    id: 'math',
    title: 'Equation Master',
    description: 'Decode visual variables to solve logic puzzles.',
    icon: <Calculator className="w-8 h-8 text-primary" />,
    color: 'bg-primary/10',
    tag: 'Logic Lab',
  }
];

// --- Components ---

const TutorialOverlay = ({ 
  title, 
  steps, 
  onClose 
}: { 
  title: string, 
  steps: { text: string, icon: React.ReactNode }[], 
  onClose: () => void 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-surface/95 backdrop-blur-md flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-3xl shadow-2xl border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Info className="w-6 h-6" />
            </div>
            <h2 className="font-headline text-2xl font-black text-on-surface tracking-tight">{title}</h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-[160px] flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-6 text-primary shadow-inner">
                {steps[currentStep].icon}
              </div>
              <p className="font-body text-lg text-on-surface-variant leading-relaxed">
                {steps[currentStep].text}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentStep ? "w-8 bg-primary" : "w-1.5 bg-surface-container-highest"
                  )} 
                />
              ))}
            </div>
            
            <button 
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  onClose();
                }
              }}
              className="px-6 py-3 bg-primary text-on-primary font-label font-bold rounded-xl shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
            >
              {currentStep < steps.length - 1 ? "Next" : "Start Training"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const BottomNav = ({ active, onNavigate }: { active: Screen, onNavigate: (s: Screen) => void }) => {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-white/70 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-4px_40px_rgba(45,47,51,0.06)]">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id as Screen)}
          className={cn(
            "flex flex-col items-center justify-center p-3 transition-all duration-300",
            active === item.id 
              ? "bg-surface-container-highest text-primary rounded-full px-6" 
              : "text-on-surface-variant hover:scale-110"
          )}
        >
          <item.icon className={cn("w-6 h-6", active === item.id && "fill-current")} />
          <span className="font-label font-medium text-[10px] tracking-wide uppercase mt-1">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

const Header = ({ avatar, level, points, isManual }: { avatar: string, level: number, points: number, isManual?: boolean }) => (
  <header className="flex justify-between items-center w-full px-6 py-4 bg-surface sticky top-0 z-40">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20">
        <img 
          src={avatar} 
          alt="Profile" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-on-surface font-headline">Lucid Flow</h1>
    </div>
    <div className={cn(
      "px-4 py-1.5 rounded-full font-label text-sm font-semibold shadow-sm",
      isManual 
        ? "bg-secondary-container text-on-secondary-container border border-secondary/30" 
        : "bg-surface-container-lowest text-primary"
    )}>
      Lvl {level} • {points.toLocaleString()} pts
    </div>
  </header>
);

// --- Screens ---

const Dashboard = ({ onSelectGame, showHero = true, stats }: { onSelectGame: (id: Screen) => void, showHero?: boolean, stats: UserStats }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="px-6 pb-32 pt-4 max-w-4xl mx-auto space-y-8"
  >
    {showHero && (
      <>
        <section className="mt-4 mb-10">
          <h2 className="font-headline text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
            Ready to find <br/><span className="text-primary italic">your flow?</span>
          </h2>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 bg-surface-container-lowest p-6 rounded-lg shadow-[0_4px_40px_rgba(45,47,51,0.06)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-container/30 rounded-full blur-2xl" />
            <div>
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">Streak</p>
              <p className="font-headline text-3xl font-bold">{stats.streak} Days</p>
            </div>
            <div className="mt-6 flex gap-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    i <= stats.streak % 5 || (stats.streak > 0 && i <= 5 && stats.streak % 5 === 0) ? "bg-secondary" : "bg-surface-container-highest"
                  )} 
                />
              ))}
            </div>
            <p className="mt-4 font-body text-sm text-on-surface-variant">
              {stats.streak % 5 === 0 && stats.streak > 0 ? "You're at your peak!" : `${5 - (stats.streak % 5)} more days to your peak!`}
            </p>
          </div>

          <div className="md:col-span-2 bg-primary p-6 rounded-lg shadow-[0_4px_40px_rgba(0,88,187,0.1)] text-on-primary relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-50" />
            <div className="relative z-10 w-full md:w-2/3">
              <p className="font-label text-xs uppercase tracking-widest opacity-80 mb-1">Today's Focus</p>
              <h3 className="font-headline text-2xl font-bold mb-2">Master {Object.entries(stats.cognitiveProfile).sort((a, b) => a[1] - b[1])[0][0].charAt(0).toUpperCase() + Object.entries(stats.cognitiveProfile).sort((a, b) => a[1] - b[1])[0][0].slice(1)}</h3>
              <p className="font-body text-sm opacity-90 leading-relaxed">Complete training sessions today to increase your neural {Object.entries(stats.cognitiveProfile).sort((a, b) => a[1] - b[1])[0][0]} speed.</p>
            </div>
            <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
              <div className="w-full h-full rounded-full border-[6px] border-surface-container-highest/20 flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    className="text-secondary" 
                    cx="50%" cy="50%" fill="transparent" r="45%" 
                    stroke="currentColor" strokeWidth="6"
                    strokeDasharray="282" strokeDashoffset={282 - (282 * stats.todayFocusProgress / 100)}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <span className="font-label text-xl font-bold">{Math.round(stats.todayFocusProgress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </>
    )}

    <section className="space-y-6">
      <div className="flex justify-between items-end">
        <h2 className="font-headline text-2xl font-bold">Active Training</h2>
        <button className="font-label text-sm font-semibold text-primary">View All</button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {GAMES.map((game) => {
          const playedSeconds = stats.gameStats?.[game.id]?.timePlayed || 0;
          const playedMins = Math.floor(playedSeconds / 60);
          
          return (
            <div 
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="group bg-surface-container-lowest p-6 rounded-lg flex items-center gap-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            >
              <div className={cn("w-20 h-20 rounded-lg flex items-center justify-center transition-colors", game.color)}>
                {game.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-headline text-xl font-bold">{game.title}</h4>
                <p className="font-body text-on-surface-variant text-sm mt-1">{game.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-label font-bold uppercase tracking-wider">
                    {game.tag}
                  </span>
                  <span className="text-xs font-label text-on-surface-variant">Played: {playedMins}m</span>
                </div>
              </div>
              <button className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <Play className="w-6 h-6 fill-current" />
              </button>
            </div>
          );
        })}
      </div>
    </section>

    <section className="mt-8 bg-surface-container-high/50 p-8 rounded-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="font-headline text-xl font-bold">Weekly Performance</h3>
          <p className="font-body text-on-surface-variant mt-2 max-w-md">
            You've reached your training goals in {Math.min(7, stats.streak || 1)} of the last 7 days. 
            Your {Object.entries(stats.cognitiveProfile).sort((a, b) => b[1] - a[1])[0][0]} score is trending upwards.
          </p>
          <div className="flex gap-1.5 mt-4 max-w-[200px]">
            {Array.from({ length: 7 }).map((_, i) => {
              const activeDays = stats.streak % 7 === 0 && stats.streak > 0 ? 7 : stats.streak % 7;
              const completed = i < activeDays;
              return (
                <div key={i} className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                  completed ? "bg-primary" : "bg-primary/10"
                )} />
              );
            })}
          </div>
        </div>
        <button 
          onClick={() => onSelectGame('stats')}
          className="px-8 py-4 bg-surface-container-lowest text-primary font-label font-bold rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all"
        >
          Full Report
        </button>
      </div>
    </section>
  </motion.div>
);

const StroopGame = ({ 
  onBack, 
  onComplete, 
  level, 
  showTutorial, 
  onTutorialComplete 
}: { 
  onBack: () => void, 
  onComplete: (score: number, accuracy: number) => void, 
  level: number,
  showTutorial: boolean,
  onTutorialComplete: () => void
}) => {
  const colors = ['RED', 'GREEN', 'BLUE', 'YELLOW', 'PURPLE'];
  // Add more colors for higher levels
  if (level > 5) colors.push('ORANGE', 'PINK');
  if (level > 10) colors.push('CYAN', 'BROWN');

  const colorValues: Record<string, string> = {
    RED: 'text-red-600',
    GREEN: 'text-green-600',
    BLUE: 'text-blue-600',
    YELLOW: 'text-yellow-500',
    PURPLE: 'text-purple-600',
    ORANGE: 'text-orange-500',
    PINK: 'text-pink-500',
    CYAN: 'text-cyan-500',
    BROWN: 'text-amber-800'
  };

  const [tutorialActive, setTutorialActive] = useState(showTutorial);
  const [currentWord, setCurrentWord] = useState('BLUE');
  const [currentColor, setCurrentColor] = useState('RED');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Math.max(15, 30 - Math.floor(level / 2)));

  useEffect(() => {
    if (tutorialActive) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete(score, round > 0 ? (score / round) * 100 : 0);
      onBack();
    }
  }, [timeLeft, score, round, onComplete, onBack, tutorialActive]);

  const nextRound = (choice: string) => {
    if (choice === currentColor) setScore(s => s + 1);
    const nextWord = colors[Math.floor(Math.random() * colors.length)];
    const nextColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentWord(nextWord);
    setCurrentColor(nextColor);
    setRound(r => r + 1);
  };

  if (tutorialActive) {
    return (
      <TutorialOverlay 
        title="Stroop Test"
        steps={[
          { text: "The word says a color, but it might be printed in a different ink color.", icon: <Type className="w-10 h-10" /> },
          { text: "Ignore what the word says. Focus ONLY on the color of the ink.", icon: <Palette className="w-10 h-10" /> },
          { text: "Tap the button that matches the ink color as fast as you can!", icon: <Zap className="w-10 h-10" /> }
        ]}
        onClose={() => {
          setTutorialActive(false);
          onTutorialComplete();
        }}
      />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-grow flex flex-col px-6 py-8 max-w-2xl mx-auto w-full"
    >
      <button 
        onClick={onBack}
        className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center mb-6 hover:bg-primary hover:text-white transition-all active:scale-95"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <section className="flex flex-col gap-6 mb-12">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest">Exercise</span>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface">Stroop Effect</h1>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest">Accuracy</span>
            <span className="font-label text-2xl font-semibold text-primary">94%</span>
          </div>
        </div>
        <div className="relative h-4 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-tertiary w-[65%] rounded-full shadow-[0_0_12px_rgba(0,99,131,0.3)]" />
        </div>
        <div className="flex justify-between font-label text-[10px] text-on-surface-variant uppercase tracking-wider">
          <span>Round {round} / 20</span>
          <span>Streak: 8</span>
        </div>
      </section>

      <section className="flex-grow flex flex-col items-center justify-center relative min-h-[400px]">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-secondary-container opacity-20 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary-container opacity-10 blur-3xl rounded-full" />
        
        <div className="absolute top-0 flex items-center gap-2 px-6 py-3 bg-surface-container-lowest rounded-xl shadow-lg z-10">
          <Timer className="w-5 h-5 text-error" />
          <span className="font-label text-xl font-bold text-on-surface">0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
        </div>

        <div className="glass-card w-full aspect-square md:aspect-video rounded-lg shadow-[0_40px_80px_rgba(45,47,51,0.08)] flex items-center justify-center flex-col gap-4 border border-white/40">
          <p className="font-body text-on-surface-variant font-medium text-sm tracking-wide mb-2">Identify the color of the ink:</p>
          <span className={cn("font-headline text-7xl md:text-8xl font-black tracking-tighter transform scale-110 drop-shadow-sm", colorValues[currentColor as keyof typeof colorValues])}>
            {currentWord}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 mt-8 pb-24">
        {colors.map(c => (
          <button 
            key={c}
            onClick={() => nextRound(c)}
            className="group flex items-center justify-center py-6 bg-surface-container-lowest hover:bg-primary transition-all duration-300 rounded-xl shadow-sm active:scale-95 last:col-span-2 last:md:col-span-1"
          >
            <span className="font-label font-bold text-lg text-on-surface group-hover:text-white uppercase tracking-wider">{c}</span>
          </button>
        ))}
      </section>
    </motion.div>
  );
};

import confetti from 'canvas-confetti';

const getLevelTitle = (level: number) => {
  if (level >= 25) return "Infinite Mind";
  if (level >= 20) return "Ultimate Sage";
  if (level >= 15) return "Grandmaster of Focus";
  if (level >= 12) return "Elite Mind";
  if (level >= 10) return "Zen Strategist";
  if (level >= 8) return "Memory Wizard";
  if (level >= 6) return "Logic Master";
  if (level >= 4) return "Cognitive Explorer";
  if (level >= 3) return "Mental Athlete";
  if (level >= 2) return "Quick Learner";
  return "Novice Thinker";
};

const WORDS = [
  "MIND", "FLOW", "CORE", "ZAP", "BRAIN", "FOCUS", "LOGIC", "PUZZLE", 
  "MEMORY", "ACTIVE", "BRIGHT", "SMARTS", "THINKY", "LUMINA", "INSIGHT",
  "NEURON", "SYNAPSE", "COGNITIVE", "REACTION", "RETRIEVAL", "STRATEGY"
];

const WordGame = ({ 
  onBack, 
  onComplete, 
  level, 
  showTutorial, 
  onTutorialComplete 
}: { 
  onBack: () => void, 
  onComplete: (score: number, accuracy: number) => void, 
  level: number,
  showTutorial: boolean,
  onTutorialComplete: () => void
}) => {
  const [tutorialActive, setTutorialActive] = useState(showTutorial);
  const [targetWord, setTargetWord] = useState("");
  const [guess, setGuess] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [timeLeft, setTimeLeft] = useState(Math.max(30, 60 - (level - 1) * 2));
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const targetRef = React.useRef<HTMLDivElement>(null);

  const initGame = useCallback(() => {
    const filteredWords = WORDS.filter(w => {
      if (level < 3) return w.length <= 4;
      if (level < 6) return w.length <= 6;
      if (level < 10) return w.length <= 8;
      return w.length >= 8;
    });
    
    // Fallback to all words if filter is too restrictive
    const pool = filteredWords.length > 0 ? filteredWords : WORDS;
    const word = pool[Math.floor(Math.random() * pool.length)];
    
    setTargetWord(word);
    setAvailableLetters(word.split('').sort(() => Math.random() - 0.5));
    setGuess([]);
    setStatus('playing');
  }, [level]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (tutorialActive) return;
    if (timeLeft > 0 && status !== 'correct') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      onComplete(score, round > 0 ? (score / round) * 100 : 0);
      onBack();
    }
  }, [timeLeft, status, score, round, onComplete, onBack, tutorialActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLetterAction = (letter: string, index: number) => {
    if (status !== 'playing') return;
    setGuess([...guess, letter]);
    const newAvailable = [...availableLetters];
    newAvailable.splice(index, 1);
    setAvailableLetters(newAvailable);
  };

  const handleRemoveLetter = (index: number) => {
    if (status !== 'playing') return;
    const letter = guess[index];
    const newGuess = [...guess];
    newGuess.splice(index, 1);
    setGuess(newGuess);
    setAvailableLetters([...availableLetters, letter]);
  };

  const onDragEnd = (event: any, info: any, letter: string, index: number) => {
    if (status !== 'playing' || !targetRef.current) return;
    const targetRect = targetRef.current.getBoundingClientRect();
    const { x, y } = info.point;

    if (
      x >= targetRect.left &&
      x <= targetRect.right &&
      y >= targetRect.top &&
      y <= targetRect.bottom
    ) {
      handleLetterAction(letter, index);
    }
  };

  if (tutorialActive) {
    return (
      <TutorialOverlay 
        title="Word Unscramble"
        steps={[
          { text: "A scrambled word will appear. Your goal is to arrange the letters correctly.", icon: <Type className="w-10 h-10" /> },
          { text: "Drag and drop the letters into the target area or tap them to build the word.", icon: <Search className="w-10 h-10" /> },
          { text: "Solve as many words as you can before the timer runs out!", icon: <Zap className="w-10 h-10" /> }
        ]}
        onClose={() => {
          setTutorialActive(false);
          onTutorialComplete();
        }}
      />
    );
  }

  const handleSubmit = () => {
    const currentWord = guess.join('');
    setRound(r => r + 1);
    if (currentWord === targetWord) {
      setScore(s => s + 1);
      setStatus('correct');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0058bb', '#6c9fff', '#ffc794', '#5ccafc']
      });
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus('playing'), 2000);
    }
  };

  const handleReset = () => {
    initGame();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 mt-20 mb-28 px-6 max-w-2xl mx-auto w-full"
    >
      <button 
        onClick={onBack}
        className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center mb-6 hover:bg-primary hover:text-white transition-all active:scale-95"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="flex justify-between items-end mb-10">
        <div className="space-y-1">
          <p className="font-label text-on-surface-variant text-xs uppercase tracking-widest">Current Challenge</p>
          <h2 className="font-headline text-3xl font-extrabold text-primary">Word Unscramble</h2>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg shadow-sm border border-outline-variant/10">
          <Timer className="w-5 h-5 text-tertiary" />
          <span className="font-label text-lg font-bold tabular-nums">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="space-y-8">
        <div className="relative group" ref={targetRef}>
          <div className="absolute -top-3 left-6 px-2 bg-surface z-10">
            <span className="font-label text-[10px] text-primary font-bold uppercase tracking-tighter">Current Guess</span>
          </div>
          <div className={cn(
            "w-full h-24 bg-surface-container-high rounded-xl flex items-center justify-center gap-2 px-6 overflow-hidden border-2 border-dashed transition-all duration-300",
            status === 'correct' ? "border-green-500 bg-green-50" : 
            status === 'wrong' ? "border-red-500 bg-red-50 animate-shake" : "border-primary/20"
          )}>
            {guess.map((l, i) => (
              <motion.div 
                layoutId={`guess-${i}`}
                key={`guess-${i}`}
                onClick={() => handleRemoveLetter(i)}
                className={cn(
                  "w-12 h-14 rounded-md flex items-center justify-center text-2xl font-headline font-extrabold shadow-sm cursor-pointer transition-colors",
                  status === 'correct' ? "bg-green-500 text-white" : "bg-surface-container-lowest text-primary hover:bg-red-50"
                )}
              >
                {l}
              </motion.div>
            ))}
            {Array.from({ length: Math.max(0, targetWord.length - guess.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="w-12 h-14 border-2 border-dashed border-outline-variant rounded-md" />
            ))}
          </div>
        </div>

        {status === 'correct' ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 bg-primary text-on-primary rounded-xl text-center shadow-xl"
          >
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-white" />
            <h3 className="font-headline text-3xl font-bold mb-2">Excellent Work!</h3>
            <div className="flex items-center justify-center gap-2 mb-4 bg-white/20 py-2 px-4 rounded-full w-fit mx-auto">
              <Zap className="w-4 h-4" />
              <span className="font-label font-bold">Score: {score}</span>
            </div>
            <p className="font-body mb-6 opacity-90">You unscrambled the word "{targetWord}" perfectly.</p>
            <button 
              onClick={handleReset}
              className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all"
            >
              Next Word
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6 md:grid-cols-6">
              <AnimatePresence>
                {availableLetters.map((l, i) => (
                  <motion.div
                    key={`${l}-${i}`}
                    drag={status === 'playing'}
                    dragSnapToOrigin
                    onDragEnd={(e, info) => onDragEnd(e, info, l, i)}
                    onClick={() => handleLetterAction(l, i)}
                    whileDrag={{ scale: 1.1, zIndex: 50 }}
                    className="aspect-square bg-surface-container-lowest rounded-lg flex items-center justify-center text-3xl font-headline font-extrabold text-on-surface shadow-[0_8px_0_0_#dbdde3] active:translate-y-1 active:shadow-[0_4px_0_0_#dbdde3] transition-all cursor-grab active:cursor-grabbing hover:bg-white"
                  >
                    {l}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-6 pt-4">
              <div className="flex items-center justify-center gap-4">
                <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-container text-on-secondary-container font-label font-bold text-sm shadow-sm hover:scale-105 transition-transform">
                  <Lightbulb className="w-4 h-4 fill-current" />
                  Use Hint (-50 pts)
                </button>
                <button 
                  onClick={() => {
                    setAvailableLetters([...availableLetters].sort(() => Math.random() - 0.5));
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container-highest text-on-surface font-label font-bold text-sm shadow-sm hover:scale-105 transition-transform"
                >
                  <RefreshCw className="w-4 h-4" />
                  Shuffle
                </button>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={guess.length !== targetWord.length || targetWord.length === 0}
                className={cn(
                  "w-full py-5 rounded-xl font-headline text-xl font-extrabold shadow-xl transition-all",
                  guess.length === targetWord.length && targetWord.length > 0
                    ? "bg-gradient-to-br from-primary to-primary-container text-on-primary active:scale-95" 
                    : "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                )}
              >
                {status === 'wrong' ? 'TRY AGAIN' : 'SUBMIT WORD'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-12 p-6 rounded-lg bg-surface-container-low relative overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <span className="font-label text-sm font-bold text-tertiary">Level Progress</span>
          <span className="font-label text-sm font-bold text-on-surface">Level 12 of 20</span>
        </div>
        <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
          <div className="h-full bg-tertiary w-3/5 rounded-full" />
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Brain className="w-24 h-24 text-secondary" />
        </div>
      </div>
    </motion.div>
  );
};

const MemoryGame = ({ 
  onBack, 
  onComplete, 
  level, 
  showTutorial, 
  onTutorialComplete 
}: { 
  onBack: () => void, 
  onComplete: (score: number, accuracy: number) => void, 
  level: number,
  showTutorial: boolean,
  onTutorialComplete: () => void
}) => {
  const icons = [
    { icon: Brain, id: 'brain' },
    { icon: Zap, id: 'zap' },
    { icon: LayoutGrid, id: 'grid' },
    { icon: Type, id: 'type' },
    { icon: Calculator, id: 'calc' },
    { icon: Play, id: 'play' },
    { icon: Timer, id: 'timer' },
    { icon: Gamepad2, id: 'game' },
    { icon: Trophy, id: 'trophy' },
    { icon: Star, id: 'star' },
    { icon: Heart, id: 'heart' },
    { icon: Flame, id: 'flame' },
    { icon: Cloud, id: 'cloud' },
    { icon: Sun, id: 'sun' },
    { icon: Moon, id: 'moon' },
    { icon: Ghost, id: 'ghost' },
    { icon: Coffee, id: 'coffee' },
    { icon: Music, id: 'music' },
  ];

  const [tutorialActive, setTutorialActive] = useState(showTutorial);
  const [cards, setCards] = useState<{ id: string; icon: any; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [flips, setFlips] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Math.max(60, 180 - (level - 1) * 5));
  const [isWon, setIsWon] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const pairCount = level < 5 ? 8 : (level < 10 ? 12 : 18);
    const selectedIcons = icons.slice(0, pairCount);
    const shuffled = [...selectedIcons, ...selectedIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({ ...icon, isFlipped: false, isMatched: false, uniqueId: index }));
    setCards(shuffled as any);
  }, [level]);

  useEffect(() => {
    if (tutorialActive) return;
    if (timeLeft > 0 && !isWon) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 || isWon) {
      if (isWon) {
        // Give bonus for time left
        const finalScore = score + timeLeft;
        onComplete(finalScore, 100);
      } else {
        onComplete(score, 50);
      }
      if (timeLeft === 0) onBack();
    }
  }, [timeLeft, isWon, score, onComplete, onBack, tutorialActive]);

  if (tutorialActive) {
    return (
      <TutorialOverlay 
        title="Memory Match"
        steps={[
          { text: "A grid of face-down cards will appear. Each card has a matching pair.", icon: <LayoutGrid className="w-10 h-10" /> },
          { text: "Flip two cards at a time. If they match, they stay face-up.", icon: <RefreshCw className="w-10 h-10" /> },
          { text: "Remember the positions of the icons to find all pairs as quickly as possible!", icon: <BrainCircuit className="w-10 h-10" /> }
        ]}
        onClose={() => {
          setTutorialActive(false);
          onTutorialComplete();
        }}
      />
    );
  }

  const handleFlip = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setFlips(f => f + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].id === cards[second].id) {
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setScore(s => s + 10);
          if (matchedCards.every(c => c.isMatched)) setIsWon(true);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto px-6 pt-8 pb-32"
    >
      <button 
        onClick={onBack}
        className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center mb-6 hover:bg-primary hover:text-white transition-all active:scale-95"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="flex justify-between items-end mb-10">
        <div className="space-y-1">
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Active Task</p>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Memory Match</h2>
        </div>
        <div className="flex flex-col items-end">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label text-[10px] font-bold uppercase mb-2">
            <Zap className="w-3 h-3 fill-current" /> Neural Spark
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface-container-lowest p-5 rounded-lg flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <Timer className="w-4 h-4" />
            <span className="font-label text-xs font-medium uppercase tracking-wider">Time</span>
          </div>
          <div className="font-headline text-2xl font-bold text-primary">{formatTime(timeLeft)}</div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-lg flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <Zap className="w-4 h-4" />
            <span className="font-label text-xs font-medium uppercase tracking-wider">Score</span>
          </div>
          <div className="font-headline text-2xl font-bold text-primary">{score}</div>
        </div>
      </div>

      <div className="relative p-2 bg-surface-container-low rounded-xl">
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card, i) => (
            <div 
              key={i} 
              onClick={() => handleFlip(i)}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center transform transition-all duration-500 cursor-pointer preserve-3d",
                card.isFlipped || card.isMatched ? "rotate-y-180 bg-white shadow-sm" : "bg-primary-container/20 border-2 border-primary-container/30"
              )}
            >
              {(card.isFlipped || card.isMatched) ? (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                   <card.icon className="w-5 h-5 text-primary" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-primary/10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {isWon && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-8 p-6 bg-primary text-on-primary rounded-xl text-center"
        >
          <h3 className="font-headline text-2xl font-bold mb-2">Excellent Work!</h3>
          <p className="font-body mb-4">You matched all pairs with {flips} flips.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-primary font-bold rounded-lg"
          >
            Play Again
          </button>
        </motion.div>
      )}

      <div className="mt-10 p-6 bg-surface-container-high rounded-lg flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-headline text-sm font-bold text-on-surface">Pro Tip</p>
          <p className="text-sm text-on-surface-variant leading-relaxed">Focus on the corners first to build a spatial map of the grid. This reduces cognitive load during rapid-fire sequences.</p>
        </div>
      </div>
    </motion.div>
  );
};

const MathGame = ({ 
  onBack, 
  onComplete, 
  level, 
  showTutorial, 
  onTutorialComplete 
}: { 
  onBack: () => void, 
  onComplete: (score: number, accuracy: number) => void, 
  level: number,
  showTutorial: boolean,
  onTutorialComplete: () => void
}) => {
  const [tutorialActive, setTutorialActive] = useState(showTutorial);
  const [v1, setV1] = useState(0);
  const [v2, setV2] = useState(0);
  const [v3, setV3] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [timeLeft, setTimeLeft] = useState(Math.max(30, 60 - (level - 1) * 2));
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const initGame = useCallback(() => {
    const max = 5 + level * 2;
    const val1 = Math.floor(Math.random() * max) + 2;
    const val2 = Math.floor(Math.random() * max) + 2;
    const val3 = Math.floor(Math.random() * max) + 2;
    setV1(val1);
    setV2(val2);
    setV3(val3);
    setInput("");
    setStatus('playing');
  }, [level]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (tutorialActive) return;
    if (timeLeft > 0 && status !== 'correct') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      onComplete(score, round > 0 ? (score / round) * 100 : 0);
      onBack();
    }
  }, [timeLeft, status, score, round, onComplete, onBack, tutorialActive]);

  if (tutorialActive) {
    return (
      <TutorialOverlay 
        title="Equation Master"
        steps={[
          { text: "Mathematical equations will appear with symbols representing numbers.", icon: <Calculator className="w-10 h-10" /> },
          { text: "Solve the logic puzzles to find the value of the final equation.", icon: <BrainCircuit className="w-10 h-10" /> },
          { text: "Type the correct answer and press Enter to score points!", icon: <CheckCircle2 className="w-10 h-10" /> }
        ]}
        onClose={() => {
          setTutorialActive(false);
          onTutorialComplete();
        }}
      />
    );
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNumber = (num: number) => {
    if (status !== 'playing' || input.length >= 3) return;
    setInput(prev => prev + num);
  };

  const handleBackspace = () => {
    if (status !== 'playing') return;
    setInput(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    const answer = v1 + v2 + v3;
    setRound(r => r + 1);
    if (parseInt(input) === answer) {
      setScore(s => s + 1);
      setStatus('correct');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0058bb', '#6c9fff', '#ffc794', '#5ccafc']
      });
    } else {
      setStatus('wrong');
      setTimeout(() => {
        setStatus('playing');
        setInput("");
      }, 1500);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 pb-32 px-6 max-w-lg mx-auto min-h-screen"
    >
      <button 
        onClick={onBack}
        className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center mb-6 hover:bg-primary hover:text-white transition-all active:scale-95"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <header className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <span className="font-label text-on-surface-variant text-sm uppercase tracking-widest">Logic Lab • Puzzle 04</span>
          <div className="flex items-center gap-1">
            <Timer className="w-4 h-4 text-secondary" />
            <span className="font-label text-primary font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">Equation Master</h1>
        <p className="font-body text-on-surface-variant leading-relaxed">Decode the visual variables to solve the final value. Speed increases your focus bonus.</p>
      </header>

      <div className="space-y-4 mb-10">
        <div className="glass-card p-6 rounded-lg shadow-sm flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary fill-current" />
            <span className="font-headline text-2xl font-bold">+</span>
            <Brain className="w-8 h-8 text-primary fill-current" />
          </div>
          <span className="font-headline text-2xl font-bold text-outline">=</span>
          <span className="font-headline text-3xl font-extrabold text-primary">{v1 + v1}</span>
        </div>
        <div className="glass-card p-6 rounded-lg shadow-sm flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary fill-current" />
            <span className="font-headline text-2xl font-bold">+</span>
            <Zap className="w-8 h-8 text-tertiary fill-current" />
          </div>
          <span className="font-headline text-2xl font-bold text-outline">=</span>
          <span className="font-headline text-3xl font-extrabold text-primary">{v1 + v2}</span>
        </div>
        <div className="glass-card p-6 rounded-lg shadow-sm flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-tertiary fill-current" />
            <span className="font-headline text-2xl font-bold">+</span>
            <Rocket className="w-8 h-8 text-secondary fill-current" />
          </div>
          <span className="font-headline text-2xl font-bold text-outline">=</span>
          <span className="font-headline text-3xl font-extrabold text-primary">{v2 + v3}</span>
        </div>

        <div className={cn(
          "p-8 rounded-xl shadow-lg border transition-all duration-300 flex flex-col items-center gap-6",
          status === 'correct' ? "bg-green-50 border-green-200" : 
          status === 'wrong' ? "bg-red-50 border-red-200 animate-shake" : "bg-surface-container-lowest border-primary-container/10"
        )}>
          <div className="flex items-center gap-4">
            <Brain className="w-10 h-10 text-primary fill-current" />
            <span className="font-headline text-3xl font-bold text-on-surface">+</span>
            <Zap className="w-10 h-10 text-tertiary fill-current" />
            <span className="font-headline text-3xl font-bold text-on-surface">+</span>
            <Rocket className="w-10 h-10 text-secondary fill-current" />
            <span className="font-headline text-3xl font-bold text-on-surface">=</span>
            <div className="w-16 h-16 bg-surface-container-high rounded-lg flex items-center justify-center">
              {status === 'correct' ? (
                <span className="text-3xl font-extrabold text-green-600">{v1 + v2 + v3}</span>
              ) : (
                <span className="text-2xl font-bold text-outline">?</span>
              )}
            </div>
          </div>
          <div className={cn(
            "w-full h-16 rounded-xl flex items-center justify-center border-2 transition-colors",
            status === 'wrong' ? "border-red-500 bg-red-50" : "border-primary-container bg-surface-container-low"
          )}>
            <span className="text-3xl font-headline font-extrabold tracking-widest text-primary">
              {input || "_ _"}
            </span>
          </div>
        </div>
      </div>

      {status === 'correct' ? (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 bg-primary text-on-primary rounded-xl text-center shadow-xl"
        >
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-white" />
          <h3 className="font-headline text-3xl font-bold mb-2">Excellent Work!</h3>
          <div className="flex items-center justify-center gap-2 mb-4 bg-white/20 py-2 px-4 rounded-full w-fit mx-auto">
            <Zap className="w-4 h-4" />
            <span className="font-label font-bold">Score: {score}</span>
          </div>
          <button 
            onClick={initGame}
            className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all"
          >
            Next Puzzle
          </button>
        </motion.div>
      ) : (
        <>
          <section className="grid grid-cols-3 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button 
                key={n} 
                onClick={() => handleNumber(n)}
                className="h-16 bg-surface-container-lowest text-on-surface font-headline text-xl font-bold rounded-lg hover:bg-surface-container-highest active:scale-95 transition-all shadow-sm"
              >
                {n}
              </button>
            ))}
            <div className="h-16" />
            <button 
              onClick={() => handleNumber(0)}
              className="h-16 bg-surface-container-lowest text-on-surface font-headline text-xl font-bold rounded-lg hover:bg-surface-container-highest active:scale-95 transition-all shadow-sm"
            >
              0
            </button>
            <button 
              onClick={handleBackspace}
              className="h-16 bg-surface-container-highest text-on-surface flex items-center justify-center rounded-lg hover:bg-surface-dim active:scale-95 transition-all shadow-sm"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </section>

          <button 
            onClick={handleSubmit}
            disabled={!input}
            className={cn(
              "w-full py-5 rounded-xl font-headline text-lg font-bold shadow-lg transition-all",
              input 
                ? "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-primary/20 active:scale-[0.98]" 
                : "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
            )}
          >
            {status === 'wrong' ? 'TRY AGAIN' : 'SUBMIT ANSWER'}
          </button>
        </>
      )}
    </motion.div>
  );
};

const StatsScreen = ({ stats }: { stats: UserStats }) => {
  const profileStats = [
    { label: 'Focus', value: stats.cognitiveProfile.focus, color: 'bg-primary' },
    { label: 'Memory', value: stats.cognitiveProfile.memory, color: 'bg-tertiary' },
    { label: 'Logic', value: stats.cognitiveProfile.logic, color: 'bg-secondary' },
    { label: 'Language', value: stats.cognitiveProfile.linguistic, color: 'bg-primary-container' },
  ];

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-24 pb-32 px-6 max-w-lg mx-auto"
    >
      <header className="mb-10 text-center">
        <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-2">Neural Insights</h2>
        <p className="font-body text-on-surface-variant">Your cognitive performance over the last 7 days.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-primary/5">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Peak Focus</p>
          <p className="font-headline text-3xl font-bold text-primary">{Math.round(stats.peakFocus)}%</p>
          {stats.sessions > 0 && (
            <div className="mt-2 flex items-center gap-1 text-green-600 font-label text-[10px] font-bold">
              <Zap className="w-3 h-3 fill-current" /> +{Math.max(0, stats.level * 2 - 2)}% this week
            </div>
          )}
          {stats.sessions === 0 && (
            <div className="mt-2 flex items-center gap-1 text-on-surface-variant font-label text-[10px] font-bold">
              <Zap className="w-3 h-3" /> Ready to start!
            </div>
          )}
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-primary/5">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Total Training</p>
          <p className="font-headline text-3xl font-bold text-primary">{formatTime(stats.totalTrainingTime)}</p>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant font-label text-[10px] font-bold">
            <Timer className="w-3 h-3" /> {stats.sessions} sessions
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm space-y-8 mb-10">
        <h3 className="font-headline text-xl font-bold text-on-surface">Cognitive Profile</h3>
        <div className="space-y-6">
          {profileStats.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="font-label text-sm font-bold text-on-surface">{stat.label}</span>
                <span className="font-label text-xs font-bold text-primary">{Math.round(stat.value)}%</span>
              </div>
              <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn("h-full rounded-full", stat.color)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-headline text-lg font-bold mb-2">Weekly Goal</h3>
          <p className="text-sm text-on-surface-variant mb-4">You're {Math.max(0, 7 - (stats.sessions % 7))} sessions away from hitting your consistency target!</p>
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const completed = i < (stats.sessions % 7) || (stats.sessions > 0 && stats.sessions % 7 === 0);
              return (
                <div key={i} className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  completed ? "bg-primary text-white" : "bg-surface-container-highest text-on-surface-variant"
                )}>
                  {completed ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                </div>
              );
            })}
          </div>
        </div>
        <Brain className="absolute -right-6 -bottom-6 w-32 h-32 text-primary/5" />
      </div>
    </motion.div>
  );
};

const ProfileScreen = ({ avatar, setAvatar, userName, setUserName, stats, onUpdateStats }: { 
  avatar: string, 
  setAvatar: (s: string) => void,
  userName: string,
  setUserName: (s: string) => void,
  stats: UserStats,
  onUpdateStats: (s: Partial<UserStats>) => void
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggle = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setIsEditing(false);
    }
  };

  const adjustLevel = (delta: number) => {
    const newLevel = Math.max(1, stats.level + delta);
    const earnedLevel = Math.floor(stats.points / 1000) + 1;
    onUpdateStats({
      level: newLevel,
      isManualLevel: newLevel !== earnedLevel
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-24 pb-32 px-6 max-w-lg mx-auto"
    >
      <div className="flex flex-col items-center mb-10">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
            <img 
              className="w-full h-full object-cover" 
              src={avatar} 
              alt="User Avatar"
              referrerPolicy="no-referrer"
            />
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2 mb-1">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="font-headline text-2xl font-extrabold text-on-surface bg-surface-container-lowest border-2 border-primary rounded-lg px-3 py-1 focus:outline-none w-full max-w-[250px]"
              autoFocus
            />
            <button 
              onClick={handleSaveName}
              className="p-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-1 group cursor-pointer" onClick={() => setIsEditing(true)}>
            <h2 className="font-headline text-3xl font-extrabold text-on-surface">{userName}</h2>
            <Edit2 className="w-4 h-4 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
        
        <p className={cn(
          "font-label text-sm uppercase tracking-widest px-3 py-1 rounded-full",
          stats.isManualLevel ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant"
        )}>
          {getLevelTitle(stats.level)} • Level {stats.level} {stats.isManualLevel && "(Manual)"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm text-center">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Points</p>
          <p className="font-headline text-xl font-bold text-primary">{stats.points.toLocaleString()}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm text-center border-2 border-primary/10">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Streak</p>
          <p className="font-headline text-xl font-bold text-primary">{stats.streak}d</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm text-center">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Level</p>
          <p className="font-headline text-xl font-bold text-primary">{stats.level}</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm mb-10 border border-primary/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-lg font-bold">Difficulty Level</h3>
          <div className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
            stats.isManualLevel ? "bg-secondary-container text-on-secondary-container" : "bg-primary/10 text-primary"
          )}>
            {stats.isManualLevel ? "Custom" : "Earned"}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => adjustLevel(-1)}
            className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <span className="font-headline text-4xl font-black text-primary">{stats.level}</span>
            <p className="text-[10px] font-label text-on-surface-variant uppercase mt-1">Current Training Level</p>
          </div>
          <button 
            onClick={() => adjustLevel(1)}
            className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <p className="text-[10px] text-on-surface-variant mt-4 text-center italic">
          Higher levels increase speed, complexity, and mental load.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-headline text-xl font-bold text-on-surface px-2">Achievements</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
              <Zap className="w-5 h-5 text-on-secondary-container fill-current" />
            </div>
            <div>
              <p className="font-headline text-sm font-bold">Neural Spark</p>
              <p className="text-[10px] text-on-surface-variant">First session completed</p>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
              <Brain className="w-5 h-5 text-on-tertiary-container fill-current" />
            </div>
            <div>
              <p className="font-headline text-sm font-bold">Mindful Start</p>
              <p className="text-[10px] text-on-surface-variant">Welcome to the flow!</p>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-on-surface-variant italic mt-4">
          "The journey of a thousand miles begins with a single step. Keep going!"
        </p>
      </div>

      <div className="mt-10 space-y-2">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <button 
            onClick={() => toggle('notifications')}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-on-surface-variant" />
              <span className="font-headline text-sm font-bold">Notifications</span>
            </div>
            <ChevronRight className={cn("w-5 h-5 text-outline transition-transform", expanded === 'notifications' && "rotate-90")} />
          </button>
          <AnimatePresence>
            {expanded === 'notifications' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-4 space-y-3"
              >
                <div className="h-px bg-surface-container-high mx-2 mb-3" />
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-body text-on-surface-variant">Daily Reminders</span>
                  <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-body text-on-surface-variant">Achievement Alerts</span>
                  <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    const saved = localStorage.getItem('lucid_flow_screen');
    return (saved as Screen) || 'home';
  });
  const [avatar, setAvatar] = useState(() => {
    const saved = localStorage.getItem('lucid_flow_avatar');
    return saved || "https://lh3.googleusercontent.com/aida-public/AB6AXuBtF1PxZ7zywteZ4AANr8Aa3wox9fG_13SSUmt3bi0TnR-Nz1jkI-uZJ6hSQpyRJ1Ih40j8xaNe9wTES-7K9cSXhRSK1hulL8v-aydNguO8RI8qQ8xdxYa5apgwFPYTD2eaSmTYgbliDLUF2dwuR6hosI4w-fM46YHe6Gbqe4Z7X9wtl7ffAZlVG5zqBGR0_rLgnu0mFLkZEKy1zMg1hUd_PvWrcu3gmvs9Eq7OLz3uuGBjhAaWO7xJqi-bvb7FweD_aJC1-pUFNUw";
  });
  const [userName, setUserName] = useState(() => {
    const saved = localStorage.getItem('lucid_flow_username');
    return saved || "Alex Sterling";
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('lucid_flow_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_STATS,
        ...parsed,
        tutorialsSeen: { ...INITIAL_STATS.tutorialsSeen, ...parsed.tutorialsSeen },
        cognitiveProfile: { ...INITIAL_STATS.cognitiveProfile, ...parsed.cognitiveProfile },
        gameStats: { ...INITIAL_STATS.gameStats, ...parsed.gameStats }
      };
    }
    return INITIAL_STATS;
  });

  useEffect(() => {
    localStorage.setItem('lucid_flow_screen', screen);
  }, [screen]);

  useEffect(() => {
    localStorage.setItem('lucid_flow_avatar', avatar);
  }, [avatar]);

  useEffect(() => {
    localStorage.setItem('lucid_flow_username', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('lucid_flow_stats', JSON.stringify(stats));
  }, [stats]);

  const completeGame = useCallback((gameId: Screen, score: number, accuracy: number, duration: number) => {
    setStats(prev => {
      const today = new Date().toDateString();
      let newStreak = prev.streak;
      
      if (prev.lastSessionDate !== today) {
        const lastDate = prev.lastSessionDate ? new Date(prev.lastSessionDate) : null;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
          newStreak += 1;
        } else if (!lastDate || lastDate.toDateString() !== today) {
          newStreak = 1;
        }
      }

      const pointsEarned = Math.floor(score * (accuracy / 100) * 10);
      const newPoints = prev.points + pointsEarned;
      const earnedLevel = Math.floor(newPoints / 1000) + 1;
      
      let finalLevel = prev.level;
      let finalIsManual = prev.isManualLevel;

      if (!prev.isManualLevel) {
        finalLevel = earnedLevel;
      } else if (earnedLevel > prev.level) {
        // They earned a higher level than their manual setting
        finalLevel = earnedLevel;
        finalIsManual = false;
      }

      const newProfile = { ...prev.cognitiveProfile };
      if (gameId === 'stroop') newProfile.focus = Math.min(100, newProfile.focus + 0.5);
      if (gameId === 'memory') newProfile.memory = Math.min(100, newProfile.memory + 0.5);
      if (gameId === 'word') newProfile.linguistic = Math.min(100, newProfile.linguistic + 0.5);
      if (gameId === 'math') newProfile.logic = Math.min(100, newProfile.logic + 0.5);
      
      // Update game-specific stats
      const updatedGameStats = { ...prev.gameStats };
      if (!updatedGameStats[gameId]) {
        updatedGameStats[gameId] = { timePlayed: 0 };
      }
      updatedGameStats[gameId].timePlayed += duration;

      return {
        ...prev,
        points: newPoints,
        level: finalLevel,
        isManualLevel: finalIsManual,
        streak: newStreak,
        sessions: prev.sessions + 1,
        totalTrainingTime: prev.totalTrainingTime + duration,
        peakFocus: Math.max(prev.peakFocus, accuracy),
        todayFocusProgress: Math.min(100, prev.todayFocusProgress + 25),
        cognitiveProfile: newProfile,
        lastSessionDate: today,
        gameStats: updatedGameStats
      };
    });
  }, []);

  const markTutorialSeen = useCallback((gameId: string) => {
    setStats(prev => ({
      ...prev,
      tutorialsSeen: {
        ...prev.tutorialsSeen,
        [gameId]: true
      }
    }));
  }, []);

  const handleNavigate = (s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };

  const isGameActive = ['stroop', 'word', 'memory', 'math'].includes(screen);

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container">
      {!isGameActive && <Header avatar={avatar} level={stats.level} points={stats.points} isManual={stats.isManualLevel} />}
      
      <main className={cn("pb-32", isGameActive && "pb-0")}>
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard onSelectGame={handleNavigate} showHero={true} stats={stats} />
            </motion.div>
          )}
          {screen === 'games' && (
            <motion.div key="games" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard onSelectGame={handleNavigate} showHero={false} stats={stats} />
            </motion.div>
          )}
          {screen === 'stroop' && (
            <motion.div key="stroop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StroopGame 
                onBack={() => handleNavigate('home')} 
                onComplete={(score, acc) => completeGame('stroop', score, acc, 240)} 
                level={stats.level} 
                showTutorial={!(stats.tutorialsSeen?.stroop ?? true)}
                onTutorialComplete={() => markTutorialSeen('stroop')}
              />
            </motion.div>
          )}
          {screen === 'word' && (
            <motion.div key="word" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WordGame 
                onBack={() => handleNavigate('home')} 
                onComplete={(score, acc) => completeGame('word', score, acc, 300)} 
                level={stats.level} 
                showTutorial={!(stats.tutorialsSeen?.word ?? true)}
                onTutorialComplete={() => markTutorialSeen('word')}
              />
            </motion.div>
          )}
          {screen === 'memory' && (
            <motion.div key="memory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MemoryGame 
                onBack={() => handleNavigate('home')} 
                onComplete={(score, acc) => completeGame('memory', score, acc, 180)} 
                level={stats.level} 
                showTutorial={!(stats.tutorialsSeen?.memory ?? true)}
                onTutorialComplete={() => markTutorialSeen('memory')}
              />
            </motion.div>
          )}
          {screen === 'math' && (
            <motion.div key="math" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MathGame 
                onBack={() => handleNavigate('home')} 
                onComplete={(score, acc) => completeGame('math', score, acc, 360)} 
                level={stats.level} 
                showTutorial={!(stats.tutorialsSeen?.math ?? true)}
                onTutorialComplete={() => markTutorialSeen('math')}
              />
            </motion.div>
          )}
          
          {screen === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StatsScreen stats={stats} />
            </motion.div>
          )}
          
          {screen === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfileScreen 
                avatar={avatar} 
                setAvatar={setAvatar} 
                userName={userName}
                setUserName={setUserName}
                stats={stats}
                onUpdateStats={(s) => setStats(prev => ({ ...prev, ...s }))}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!isGameActive && (
        <BottomNav active={screen === 'home' || screen === 'games' || screen === 'stats' || screen === 'profile' ? screen : 'games'} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
