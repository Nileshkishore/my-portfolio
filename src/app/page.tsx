// src/app/page.tsx

'use client';

import React, { useEffect, useRef, useState } from 'react';
import About from '../components/About';       // <-- NEW IMPORT
import Projects from '../components/Projects'; 
import Contact from '../components/Contact';   
import { ThemeType, themes } from '../utils/themes';

// ─── Neural Network Visual ─────────────────────────────────────────────────
const NeuralNetworkVisual = () => {
  const layers = [[20, 50, 80], [15, 38, 62, 85], [25, 50, 75], [50]];
  const xPos   = [10, 36, 63, 90];
  
  return (
    <div className="relative w-full max-w-sm h-48 md:h-56 mx-auto my-6 card-animate" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_10px_rgba(var(--color-primary-500),0.3)]">
        {layers.map((layer, i) => {
          if (i === layers.length - 1) return null;
          const nextLayer = layers[i + 1];
          return layer.map((y1, j) => nextLayer.map((y2, k) => (
            <line 
              key={`line-${i}-${j}-${k}`} 
              x1={`${xPos[i]}%`} 
              y1={`${y1}%`} 
              x2={`${xPos[i+1]}%`} 
              y2={`${y2}%`} 
              stroke="var(--color-primary-600)" 
              strokeWidth="1.5" 
              className="opacity-40" 
            />
          )));
        })}
        {layers.map((layer, i) => layer.map((y, j) => (
          <circle 
            key={`node-${i}-${j}`} 
            cx={`${xPos[i]}%`} 
            cy={`${y}%`} 
            r={i === layers.length - 1 ? "7" : "5"} 
            fill={i === layers.length - 1 ? "var(--color-secondary-400)" : "var(--color-primary-400)"} 
            className="animate-pulse" 
            style={{ animationDelay: `${(i * 0.2) + (j * 0.1)}s` }} 
          />
        )))}
      </svg>
    </div>
  );
};

// ─── Game types ────────────────────────────────────────────────────────────
type GameStage = 'idle' | 'input' | 'conv' | 'pool' | 'flatten' | 'won';

