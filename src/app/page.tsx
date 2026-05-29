'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Theme configuration
type ThemeType = 'fuchsia' | 'ocean' | 'forest' | 'sunset';

const themes: Record<ThemeType, { primary: string; secondary: string; accent: string; glow: string; bg: string; bgGradient: string }> = {
  fuchsia: { primary: 'fuchsia', secondary: 'cyan', accent: 'violet', glow: 'rgba(139, 92, 246, 0.12)', bg: '#030014', bgGradient: 'fuchsia-600 cyan-600 violet-600' },
  ocean: { primary: 'blue', secondary: 'cyan', accent: 'teal', glow: 'rgba(30, 144, 255, 0.12)', bg: '#0a0e27', bgGradient: 'blue-600 cyan-600 teal-600' },
  forest: { primary: 'emerald', secondary: 'teal', accent: 'green', glow: 'rgba(16, 185, 129, 0.12)', bg: '#050f0a', bgGradient: 'emerald-600 teal-600 green-600' },
  sunset: { primary: 'orange', secondary: 'amber', accent: 'rose', glow: 'rgba(249, 115, 22, 0.12)', bg: '#1a0f05', bgGradient: 'orange-600 amber-600 rose-600' }
};

const getDuration = (startStr: string, endStr: string): string => {
  const start = new Date(`${startStr} 1`);
  const end = endStr === 'Present' ? new Date() : new Date(`${endStr} 1`);
  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  const yrs = Math.floor(totalMonths / 12);
  const mos = totalMonths % 12;
  let result = '';
  if (yrs > 0) result += `${yrs} yr${yrs > 1 ? 's' : ''} `;
  if (mos > 0) result += `${mos} mo${mos > 1 ? 's' : ''}`;
  return result.trim() || '0 mos';
};

// SVG Neural Network Reward Component
const NeuralNetworkVisual = () => {
  const layers = [[20, 50, 80], [15, 38, 62, 85], [25, 50, 75], [50]];
  const xPos = [10, 36, 63, 90]; 

  return (
    <div className="relative w-full max-w-sm h-48 md:h-56 mx-auto my-6 card-animate">
      <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_10px_rgba(var(--color-primary-500),0.3)]">
        {layers.map((layer, i) => {
          if (i === layers.length - 1) return null;
          const nextLayer = layers[i + 1];
          return layer.map((y1, j) => (
            nextLayer.map((y2, k) => (
              <line key={`line-${i}-${j}-${k}`} x1={`${xPos[i]}%`} y1={`${y1}%`} x2={`${xPos[i + 1]}%`} y2={`${y2}%`} stroke="var(--color-primary-600)" strokeWidth="1.5" className="opacity-40" />
            ))
          ));
        })}
        {layers.map((layer, i) => (
          layer.map((y, j) => (
            <circle key={`node-${i}-${j}`} cx={`${xPos[i]}%`} cy={`${y}%`} r={i === layers.length - 1 ? "7" : "5"} fill={i === layers.length - 1 ? "var(--color-secondary-400)" : "var(--color-primary-400)"} className="animate-pulse" style={{ animationDelay: `${(i * 0.2) + (j * 0.1)}s` }} />
          ))
        ))}
      </svg>
    </div>
  );
};

// Game Types
type GameStage = 'idle' | 'input' | 'conv' | 'pool' | 'flatten' | 'won';