// ─── Main Component ────────────────────────────────────────────────────────
export default function Portfolio() {
  const spotlightRef  = useRef<HTMLDivElement>(null);
  const [currentTheme, setCurrentTheme]       = useState<ThemeType>('fuchsia');
  const [mounted, setMounted]                 = useState(false);

  // Game state
  const [stage, setStage]               = useState<GameStage>('idle');
  const [inputNodes, setInputNodes]     = useState<Set<number>>(new Set());
  const [convTarget, setConvTarget]     = useState(-1);
  const [convScore, setConvScore]       = useState(0);
  const [poolNums, setPoolNums]         = useState<number[]>([0, 0, 0, 0]);
  const [poolScore, setPoolScore]       = useState(0);
  const [flattenNodes, setFlattenNodes] = useState<number[]>([]);
  const [flattenNext, setFlattenNext]   = useState(1);

  // Ensure component is mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mouse spotlight
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, ${themes[currentTheme].glow}, transparent 80%)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [currentTheme]);

  // Conv2D timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (stage === 'conv') {
      setConvTarget(Math.floor(Math.random() * 9));
      interval = setInterval(() => setConvTarget(Math.floor(Math.random() * 9)), 700);
    }
    return () => clearInterval(interval);
  }, [stage, convScore]);

  const generatePoolNumbers = () =>
    setPoolNums(Array.from({ length: 4 }, () => Math.floor(Math.random() * 90) + 10));

  const generateFlattenNodes = () => {
    const nodes = [1, 2, 3, 4];
    for (let i = nodes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
    }
    setFlattenNodes(nodes);
    setFlattenNext(1);
  };

  const handleInputClick = (index: number) => {
    const newSet = new Set(inputNodes);
    newSet.add(index);
    setInputNodes(newSet);
    if (newSet.size === 9) setTimeout(() => setStage('conv'), 400);
  };

  const handleConvClick = (index: number) => {
    if (index !== convTarget) return;
    const s = convScore + 1;
    setConvScore(s);
    if (s >= 5) { setStage('pool'); generatePoolNumbers(); }
    else setConvTarget(-1);
  };

  const handlePoolClick = (num: number) => {
    if (num === Math.max(...poolNums)) {
      const s = poolScore + 1;
      setPoolScore(s);
      if (s >= 3) { setStage('flatten'); generateFlattenNodes(); }
      else generatePoolNumbers();
    } else {
      setPoolScore(Math.max(0, poolScore - 1));
    }
  };

  const handleFlattenClick = (num: number) => {
    if (num !== flattenNext) { setFlattenNext(1); return; }
    const next = flattenNext + 1;
    setFlattenNext(next);
    if (next > 4) setStage('won');
  };

  const resetGame = () => {
    setInputNodes(new Set());
    setConvScore(0);
    setPoolScore(0);
    setFlattenNext(1);
    setStage('input');
  };

  if (!mounted) return null; // Hydration safety guard

  return (
    <main
      className={`min-h-screen text-slate-200 selection:bg-${currentTheme === 'white' ? 'slate' : currentTheme}-500/30 overflow-hidden relative transition-colors duration-500 ease-in-out`}
      style={{ backgroundColor: themes[currentTheme].bg }}
    >
      {/* ── Global styles & Dynamic Light Mode Overrides ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --color-primary-400: ${currentTheme === 'fuchsia' ? '#e879f9' : currentTheme === 'ocean' ? '#60a5fa' : currentTheme === 'forest' ? '#10b981' : currentTheme === 'sunset' ? '#f97316' : '#475569'};
          --color-primary-500: ${currentTheme === 'fuchsia' ? '#d946ef' : currentTheme === 'ocean' ? '#3b82f6' : currentTheme === 'forest' ? '#059669' : currentTheme === 'sunset' ? '#ea580c' : '#334155'};
          --color-primary-600: ${currentTheme === 'fuchsia' ? '#c026d3' : currentTheme === 'ocean' ? '#2563eb' : currentTheme === 'forest' ? '#047857' : currentTheme === 'sunset' ? '#c2410c' : '#1e293b'};
          --color-secondary-400: ${currentTheme === 'fuchsia' ? '#22d3ee' : currentTheme === 'ocean' ? '#22d3ee' : currentTheme === 'forest' ? '#14b8a6' : currentTheme === 'sunset' ? '#fbbf24' : '#52525b'};
          --color-secondary-600: ${currentTheme === 'fuchsia' ? '#06b6d4' : currentTheme === 'ocean' ? '#06b6d4' : currentTheme === 'forest' ? '#0d9488' : currentTheme === 'sunset' ? '#f59e0b' : '#3f3f46'};
          --color-accent-400: ${currentTheme === 'fuchsia' ? '#a78bfa' : currentTheme === 'ocean' ? '#2dd4bf' : currentTheme === 'forest' ? '#10b981' : currentTheme === 'sunset' ? '#fb7185' : '#4b5563'};
          --color-accent-600: ${currentTheme === 'fuchsia' ? '#7c3aed' : currentTheme === 'ocean' ? '#0d9488' : currentTheme === 'forest' ? '#059669' : currentTheme === 'sunset' ? '#e11d48' : '#374151'};
        }
        
        ${currentTheme === 'white' ? `
          /* Invert text colors for Light Mode */
          main { color: #0f172a !important; }
          .text-slate-200, .text-slate-300, .text-slate-400, .text-slate-500 { color: #475569 !important; }
          .text-white { color: #0f172a !important; }
          
          /* Invert backgrounds and borders */
          .bg-white\\/5 { background-color: rgba(0, 0, 0, 0.04) !important; }
          .bg-white\\/10 { background-color: rgba(0, 0, 0, 0.08) !important; }
          .border-white\\/5, .border-white\\/10, .border-white\\/20 { border-color: rgba(0, 0, 0, 0.1) !important; }
          
          /* Specific dark elements */
          .bg-\\[\\#0a0a1a\\] { background-color: #ffffff !important; box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; }
          .bg-\\[\\#0a0a1a\\]\\/50 { background-color: #f8fafc !important; }
          .bg-\\[\\#0a0a1a\\]\\/90 { background-color: rgba(255, 255, 255, 0.95) !important; }
          .ring-\\[\\#0a0a1a\\] { --tw-ring-color: #ffffff !important; }
          
          /* Form elements */
          select { background-color: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #0f172a !important; }
          
          /* Ambient blobs */
          .mix-blend-screen { mix-blend-mode: multiply !important; opacity: 0.3 !important; }
        ` : ''}

        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-50% - 12px)); } }
        .animate-marquee { display: flex; gap: 24px; width: max-content; animation: marquee 40s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .card-animate { opacity: 0; animation: fadeSlideUp 0.45s ease forwards; }
      `}} />

      {/* Mouse spotlight */}
      <div ref={spotlightRef} className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300" />

      {/* Ambient blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className={`absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-${currentTheme === 'white' ? 'slate' : currentTheme}-600/20 mix-blend-screen blur-[120px] rounded-full animate-pulse`} style={{ animationDuration: '7s' }} />
        <div className={`absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-${themes[currentTheme].secondary}-600/20 mix-blend-screen blur-[120px] rounded-full animate-pulse`} style={{ animationDuration: '9s', animationDelay: '1s' }} />
        <div className={`absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-${themes[currentTheme].accent}-600/20 mix-blend-screen blur-[120px] rounded-full animate-pulse`} style={{ animationDuration: '11s', animationDelay: '2s' }} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl" style={{ backgroundColor: `${themes[currentTheme].bg}80` }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <strong
            className="text-xl font-bold tracking-wider cursor-pointer not-italic transition-transform duration-200 hover:scale-105"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Nilesh Kishore — home"
          >
            Nilesh
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-400), var(--color-secondary-400))` }}>
              {' '}Kishore
            </span>
          </strong>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400" aria-label="Primary navigation">
            {['About', 'Projects', 'Stack', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={(e) => { e.preventDefault(); document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className="hover:text-white transition-colors relative group cursor-pointer"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-400), var(--color-secondary-400))` }} />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value as ThemeType)}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 backdrop-blur-md transition-colors cursor-pointer focus:outline-none appearance-none pr-8"
                aria-label="Choose colour theme"
              >
                <option value="fuchsia">⟡ Fuchsia</option>
                <option value="ocean">∿ Ocean</option>
                <option value="forest">↟ Forest</option>
                <option value="sunset">☼ Sunset</option>
                <option value="white">⚪ White</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <button
              className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none hover:scale-105 transition-transform duration-200 group"
              aria-label="Download resume"
            >
              <span 
                className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] transition-colors duration-500" 
                style={{ backgroundImage: 'conic-gradient(from 90deg at 50% 50%, var(--color-primary-400) 0%, var(--color-secondary-400) 50%, var(--color-primary-400) 100%)' }} 
              />
              <span 
                className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-6 py-1 text-sm font-medium backdrop-blur-3xl transition-colors group-hover:bg-opacity-80"
                style={{ 
                  backgroundColor: currentTheme === 'white' ? '#ffffff' : '#0a0a1a', 
                  color: currentTheme === 'white' ? '#0f172a' : '#ffffff' 
                }}
              >
                Resume
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center justify-center px-6 pt-20 z-10"
        aria-label="Introduction"
      >
        <h1 className="sr-only">
          Nilesh Kishore — MLOps Engineer, Machine Learning Engineer, and Data Engineer
          specialising in LLM pipelines, OCR systems, Databricks, Apache Spark, and
          cloud-native ML infrastructure on AWS and Azure.
        </h1>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium hover:bg-white/10 transition-colors cursor-default">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--color-primary-400)' }} />
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: 'var(--color-primary-500)' }} />
              </span>
              ML · MLOps · Data Engineering · LLM
            </div>

            {/* ── Mini game ── */}
            <div className="min-h-[320px] flex flex-col justify-center">
              {stage === 'idle' && (
                <div className="space-y-5 card-animate">
                  <p className="text-4xl md:text-5xl font-black text-slate-200" aria-hidden="true">System Standby</p>
                  <p className="text-slate-400 text-lg">Initialize and train the neural network to proceed.</p>
                  <button onClick={resetGame} className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors font-medium text-white flex items-center gap-3 w-max cursor-pointer">
                    <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary-400)' }} />
                    Start Training Pipeline
                  </button>
                </div>
              )}

              {stage === 'input' && (
                <div className="space-y-6 card-animate">
                  <div>
                    <p className="text-xl font-bold mb-1">Layer 1: Input Data</p>
                    <p className="text-sm text-slate-400 font-mono">Task: Activate all nodes to load the matrix.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm w-fit mx-auto lg:mx-0">
                    {[0,1,2,3,4,5,6,7,8].map((i) => (
                      <button key={i} onClick={() => handleInputClick(i)}
                        className={`w-16 h-16 rounded-xl border transition-all duration-300 cursor-pointer ${inputNodes.has(i) ? 'scale-95 shadow-inner' : 'hover:scale-105 hover:bg-white/10'}`}
                        style={inputNodes.has(i) ? { backgroundColor: 'var(--color-primary-500)', borderColor: 'var(--color-primary-400)', boxShadow: `0 0 15px ${themes[currentTheme].glow}` } : { backgroundColor: currentTheme === 'white' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', borderColor: currentTheme === 'white' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}
                        aria-label={`Node ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {stage === 'conv' && (
                <div className="space-y-6 card-animate">
                  <div>
                    <p className="text-xl font-bold mb-1">Layer 2: Conv2D Features</p>
                    <p className="text-sm text-slate-400 font-mono">Task: Extract features by catching the kernel. ({convScore}/5)</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm w-fit mx-auto lg:mx-0">
                    {[0,1,2,3,4,5,6,7,8].map((i) => (
                      <button key={i} onClick={() => handleConvClick(i)}
                        className={`w-16 h-16 rounded-xl border transition-all duration-200 ${i === convTarget ? 'scale-110 shadow-lg cursor-pointer' : 'scale-100 bg-white/5 border-white/10 cursor-default'}`}
                        style={i === convTarget ? { backgroundColor: 'var(--color-secondary-600)', borderColor: 'var(--color-secondary-400)', boxShadow: `0 0 20px ${themes[currentTheme].glow}` } : {}}
                        aria-label={i === convTarget ? 'Active kernel — click!' : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {stage === 'pool' && (
                <div className="space-y-6 card-animate">
                  <div>
                    <p className="text-xl font-bold mb-1">Layer 3: MaxPooling2D</p>
                    <p className="text-sm text-slate-400 font-mono">Task: Reduce dimensions by clicking the MAX value. ({poolScore}/3)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm w-fit mx-auto lg:mx-0">
                    {poolNums.map((num, i) => (
                      <button key={i} onClick={() => handlePoolClick(num)}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center justify-center text-2xl font-bold font-mono cursor-pointer hover:scale-105 active:scale-95"
                        aria-label={`Value ${num}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {stage === 'flatten' && (
                <div className="space-y-6 card-animate">
                  <div>
                    <p className="text-xl font-bold mb-1">Layer 4: Flattening Vector</p>
                    <p className="text-sm text-slate-400 font-mono">Task: Click the nodes in sequential order (1 to 4).</p>
                  </div>
                  <div className="flex gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm w-fit mx-auto lg:mx-0">
                    {flattenNodes.map((num, i) => {
                      const done = num < flattenNext;
                      return (
                        <button key={i} onClick={() => handleFlattenClick(num)} disabled={done}
                          className={`w-14 h-24 md:w-16 md:h-32 rounded-xl border transition-all duration-300 flex items-center justify-center text-xl font-bold font-mono ${done ? 'opacity-50 scale-95' : 'cursor-pointer hover:scale-105 hover:-translate-y-2'}`}
                          style={done ? { backgroundColor: 'var(--color-primary-600)', borderColor: 'var(--color-primary-400)' } : { backgroundColor: currentTheme === 'white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', borderColor: currentTheme === 'white' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' }}
                          aria-label={`Node ${num}${done ? ' (activated)' : ''}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {stage === 'won' && (
                <div className="card-animate space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                    ✓ Pipeline Deployed Successfully
                  </div>
                  <NeuralNetworkVisual />
                  <p className="text-5xl md:text-7xl font-black leading-tight tracking-tight" aria-hidden="true">
                    Architecting
                    <span className="block text-transparent bg-clip-text pb-2" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-400), var(--color-accent-400), var(--color-secondary-400))` }}>
                      Intelligent
                    </span>
                    ML Systems
                  </p>
                </div>
              )}
            </div>

            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              Transforming complex data into scalable AI solutions. Specialising in
              <strong className="text-slate-300 font-medium"> OCR pipelines</strong>,
              <strong className="text-slate-300 font-medium"> LLM integration</strong>,
              <strong className="text-slate-300 font-medium"> MLOps automation</strong>,
              and cloud-native ML infrastructure on AWS and Azure.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a href="#projects" onClick={(e) => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="group relative px-8 py-3 bg-white text-black font-bold rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105 duration-200 shadow-lg">
                <div className="absolute inset-0 w-0 transition-all duration-300 ease-out group-hover:w-full" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-400), var(--color-secondary-400))` }} />
                <span className="relative group-hover:text-white transition-colors duration-200" style={{ color: currentTheme === 'white' ? '#808080' : '#000000' }}>Explore Projects</span>
              </a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="px-8 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-200 font-medium cursor-pointer hover:scale-105 text-white">
                Contact Me
              </a>
            </div>
          </div>

          {/* Terminal */}
          <div className="relative w-full max-w-lg mx-auto lg:ml-auto group hidden md:block" aria-label="Code sample: Databricks MLflow pipeline" role="img">
            <div className="absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-300" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-600), var(--color-secondary-600))` }} />
            <div className="relative rounded-xl border border-white/10 bg-[#0a0a1a]/90 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col h-[400px]">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5 shrink-0">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs text-slate-500 font-mono">databricks_uc_pipeline.py</span>
              </div>
              <div className="p-6 font-mono text-sm text-slate-300 space-y-2 overflow-y-auto overflow-x-auto custom-scrollbar flex-grow">
                <p><span style={{ color: 'var(--color-primary-400)' }}>import</span> mlflow</p>
                <p><span style={{ color: 'var(--color-primary-400)' }}>from</span> pyspark.ml <span style={{ color: 'var(--color-primary-400)' }}>import</span> Pipeline</p>
                <br />
                <p className="text-slate-500"># 1. Configure Unity Catalog MLflow Registry</p>
                <p>mlflow.set_registry_uri(<span className="text-amber-500">"databricks-uc"</span>)</p>
                <p>UC_MODEL = <span className="text-amber-500">"prod_catalog.finance.fraud_model"</span></p>
                <br />
                <p><span style={{ color: 'var(--color-primary-400)' }}>def</span> <span className="text-emerald-500">train_and_log_model</span>():</p>
                <div className="pl-4 border-l border-white/10 ml-2">
                  <p><span style={{ color: 'var(--color-primary-400)' }}>with</span> mlflow.start_run():</p>
                  <div className="pl-4 border-l border-white/10 ml-2">
                    <p className="text-slate-500"># 2. Read ADLS data via Unity Catalog</p>
                    <p>df = spark.read.table(<span className="text-amber-500">"prod_catalog.finance.raw_tx"</span>)</p>
                    <br />
                    <p className="text-slate-500"># 3. Preprocess & Train</p>
                    <p>pipeline = build_preprocessing_pipeline()</p>
                    <p>model = pipeline.fit(df)</p>
                    <br />
                    <p className="text-slate-500"># 4. Log to Unity Catalog</p>
                    <p>mlflow.spark.log_model(</p>
                    <p className="pl-4">spark_model=model,</p>
                    <p className="pl-4">artifact_path=<span className="text-amber-500">"model_artifacts"</span>,</p>
                    <p className="pl-4">registered_model_name=UC_MODEL</p>
                    <p>)</p>
                  </div>
                </div>
                <br />
                <p><span style={{ color: 'var(--color-primary-400)' }}>def</span> <span className="text-emerald-500">batch_inference</span>():</p>
                <div className="pl-4 border-l border-white/10 ml-2">
                  <div className="border-l-2 py-2 px-3 rounded-r my-2 mb-3" style={{ borderColor: 'var(--color-primary-500)', backgroundColor: themes[currentTheme].glow }}>
                    <p className="text-slate-400"># 5. Load Champion model alias</p>
                    <p>champion_uri = <span className="text-amber-500">f"models:/&#123;UC_MODEL&#125;@champion"</span></p>
                    <p>champion_model = mlflow.spark.load_model(champion_uri)</p>
                  </div>
                  <p className="text-slate-500"># 6. Fetch new batch & Infer</p>
                  <p>new_data = spark.read.table(<span className="text-amber-500">"prod_catalog.finance.incoming_tx"</span>)</p>
                  <p>preds = champion_model.transform(new_data)</p>
                  <br />
                  <p className="text-slate-500"># 7. Write back to Unity Catalog</p>
                  <p>preds.write.mode(<span className="text-amber-500">"append"</span>).saveAsTable(<span className="text-amber-500">"prod_catalog.finance.predictions"</span>)</p>
                </div>
                <br />
                <p className="flex items-center gap-2 pt-2 pb-4">
                  <span className="text-green-500">➜</span>
                  <span style={{ color: 'var(--color-secondary-400)' }}>~</span>
                  <span className="w-2 h-4 animate-pulse" style={{ backgroundColor: 'var(--color-primary-400)' }} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ABOUT (Imported Component)
      ══════════════════════════════════════════════════════════ */}
      <About currentTheme={currentTheme} />

      {/* ══════════════════════════════════════════════════════════
          PROJECTS (Imported Component)
      ══════════════════════════════════════════════════════════ */}
      <Projects currentTheme={currentTheme} themes={themes} />

      {/* ══════════════════════════════════════════════════════════
          TECH STACK
      ══════════════════════════════════════════════════════════ */}
      <section id="stack" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/5 scroll-mt-20" aria-labelledby="stack-heading">
        <div className="text-center mb-16">
          <h2 id="stack-heading" className="text-3xl md:text-4xl font-bold mb-4">Tech Stack</h2>
          <p className="text-slate-400">
            Tools and frameworks I use to build production-grade ML, MLOps, LLM, and data engineering systems.
          </p>
        </div>
        <ul className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto list-none p-0" aria-label="Technology skills">
          {["Python", "PyTorch", "TensorFlow", "MLflow", "Databricks", "Apache Spark", "PySpark", "LangChain", "Docker", "Kubernetes", "AWS", "Azure ML", "FastAPI", "PostgreSQL", "Delta Lake", "Kafka"].map((tool) => (
            <li key={tool}
              className="px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-slate-300 font-medium transition-all duration-200 cursor-default hover:scale-105"
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = themes[currentTheme].glow; el.style.color = 'var(--color-secondary-400)'; el.style.boxShadow = `0 0 15px ${themes[currentTheme].glow}`; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = currentTheme === 'white' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'; el.style.color = currentTheme === 'white' ? '#475569' : '#cbd5e1'; el.style.boxShadow = 'none'; }}
            >
              {tool}
            </li>
          ))}
        </ul>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CONTACT (Imported Component)
      ══════════════════════════════════════════════════════════ */}
      <Contact currentTheme={currentTheme} />

      {/* Footer */}
      <footer className="border-t border-white/5 relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Nilesh Kishore · MLOps Engineer · Data Engineer · Built with Next.js & Tailwind CSS.</p>
        </div>
      </footer>
    </main>
  );
}