export default function Portfolio() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('fuchsia');
  
  // --- Game State ---
  const [stage, setStage] = useState<GameStage>('idle');
  
  // Stage 1: Input (Turn on all nodes)
  const [inputNodes, setInputNodes] = useState<Set<number>>(new Set());
  
  // Stage 2: Conv (Catch the kernel)
  const [convTarget, setConvTarget] = useState(-1);
  const [convScore, setConvScore] = useState(0);
  
  // Stage 3: Pool (Find the max number)
  const [poolNums, setPoolNums] = useState<number[]>([0, 0, 0, 0]);
  const [poolScore, setPoolScore] = useState(0);
  
  // Stage 4: Flatten (Click in order 1-4)
  const [flattenNodes, setFlattenNodes] = useState<number[]>([]);
  const [flattenNext, setFlattenNext] = useState(1);

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

  useEffect(() => {
    if (showAllProjects && gridRef.current) {
      setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }, [showAllProjects]);

  // --- Game Logic Controllers ---

  // Conv2D Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (stage === 'conv') {
      setConvTarget(Math.floor(Math.random() * 9));
      interval = setInterval(() => {
        setConvTarget(Math.floor(Math.random() * 9));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [stage, convScore]);

  // Generate numbers for Max Pooling
  const generatePoolNumbers = () => {
    const nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * 90) + 10); // 10 to 99
    setPoolNums(nums);
  };

  // Generate scrambled numbers for Flattening
  const generateFlattenNodes = () => {
    const nodes = [1, 2, 3, 4];
    // Fisher-Yates shuffle
    for (let i = nodes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
    }
    setFlattenNodes(nodes);
    setFlattenNext(1);
  };

  // --- Interaction Handlers ---

  const handleInputClick = (index: number) => {
    const newSet = new Set(inputNodes);
    newSet.add(index);
    setInputNodes(newSet);
    if (newSet.size === 9) {
      setTimeout(() => setStage('conv'), 400);
    }
  };

  const handleConvClick = (index: number) => {
    if (index === convTarget) {
      const newScore = convScore + 1;
      setConvScore(newScore);
      if (newScore >= 5) {
        setStage('pool');
        generatePoolNumbers();
      } else {
        setConvTarget(-1); // Briefly hide before next tick
      }
    }
  };

  const handlePoolClick = (num: number) => {
    const max = Math.max(...poolNums);
    if (num === max) {
      const newScore = poolScore + 1;
      setPoolScore(newScore);
      if (newScore >= 3) {
        setStage('flatten');
        generateFlattenNodes();
      } else {
        generatePoolNumbers();
      }
    } else {
      // Penalty for wrong click
      setPoolScore(Math.max(0, poolScore - 1)); 
    }
  };

  const handleFlattenClick = (num: number) => {
    if (num === flattenNext) {
      const next = flattenNext + 1;
      setFlattenNext(next);
      if (next > 4) {
        setStage('won');
      }
    } else {
      // Penalty: Reset flattening sequence
      setFlattenNext(1);
    }
  };

  const resetGame = () => {
    setInputNodes(new Set());
    setConvScore(0);
    setPoolScore(0);
    setFlattenNext(1);
    setStage('input');
  };

  const handleToggle = useCallback(() => setShowAllProjects(prev => !prev), []);

  const projects = [
    { title: "AI OCR Pipeline", category: "Computer Vision", description: "YOLO + TrOCR based OCR pipeline with scalable ML inference architecture.", color: "from-fuchsia-500 to-purple-600" },
    { title: "MLOps Deployment System", category: "Infrastructure", description: "Enterprise MLflow + Azure ML deployment workflows with CI/CD automation.", color: "from-cyan-500 to-blue-600" },
    { title: "Databricks ETL Platform", category: "Data Engineering", description: "High-performance distributed ETL orchestration and monitoring pipelines.", color: "from-emerald-500 to-teal-600" },
    { title: "Fraud Detection Engine", category: "Machine Learning", description: "Real-time anomaly detection using PySpark and XGBoost for transaction monitoring.", color: "from-rose-500 to-red-600" },
    { title: "NLP Doc Classifier", category: "NLP", description: "Transformer-based document classification and named entity recognition API.", color: "from-violet-500 to-purple-600" },
    { title: "Streaming Analytics", category: "Data Engineering", description: "Kafka and Spark Structured Streaming pipeline for high-throughput log analytics.", color: "from-amber-500 to-orange-600" },
    { title: "Predictive Maintenance", category: "Backend / ML", description: "FastAPI serving layer for IoT sensor predictive maintenance models.", color: "from-blue-500 to-indigo-600" }
  ];

  return (
    <main className={`min-h-screen text-slate-200 selection:bg-${currentTheme}-500/30 overflow-hidden relative`} style={{ backgroundColor: themes[currentTheme].bg }}>
      {/* GLOBAL CUSTOM STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --color-primary-400: ${currentTheme === 'fuchsia' ? '#e879f9' : currentTheme === 'ocean' ? '#60a5fa' : currentTheme === 'forest' ? '#10b981' : '#f97316'};
          --color-primary-500: ${currentTheme === 'fuchsia' ? '#d946ef' : currentTheme === 'ocean' ? '#3b82f6' : currentTheme === 'forest' ? '#059669' : '#ea580c'};
          --color-primary-600: ${currentTheme === 'fuchsia' ? '#c026d3' : currentTheme === 'ocean' ? '#2563eb' : currentTheme === 'forest' ? '#047857' : '#c2410c'};
          --color-secondary-400: ${currentTheme === 'fuchsia' ? '#22d3ee' : currentTheme === 'ocean' ? '#22d3ee' : currentTheme === 'forest' ? '#14b8a6' : '#fbbf24'};
          --color-secondary-600: ${currentTheme === 'fuchsia' ? '#06b6d4' : currentTheme === 'ocean' ? '#06b6d4' : currentTheme === 'forest' ? '#0d9488' : '#f59e0b'};
          --color-accent-400: ${currentTheme === 'fuchsia' ? '#a78bfa' : currentTheme === 'ocean' ? '#2dd4bf' : currentTheme === 'forest' ? '#10b981' : '#fb7185'};
          --color-accent-600: ${currentTheme === 'fuchsia' ? '#7c3aed' : currentTheme === 'ocean' ? '#0d9488' : currentTheme === 'forest' ? '#059669' : '#e11d48'};
        }
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

      {/* MOUSE SPOTLIGHT */}
      <div ref={spotlightRef} className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300" />

      {/* ANIMATED BACKGROUND (Condensed for readability) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className={`absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-${currentTheme}-600/20 mix-blend-screen blur-[120px] rounded-full animate-pulse`} style={{ animationDuration: '7s' }} />
         <div className={`absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-${themes[currentTheme].secondary}-600/20 mix-blend-screen blur-[120px] rounded-full animate-pulse`} style={{ animationDuration: '9s', animationDelay: '1s' }} />
         <div className={`absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-${themes[currentTheme].accent}-600/20 mix-blend-screen blur-[120px] rounded-full animate-pulse`} style={{ animationDuration: '11s', animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl" style={{ backgroundColor: `${themes[currentTheme].bg}/50` }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wider group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Nilesh<span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-400), var(--color-secondary-400))` }}> Kishore</span>
          </h1>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            {['About', 'Projects', 'Stack', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={(e) => { e.preventDefault(); document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="hover:text-white transition-colors relative group cursor-pointer">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] transition-all duration-200 group-hover:w-full" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-400), var(--color-secondary-400))` }} />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <select value={currentTheme} onChange={(e) => setCurrentTheme(e.target.value as ThemeType)} className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 backdrop-blur-md transition-colors cursor-pointer focus:outline-none">
              <option value="fuchsia">🌌 Fuchsia</option>
              <option value="ocean">🌊 Ocean</option>
              <option value="forest">🌲 Forest</option>
              <option value="sunset">🌅 Sunset</option>
            </select>
            <button className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none hover:scale-105 transition-transform duration-200">
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">Resume</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium hover:bg-white/10 transition-colors cursor-default">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--color-primary-400)' }} />
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: 'var(--color-primary-500)' }} />
              </span>
              ML • MLOps • Data Engineering
            </div>

            {/* DYNAMIC HEADER - MINI GAME */}
            <div className="min-h-[320px] flex flex-col justify-center">
              
              {stage === 'idle' && (
                <div className="space-y-5 card-animate">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-200">System Standby</h1>
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
                    <h1 className="text-xl font-bold mb-1">Layer 1: Input Data</h1>
                    <p className="text-sm text-slate-400 font-mono">Task: Activate all nodes to load the matrix.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm w-fit mx-auto lg:mx-0">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <button
                        key={i}
                        onClick={() => handleInputClick(i)}
                        className={`w-16 h-16 rounded-xl border transition-all duration-300 cursor-pointer ${inputNodes.has(i) ? 'scale-95 shadow-inner' : 'hover:scale-105 hover:bg-white/10'}`}
                        style={inputNodes.has(i) ? { backgroundColor: 'var(--color-primary-500)', borderColor: 'var(--color-primary-400)', boxShadow: `0 0 15px ${themes[currentTheme].glow}` } : { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {stage === 'conv' && (
                <div className="space-y-6 card-animate">
                  <div>
                    <h1 className="text-xl font-bold mb-1">Layer 2: Conv2D Features</h1>
                    <p className="text-sm text-slate-400 font-mono">Task: Extract features by catching the kernel. ({convScore}/5)</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm w-fit mx-auto lg:mx-0">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <button
                        key={i}
                        onClick={() => handleConvClick(i)}
                        className={`w-16 h-16 rounded-xl border transition-all duration-200 ${i === convTarget ? 'scale-110 shadow-lg cursor-pointer' : 'scale-100 bg-white/5 border-white/10 cursor-default'}`}
                        style={i === convTarget ? { backgroundColor: 'var(--color-secondary-600)', borderColor: 'var(--color-secondary-400)', boxShadow: `0 0 20px ${themes[currentTheme].glow}` } : {}}
                      />
                    ))}
                  </div>
                </div>
              )}

              {stage === 'pool' && (
                <div className="space-y-6 card-animate">
                  <div>
                    <h1 className="text-xl font-bold mb-1">Layer 3: MaxPooling2D</h1>
                    <p className="text-sm text-slate-400 font-mono">Task: Reduce dimensions by clicking the MAX value. ({poolScore}/3)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm w-fit mx-auto lg:mx-0">
                    {poolNums.map((num, i) => (
                      <button
                        key={i}
                        onClick={() => handlePoolClick(num)}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center justify-center text-2xl font-bold font-mono cursor-pointer hover:scale-105 active:scale-95"
                        style={{ '--tw-ring-color': 'var(--color-primary-400)' } as any}
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
                    <h1 className="text-xl font-bold mb-1">Layer 4: Flattening Vector</h1>
                    <p className="text-sm text-slate-400 font-mono">Task: Click the nodes in sequential order (1 to 4).</p>
                  </div>
                  <div className="flex gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm w-fit mx-auto lg:mx-0">
                    {flattenNodes.map((num, i) => {
                      const isClicked = num < flattenNext;
                      return (
                        <button
                          key={i}
                          onClick={() => handleFlattenClick(num)}
                          disabled={isClicked}
                          className={`w-14 h-24 md:w-16 md:h-32 rounded-xl border transition-all duration-300 flex items-center justify-center text-xl font-bold font-mono ${isClicked ? 'opacity-50 scale-95' : 'cursor-pointer hover:scale-105 hover:-translate-y-2'}`}
                          style={isClicked 
                            ? { backgroundColor: 'var(--color-primary-600)', borderColor: 'var(--color-primary-400)' } 
                            : { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
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
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                    ✓ Pipeline Deployed Successfully
                  </div>
                  <NeuralNetworkVisual />
                  <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                    Architecting
                    <span className="block text-transparent bg-clip-text pb-2" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-400), var(--color-accent-400), var(--color-secondary-400))` }}>
                      Intelligent
                    </span>
                    ML Systems
                  </h1>
                </div>
              )}
            </div>

            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              Transforming complex data into scalable AI solutions. Specializing in OCR pipelines, cloud-native infrastructure, and enterprise MLOps automation.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a href="#projects" onClick={(e) => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="group relative px-8 py-3 bg-white text-black font-bold rounded-xl overflow-hidden cursor-pointer">
                <div className="absolute inset-0 w-0 transition-all duration-300 ease-out group-hover:w-full" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-400), var(--color-secondary-400))` }} />
                <span className="relative group-hover:text-white transition-colors duration-200">Explore Projects</span>
              </a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="px-8 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-colors duration-200 font-medium cursor-pointer">
                Contact Me
              </a>
            </div>
          </div>

          {/* Terminal */}
          <div className="relative w-full max-w-lg mx-auto lg:ml-auto group hidden md:block">
            <div className="absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-300" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-600), var(--color-secondary-600))` }} />
            <div className="relative rounded-xl border border-white/10 bg-[#0a0a1a]/90 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col h-[400px]">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5 shrink-0">
                <div className="w-3 h-3 rounded-full bg-rose-500 hover:scale-125 transition-transform duration-200" />
                <div className="w-3 h-3 rounded-full bg-amber-500 hover:scale-125 transition-transform duration-200" />
                <div className="w-3 h-3 rounded-full bg-emerald-500 hover:scale-125 transition-transform duration-200" />
                <span className="ml-2 text-xs text-slate-500 font-mono">databricks_uc_pipeline.py</span>
              </div>
              <div className="p-6 font-mono text-sm text-slate-300 space-y-2 overflow-y-auto overflow-x-auto custom-scrollbar flex-grow">
                <p><span style={{ color: 'var(--color-primary-400)' }}>import</span> mlflow</p>
                <p><span style={{ color: 'var(--color-primary-400)' }}>from</span> pyspark.ml <span style={{ color: 'var(--color-primary-400)' }}>import</span> Pipeline</p>
                <br />
                <p className="text-slate-500"># 1. Configure Unity Catalog MLflow Registry</p>
                <p>mlflow.set_registry_uri(<span className="text-amber-300">"databricks-uc"</span>)</p>
                <p>UC_MODEL = <span className="text-amber-300">"prod_catalog.finance.fraud_model"</span></p>
                <br />
                <p><span style={{ color: 'var(--color-primary-400)' }}>def</span> <span className="text-emerald-400">train_and_log_model</span>():</p>
                <div className="pl-4 border-l border-white/10 ml-2">
                  <p><span style={{ color: 'var(--color-primary-400)' }}>with</span> mlflow.start_run():</p>
                  <div className="pl-4 border-l border-white/10 ml-2">
                    <p className="text-slate-500"># 2. Read ADLS data securely via Unity Catalog</p>
                    <p>df = spark.read.table(<span className="text-amber-300">"prod_catalog.finance.raw_tx"</span>)</p>
                    <br />
                    <p className="text-slate-500"># 3. Preprocess & Train</p>
                    <p>pipeline = build_preprocessing_pipeline()</p>
                    <p>model = pipeline.fit(df)</p>
                    <br />
                    <p className="text-slate-500"># 4. Log direct to Unity Catalog</p>
                    <p>mlflow.spark.log_model(</p>
                    <p className="pl-4">spark_model=model,</p>
                    <p className="pl-4">artifact_path=<span className="text-amber-300">"model_artifacts"</span>,</p>
                    <p className="pl-4">registered_model_name=UC_MODEL</p>
                    <p>)</p>
                  </div>
                </div>
                <br />
                <p><span style={{ color: 'var(--color-primary-400)' }}>def</span> <span className="text-emerald-400">batch_inference</span>():</p>
                <div className="pl-4 border-l border-white/10 ml-2">
                  <div className="border-l-2 bg-fuchsia-500/10 py-2 px-3 rounded-r my-2 mb-3" style={{ borderColor: 'var(--color-primary-500)/50', backgroundColor: `${themes[currentTheme].glow}` }}>
                    <p className="text-slate-400"># 5. Load model using Champion/Challenger alias</p>
                    <p>champion_uri = <span className="text-amber-300">f"models:/&#123;UC_MODEL&#125;@champion"</span></p>
                    <p>champion_model = mlflow.spark.load_model(champion_uri)</p>
                  </div>
                  <p className="text-slate-500"># 6. Fetch new batch & Infer</p>
                  <p>new_data = spark.read.table(<span className="text-amber-300">"prod_catalog.finance.incoming_tx"</span>)</p>
                  <p>preds = champion_model.transform(new_data)</p>
                  <br />
                  <p className="text-slate-500"># 7. Write predictions back to Unity Catalog</p>
                  <p>preds.write.mode(<span className="text-amber-300">"append"</span>).saveAsTable(<span className="text-amber-300">"prod_catalog.finance.predictions"</span>)</p>
                </div>
                <br />
                <p className="flex items-center gap-2 pt-2 pb-4">
                  <span className="text-green-400">➜</span>
                  <span style={{ color: 'var(--color-secondary-400)' }}>~</span>
                  <span className="w-2 h-4 animate-pulse" style={{ backgroundColor: 'var(--color-primary-400)' }} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/5 scroll-mt-20">
        <div className="grid lg:grid-cols-[1fr_minmax(320px,380px)_1fr] gap-10 lg:gap-8 items-center">
          <div className="flex justify-center lg:justify-start relative">
            <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl rounded-full -z-10" />
            <div className="w-[280px] h-[280px] md:w-[320px] md:h-[420px] rounded-3xl bg-[#0a0a1a] border border-white/10 overflow-hidden relative group shadow-[0_0_40px_rgba(139,92,246,0.15)] mx-auto lg:ml-0">
              <img src="/images/nilesh_pic.png" alt="Nilesh Kishore" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
            </div>
          </div>
          <div className="flex flex-col gap-6 w-full mx-auto">
            <div className="relative p-6 rounded-2xl border border-white/10 bg-[#0a0a1a]/50 hover:bg-white/5 transition-colors duration-300 group overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to bottom right, var(--color-secondary-400)/10, #3b82f6/10)` }} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4"><span className="text-xl">💼</span><h3 className="text-lg font-bold text-white tracking-wide">Experience</h3></div>
                <div className="mb-4"><h4 className="text-base font-bold tracking-wide" style={{ color: 'var(--color-secondary-400)' }}>Sigmoid</h4></div>
                <div className="space-y-4 border-l-2 border-white/10 pl-4 ml-1.5">
                  <div className="relative group/role">
                    <span className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#0a0a1a] group-hover/role:scale-125 transition-transform duration-300" style={{ backgroundColor: 'var(--color-secondary-400)' }} />
                    <h5 className="font-semibold text-slate-200 text-sm">Associate DataOps Engineer</h5>
                    <p className="text-xs text-slate-500 font-mono mt-1">Nov 2024 - Present • <span suppressHydrationWarning>{getDuration('Nov 2024', 'Present')}</span></p>
                  </div>
                  <div className="relative group/role">
                    <span className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-600 ring-4 ring-[#0a0a1a] group-hover/role:scale-125 transition-transform duration-300 group-hover/role:bg-slate-400" />
                    <h5 className="font-semibold text-slate-300 text-sm">DevOps Intern</h5>
                    <p className="text-xs text-slate-500 font-mono mt-1">Feb 2024 - Oct 2024 • <span suppressHydrationWarning>{getDuration('Feb 2024', 'Oct 2024')}</span></p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative p-6 rounded-2xl border border-white/10 bg-[#0a0a1a]/50 hover:bg-white/5 transition-colors duration-300 group overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to bottom right, var(--color-primary-400)/10, var(--color-secondary-400)/10)` }} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4"><span className="text-xl">🎓</span><h3 className="text-lg font-bold text-white tracking-wide">Education</h3></div>
                <h5 className="font-semibold text-sm md:text-base leading-tight mb-2" style={{ color: 'var(--color-primary-400)' }}>Bihar Engineering University, Patna</h5>
                <p className="text-sm text-slate-300 leading-snug">B.Tech - Computer Science and Engineering</p>
                <p className="text-xs text-slate-500 font-mono mt-2">2019 - 2023</p>
              </div>
            </div>
          </div>
          <div className="space-y-5 text-center lg:text-left h-full flex flex-col justify-center">
            <p className="uppercase tracking-widest text-sm font-semibold" style={{ color: 'var(--color-primary-400)' }}>About Me</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">Connecting Data to <span className="text-transparent bg-clip-text block lg:inline" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-400), var(--color-secondary-400))` }}>Intelligence</span></h2>
            <p className="text-slate-400 leading-relaxed text-[15px] lg:text-[16px]">I build scalable machine learning systems, OCR pipelines, transformer-based AI applications, and enterprise MLOps infrastructure. My focus includes cloud-native deployment, Databricks workflows, MLflow integration, and automation of large-scale AI systems.</p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-24 relative z-10 border-t border-white/5 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="uppercase tracking-widest text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-400)' }}>Featured Work</p>
            <h2 className="text-4xl md:text-5xl font-bold">Production <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, var(--color-secondary-400), #3b82f6)` }}>Pipelines</span></h2>
          </div>
          <button type="button" onClick={handleToggle} className="px-6 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-300 font-medium text-sm text-slate-300 hover:text-white flex items-center gap-2 group cursor-pointer" style={{ borderColor: `var(--color-secondary-400)/50` }}>
            {showAllProjects ? <><span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>Show Marquee</> : <>View All Projects<span className="group-hover:translate-x-1 transition-transform duration-200">→</span></>}
          </button>
        </div>

        {showAllProjects ? (
          <div ref={gridRef} className="max-w-7xl mx-auto px-6 scroll-mt-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project, idx) => (
                <div key={project.title} className="card-animate w-full group relative rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300 overflow-hidden backdrop-blur-sm hover:-translate-y-1" style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative z-10 h-full flex flex-col">
                    <p className="text-xs font-mono mb-4 border self-start px-3 py-1 rounded-full" style={{ color: 'var(--color-secondary-400)', borderColor: `var(--color-secondary-400)/30`, backgroundColor: `var(--color-secondary-400)10` }}>{project.category}</p>
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-200">{project.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed flex-grow mb-6">{project.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-white transition-colors duration-200 cursor-pointer group-hover:opacity-100" style={{ '--tw-text-opacity': '1' } as any} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-400)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}>Explore Architecture<span className="group-hover:translate-x-1 transition-transform duration-200">→</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-[1400px] mx-auto overflow-hidden relative w-full px-6">
            <div className="absolute inset-y-0 left-0 w-8 md:w-24 bg-gradient-to-r from-[#030014] to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 md:w-24 bg-gradient-to-l from-[#030014] to-transparent z-20 pointer-events-none" />
            <div className="animate-marquee hover:cursor-grab active:cursor-grabbing">
              {[...projects, ...projects].map((project, idx) => (
                <div key={idx} className="w-[280px] lg:w-[290px] shrink-0 group relative rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300 overflow-hidden backdrop-blur-sm hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative z-10 h-full flex flex-col">
                    <p className="text-xs font-mono mb-4 border self-start px-3 py-1 rounded-full" style={{ color: 'var(--color-secondary-400)', borderColor: `var(--color-secondary-400)/30`, backgroundColor: `var(--color-secondary-400)10` }}>{project.category}</p>
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-200">{project.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed flex-grow mb-6">{project.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-white transition-colors duration-200 cursor-pointer" style={{ '--tw-text-opacity': '1' } as any} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-400)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}>Explore Architecture<span className="group-hover:translate-x-1 transition-transform duration-200">→</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Tech Stack */}
      <section id="stack" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/5 scroll-mt-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tech Stack</h2>
          <p className="text-slate-400">Tools and frameworks I use to build production-grade AI systems.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {["Python", "PyTorch", "TensorFlow", "MLflow", "Databricks", "Apache Spark", "Docker", "Kubernetes", "AWS", "Azure ML", "FastAPI", "PostgreSQL"].map((tool) => (
            <div key={tool} className="px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-slate-300 font-medium transition-all duration-200 cursor-default hover:scale-105" style={{ borderColor: 'var(--color-secondary-400)/50', backgroundColor: 'var(--color-secondary-400)/10' }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = `${themes[currentTheme].glow}`; (e.currentTarget as HTMLElement).style.color = 'var(--color-secondary-400)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${themes[currentTheme].glow}`; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = `var(--color-secondary-400)/10`; (e.currentTarget as HTMLElement).style.color = '#cbd5e1'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
              {tool}
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-4xl mx-auto px-6 py-16 relative z-10 border-t border-white/5 scroll-mt-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Let's Connect</h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">Whether you have a question or want to discuss a project, feel free to reach out.</p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 text-sm font-medium">
          <a href="mailto:nileshkishore2001@gmail.com" className="flex items-center gap-2 text-slate-300 transition-colors" style={{ '--hover-color': 'var(--color-primary-400)' } as any} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-400)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}><span className="text-xl">✉️</span> nileshkishore2001@gmail.com</a>
          <a href="tel:7488602895" className="flex items-center gap-2 text-slate-300 transition-colors" style={{ '--hover-color': 'var(--color-secondary-400)' } as any} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-secondary-400)')} onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}><span className="text-xl">📱</span> +91 74886 02895</a>
          <a href="https://github.com/Nileshkishore" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 hover:text-purple-400 transition-colors"><span className="text-xl">💻</span> GitHub</a>
          <a href="https://www.linkedin.com/in/nilesh-kishore-1b70381b2" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors"><span className="text-xl">🔗</span> LinkedIn</a>
        </div>
      </section>

      <footer className="border-t border-white/5 relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Nilesh Kishore. Built with React & Tailwind CSS.</p>
        </div>
      </footer>
    </main>
  );
}