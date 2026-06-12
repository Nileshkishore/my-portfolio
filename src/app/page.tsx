// src/app/page.tsx

'use client';

import React, { useEffect, useRef, useState } from 'react';
import About from '../components/About';       
import Projects from '../components/Projects'; 
import TechStack from '../components/TechStack';
import Contact from '../components/Contact';   
import { ThemeType, themes } from '../utils/themes';

// ─── Types ─────────────────────────────────────────────────────────────────
type PipelineStep = 
  | 'problem_type'
  | 'data_source'
  | 'compute'
  | 'hpo'
  | 'forecasting_config'
  | 'serving'
  | 'running'
  | 'complete';

interface PipelineConfig {
  problemType: 'classification' | 'regression' | 'forecasting' | null;
  dataSource: 'adls' | 's3' | 'gcs' | 'snowflake' | 'bigquery' | null;
  compute: 'databricks' | 'azure_ml' | 'sagemaker' | 'vertex_ai' | null;
  hpoEnabled: boolean;
  backtestMonths: number;
  forecastValue: number;
  forecastUnit: 'days' | 'weeks' | 'months';
  servingTarget: 'aks' | 'azure_ml_endpoint' | 'sagemaker_endpoint' | 'databricks_serving' | 'vertex_endpoint' | 'kubernetes' | null;
  inferenceType: 'batch' | 'stream' | 'real_time' | null;
}

const defaultConfig: PipelineConfig = {
  problemType: null,
  dataSource: null,
  compute: null,
  hpoEnabled: false,
  backtestMonths: 6,
  forecastValue: 3,
  forecastUnit: 'months',
  servingTarget: null,
  inferenceType: null,
};

// ─── Derived Options Based on Context ──────────────────────────────────────
const getAvailableCompute = (dataSource: PipelineConfig['dataSource']): { value: PipelineConfig['compute']; label: string }[] => {
  if (!dataSource) return [];
  
  const mapping: Record<string, { value: PipelineConfig['compute']; label: string }[]> = {
    adls: [
      { value: 'databricks', label: 'Azure Databricks' },
      { value: 'azure_ml', label: 'Azure ML Compute' },
    ],
    s3: [
      { value: 'databricks', label: 'Databricks on AWS' },
      { value: 'sagemaker', label: 'Amazon SageMaker' },
    ],
    gcs: [
      { value: 'databricks', label: 'Databricks on GCP' },
      { value: 'vertex_ai', label: 'Vertex AI' },
    ],
    snowflake: [
      { value: 'databricks', label: 'Databricks (Snowflake connector)' },
      { value: 'azure_ml', label: 'Azure ML Compute' },
      { value: 'sagemaker', label: 'Amazon SageMaker' },
    ],
    bigquery: [
      { value: 'databricks', label: 'Databricks on GCP' },
      { value: 'vertex_ai', label: 'Vertex AI' },
    ],
  };
  
  return mapping[dataSource] || [];
};

const getAvailableServing = (compute: PipelineConfig['compute']): { value: PipelineConfig['servingTarget']; label: string; desc: string }[] => {
  if (!compute) return [];
  
  const mapping: Record<string, { value: PipelineConfig['servingTarget']; label: string; desc: string }[]> = {
    databricks: [
      { value: 'databricks_serving', label: 'Databricks Model Serving', desc: 'Native serving, low latency' },
      { value: 'aks', label: 'Azure Kubernetes Service', desc: 'Containerized, auto-scale' },
      { value: 'kubernetes', label: 'Self-managed Kubernetes', desc: 'Full control, any cloud' },
    ],
    azure_ml: [
      { value: 'azure_ml_endpoint', label: 'Azure ML Managed Endpoint', desc: 'Fully managed, zero ops' },
      { value: 'aks', label: 'Azure Kubernetes Service', desc: 'Containerized, auto-scale' },
      { value: 'kubernetes', label: 'Self-managed Kubernetes', desc: 'Full control, any cloud' },
    ],
    sagemaker: [
      { value: 'sagemaker_endpoint', label: 'SageMaker Endpoint', desc: 'Fully managed, auto-scale' },
      { value: 'kubernetes', label: 'Self-managed Kubernetes', desc: 'Full control, any cloud' },
    ],
    vertex_ai: [
      { value: 'vertex_endpoint', label: 'Vertex AI Endpoint', desc: 'Fully managed, low latency' },
      { value: 'kubernetes', label: 'Self-managed Kubernetes', desc: 'Full control, any cloud' },
    ],
  };
  
  return mapping[compute] || [];
};

const getInferenceTypes = (servingTarget: PipelineConfig['servingTarget']): { value: PipelineConfig['inferenceType']; label: string; desc: string }[] => {
  if (!servingTarget) return [];
  
  if (servingTarget === 'kubernetes') {
    return [
      { value: 'batch', label: 'Batch', desc: 'Scheduled Spark jobs' },
      { value: 'stream', label: 'Stream', desc: 'Kafka/Flink processing' },
      { value: 'real_time', label: 'Real-time', desc: 'REST API, < 100ms' },
    ];
  }
  
  if (servingTarget === 'databricks_serving') {
    return [
      { value: 'real_time', label: 'Real-time', desc: 'REST API, < 50ms' },
      { value: 'batch', label: 'Batch', desc: 'Scheduled notebook jobs' },
    ];
  }
  
  return [
    { value: 'real_time', label: 'Real-time', desc: 'REST API endpoint' },
    { value: 'batch', label: 'Batch', desc: 'Scheduled inference' },
  ];
};

// ─── Pipeline Step Indicator ───────────────────────────────────────────────
const StepIndicator = ({ currentStep, steps }: { currentStep: PipelineStep; steps: { key: PipelineStep; label: string }[] }) => {
  const currentIndex = steps.findIndex(s => s.key === currentStep);
  
  return (
    <div className="flex items-center gap-1 mb-6">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= currentIndex ? 'scale-100' : 'scale-75 opacity-30'
            }`}
            style={{ backgroundColor: i <= currentIndex ? 'var(--color-primary-400)' : 'rgba(255,255,255,0.2)' }}
          />
          {i < steps.length - 1 && (
            <div
              className="w-4 h-px transition-all duration-300"
              style={{ backgroundColor: i < currentIndex ? 'var(--color-primary-400)' : 'rgba(255,255,255,0.1)' }}
            />
          )}
        </div>
      ))}
      <span className="ml-3 text-xs text-slate-500 font-mono">
        Step {currentIndex + 1}/{steps.length}
      </span>
    </div>
  );
};

// ─── Option Card ───────────────────────────────────────────────────────────
const OptionCard = ({ 
  selected, 
  onClick, 
  label, 
  desc 
}: { 
  selected: boolean; 
  onClick: () => void; 
  label: string;
  desc?: string;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 cursor-pointer group ${
      selected ? 'border-white/20' : 'border-white/5 hover:border-white/10'
    }`}
    style={selected ? {
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderColor: 'var(--color-primary-500)',
      boxShadow: 'inset 0 0 0 1px var(--color-primary-500)',
    } : {
      backgroundColor: 'rgba(255,255,255,0.02)',
    }}
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          selected ? 'scale-100' : 'scale-90'
        }`}
        style={{ borderColor: selected ? 'var(--color-primary-400)' : 'rgba(255,255,255,0.2)' }}
      >
        {selected && (
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary-400)' }} />
        )}
      </div>
      <div>
        <p className={`text-sm font-medium transition-colors ${selected ? 'text-white' : 'text-slate-300'}`}>
          {label}
        </p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
    </div>
  </button>
);

// ─── Summary Bar ───────────────────────────────────────────────────────────
const SummaryBar = ({ config }: { config: PipelineConfig }) => {
  const items: { label: string; value: string }[] = [];
  
  if (config.problemType) items.push({ label: 'Problem', value: config.problemType });
  if (config.dataSource) items.push({ label: 'Data', value: config.dataSource.toUpperCase() });
  if (config.compute) items.push({ label: 'Compute', value: config.compute.replace('_', ' ').replace('ml', 'ML') });
  if (config.servingTarget) items.push({ label: 'Serve', value: config.servingTarget.replace(/_/g, ' ') });
  if (config.inferenceType) items.push({ label: 'Type', value: config.inferenceType.replace('_', '-') });
  
  if (items.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--color-primary-400)',
          }}
        >
          <span className="text-slate-500">{item.label}:</span>
          {item.value}
        </span>
      ))}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
export default function Portfolio() {
  const spotlightRef  = useRef<HTMLDivElement>(null);
  const [currentTheme, setCurrentTheme]       = useState<ThemeType>('fuchsia');
  const [mounted, setMounted]                 = useState(false);

  const [step, setStep] = useState<PipelineStep>('problem_type');
  const [config, setConfig] = useState<PipelineConfig>(defaultConfig);
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Record<string, string> | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const stepLabels: { key: PipelineStep; label: string }[] = [
    { key: 'problem_type', label: 'Problem' },
    { key: 'data_source', label: 'Data' },
    { key: 'compute', label: 'Compute' },
    { key: 'hpo', label: 'HPO' },
    { key: 'forecasting_config', label: 'Config' },
    { key: 'serving', label: 'Serve' },
    { key: 'running', label: 'Run' },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, ${themes[currentTheme].glow}, transparent 80%)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [currentTheme]);

  const updateConfig = (updates: Partial<PipelineConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      
      if ('dataSource' in updates) {
        next.compute = null;
        next.servingTarget = null;
        next.inferenceType = null;
      }
      
      if ('compute' in updates) {
        next.servingTarget = null;
        next.inferenceType = null;
      }
      
      if ('servingTarget' in updates) {
        next.inferenceType = null;
      }
      
      return next;
    });
  };

  const advanceStep = (nextStep: PipelineStep) => {
    setStep(nextStep);
    setShowReset(false);
  };

  const runPipeline = async () => {
    setStep('running');
    setIsRunning(true);
    setLogs([]);
    setMetrics(null);
    
    const logs: string[] = [];
    const addLog = (msg: string, delay: number) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          logs.push(msg);
          setLogs([...logs]);
          resolve();
        }, delay);
      });
    };

    const dsName = config.dataSource?.toUpperCase() || 'DATA_SOURCE';
    const ts = () => new Date().toLocaleTimeString();

    await addLog(`[${ts()}] Connecting to ${dsName}...`, 600);
    await addLog(`[${ts()}] Validating schema and partitioning...`, 800);
    await addLog(`[${ts()}] Provisioning compute cluster...`, 1000);
    
    if (config.hpoEnabled) {
      await addLog(`[${ts()}] Starting Hyperopt with 50 trials...`, 1200);
      await addLog(`[${ts()}] Trial 23/50: val_loss=0.0421 (best so far)...`, 500);
      await addLog(`[${ts()}] Trial 47/50: val_loss=0.0389 (new best)...`, 500);
    }
    
    await addLog(`[${ts()}] Training final model with best params...`, 1500);
    
    if (config.problemType === 'forecasting') {
      await addLog(`[${ts()}] Backtesting ${config.backtestMonths} months...`, 1200);
      await addLog(`[${ts()}] Generating ${config.forecastValue} ${config.forecastUnit} forecast...`, 1000);
    }
    
    await addLog(`[${ts()}] Running cross-validation...`, 1000);
    await addLog(`[${ts()}] Registering model in MLflow registry...`, 800);
    await addLog(`[${ts()}] Deploying to ${config.servingTarget?.replace(/_/g, ' ')} (${config.inferenceType?.replace(/_/g, '-')})...`, 1500);
    await addLog(`[${ts()}] Pipeline complete. Endpoint ready.`, 600);

    const mockMetrics: Record<string, string> = {};
    if (config.problemType === 'classification') {
      mockMetrics['Accuracy'] = '94.2%';
      mockMetrics['F1 Score'] = '0.91';
      mockMetrics['AUC-ROC'] = '0.97';
      mockMetrics['Latency'] = '12ms';
    } else if (config.problemType === 'regression') {
      mockMetrics['RMSE'] = '0.042';
      mockMetrics['MAE'] = '0.031';
      mockMetrics['R-squared'] = '0.89';
      mockMetrics['Latency'] = '8ms';
    } else if (config.problemType === 'forecasting') {
      mockMetrics['MAPE'] = '3.2%';
      mockMetrics['RMSE'] = '142.5';
      mockMetrics['MAE'] = '98.3';
      mockMetrics['Horizon'] = `${config.forecastValue} ${config.forecastUnit}`;
    }

    setIsRunning(false);
    setMetrics(mockMetrics);
    setStep('complete');
    setShowReset(true);
  };

  const resetAll = () => {
    setConfig(defaultConfig);
    setStep('problem_type');
    setLogs([]);
    setMetrics(null);
    setIsRunning(false);
    setShowReset(false);
  };

  if (!mounted) return null;

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
          main { color: #0f172a !important; }
          .text-slate-200, .text-slate-300, .text-slate-400, .text-slate-500 { color: #475569 !important; }
          .text-white { color: #0f172a !important; }
          .bg-white\\/5 { background-color: rgba(0, 0, 0, 0.04) !important; }
          .bg-white\\/10 { background-color: rgba(0, 0, 0, 0.08) !important; }
          .border-white\\/5, .border-white\\/10, .border-white\\/20 { border-color: rgba(0, 0, 0, 0.1) !important; }
          .bg-\\[\\#0a0a1a\\] { background-color: #ffffff !important; box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; }
          .bg-\\[\\#0a0a1a\\]\\/50 { background-color: #f8fafc !important; }
          .bg-\\[\\#0a0a1a\\]\\/90 { background-color: rgba(255, 255, 255, 0.95) !important; }
          .ring-\\[\\#0a0a1a\\] { --tw-ring-color: #ffffff !important; }
          select { background-color: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #0f172a !important; }
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

            {/* ── Interactive Pipeline Builder ── */}
            <div className="min-h-[480px] flex flex-col justify-center">
              {/* Summary */}
              <SummaryBar config={config} />

              {/* Step indicator */}
              {(step !== 'running' && step !== 'complete') && (
                <StepIndicator currentStep={step} steps={stepLabels.filter(s => {
                  if (s.key === 'forecasting_config') return config.problemType === 'forecasting';
                  return s.key !== 'running' && s.key !== 'complete';
                })} />
              )}

              {/* STEP 1: Problem Type */}
              {step === 'problem_type' && (
                <div className="space-y-4 card-animate">
                  <p className="text-lg font-bold">What type of ML problem?</p>
                  <div className="space-y-2">
                    <OptionCard
                      selected={config.problemType === 'classification'}
                      onClick={() => updateConfig({ problemType: 'classification' })}
                      label="Classification"
                      desc="Fraud detection, churn prediction, sentiment analysis"
                    />
                    <OptionCard
                      selected={config.problemType === 'regression'}
                      onClick={() => updateConfig({ problemType: 'regression' })}
                      label="Regression"
                      desc="Price prediction, demand estimation, scoring"
                    />
                    <OptionCard
                      selected={config.problemType === 'forecasting'}
                      onClick={() => updateConfig({ problemType: 'forecasting' })}
                      label="Time Series Forecasting"
                      desc="Revenue projection, inventory planning, anomaly detection"
                    />
                  </div>
                  <button
                    onClick={() => advanceStep('data_source')}
                    disabled={!config.problemType}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      config.problemType ? 'text-white cursor-pointer hover:opacity-90' : 'opacity-30 cursor-not-allowed'
                    }`}
                    style={{ backgroundColor: config.problemType ? 'var(--color-primary-500)' : 'rgba(255,255,255,0.1)' }}
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* STEP 2: Data Source */}
              {step === 'data_source' && (
                <div className="space-y-4 card-animate">
                  <p className="text-lg font-bold">Where is your data?</p>
                  <div className="space-y-2">
                    {[
                      { value: 'adls' as const, label: 'Azure Data Lake Storage', desc: 'ADLS Gen2, Parquet/Delta format' },
                      { value: 's3' as const, label: 'Amazon S3', desc: 'S3 buckets, Iceberg/Parquet' },
                      { value: 'gcs' as const, label: 'Google Cloud Storage', desc: 'GCS, BigLake tables' },
                      { value: 'snowflake' as const, label: 'Snowflake', desc: 'Cloud data warehouse' },
                      { value: 'bigquery' as const, label: 'BigQuery', desc: 'Serverless, columnar storage' },
                    ].map((ds) => (
                      <OptionCard
                        key={ds.value}
                        selected={config.dataSource === ds.value}
                        onClick={() => updateConfig({ dataSource: ds.value })}
                        label={ds.label}
                        desc={ds.desc}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => advanceStep('problem_type')} className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                      Back
                    </button>
                    <button
                      onClick={() => advanceStep('compute')}
                      disabled={!config.dataSource}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        config.dataSource ? 'text-white cursor-pointer hover:opacity-90' : 'opacity-30 cursor-not-allowed'
                      }`}
                      style={{ backgroundColor: config.dataSource ? 'var(--color-primary-500)' : 'rgba(255,255,255,0.1)' }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Compute */}
              {step === 'compute' && (
                <div className="space-y-4 card-animate">
                  <p className="text-lg font-bold">Select compute target</p>
                  <p className="text-xs text-slate-500">
                    Compatible options for {config.dataSource?.toUpperCase()}
                  </p>
                  <div className="space-y-2">
                    {getAvailableCompute(config.dataSource).map((c) => (
                      <OptionCard
                        key={c.value}
                        selected={config.compute === c.value}
                        onClick={() => updateConfig({ compute: c.value })}
                        label={c.label}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => advanceStep('data_source')} className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                      Back
                    </button>
                    <button
                      onClick={() => advanceStep('hpo')}
                      disabled={!config.compute}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        config.compute ? 'text-white cursor-pointer hover:opacity-90' : 'opacity-30 cursor-not-allowed'
                      }`}
                      style={{ backgroundColor: config.compute ? 'var(--color-primary-500)' : 'rgba(255,255,255,0.1)' }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: HPO */}
              {step === 'hpo' && (
                <div className="space-y-4 card-animate">
                  <p className="text-lg font-bold">Hyperparameter Optimization</p>
                  <div className="space-y-2">
                    <OptionCard
                      selected={config.hpoEnabled}
                      onClick={() => updateConfig({ hpoEnabled: true })}
                      label="Enable HPO"
                      desc="Bayesian optimization with Hyperopt, 50 trials"
                    />
                    <OptionCard
                      selected={!config.hpoEnabled}
                      onClick={() => updateConfig({ hpoEnabled: false })}
                      label="Skip HPO"
                      desc="Use sensible defaults, faster training"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => advanceStep('compute')} className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                      Back
                    </button>
                    <button
                      onClick={() => advanceStep(config.problemType === 'forecasting' ? 'forecasting_config' : 'serving')}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer hover:opacity-90 transition-all"
                      style={{ backgroundColor: 'var(--color-primary-500)' }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Forecasting Config */}
              {step === 'forecasting_config' && config.problemType === 'forecasting' && (
                <div className="space-y-4 card-animate">
                  <p className="text-lg font-bold">Forecasting Configuration</p>
                  
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Backtesting Period</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 6, 12, 24].map((m) => (
                        <button
                          key={m}
                          onClick={() => updateConfig({ backtestMonths: m })}
                          className={`py-2 rounded-lg text-sm border transition-all cursor-pointer ${
                            config.backtestMonths === m ? 'border-white/20 text-white' : 'border-white/5 text-slate-400 hover:border-white/10'
                          }`}
                          style={config.backtestMonths === m ? { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'var(--color-primary-500)' } : { backgroundColor: 'rgba(255,255,255,0.02)' }}
                        >
                          {m}mo
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-2">Forecast Unit</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['days', 'weeks', 'months'] as const).map((u) => (
                        <button
                          key={u}
                          onClick={() => updateConfig({ forecastUnit: u })}
                          className={`py-2 rounded-lg text-sm border transition-all cursor-pointer capitalize ${
                            config.forecastUnit === u ? 'border-white/20 text-white' : 'border-white/5 text-slate-400 hover:border-white/10'
                          }`}
                          style={config.forecastUnit === u ? { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'var(--color-primary-500)' } : { backgroundColor: 'rgba(255,255,255,0.02)' }}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-2">
                      Horizon: <span className="text-slate-200 font-bold">{config.forecastValue} {config.forecastUnit}</span>
                    </p>
                    <input
                      type="range"
                      min={1}
                      max={config.forecastUnit === 'days' ? 90 : config.forecastUnit === 'weeks' ? 52 : 36}
                      value={config.forecastValue}
                      onChange={(e) => updateConfig({ forecastValue: parseInt(e.target.value) })}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: 'var(--color-primary-400)' }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => advanceStep('hpo')} className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                      Back
                    </button>
                    <button
                      onClick={() => advanceStep('serving')}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer hover:opacity-90 transition-all"
                      style={{ backgroundColor: 'var(--color-primary-500)' }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: Serving */}
              {step === 'serving' && (
                <div className="space-y-4 card-animate">
                  <p className="text-lg font-bold">Model Serving</p>
                  <p className="text-xs text-slate-500">
                    Compatible with {config.compute?.replace('_', ' ').replace('ml', 'ML')}
                  </p>
                  
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Serving Target</p>
                    <div className="space-y-2">
                      {getAvailableServing(config.compute).map((s) => (
                        <OptionCard
                          key={s.value}
                          selected={config.servingTarget === s.value}
                          onClick={() => updateConfig({ servingTarget: s.value })}
                          label={s.label}
                          desc={s.desc}
                        />
                      ))}
                    </div>
                  </div>

                  {config.servingTarget && (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Inference Type</p>
                      <div className="space-y-2">
                        {getInferenceTypes(config.servingTarget).map((it) => (
                          <OptionCard
                            key={it.value}
                            selected={config.inferenceType === it.value}
                            onClick={() => updateConfig({ inferenceType: it.value })}
                            label={it.label}
                            desc={it.desc}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => advanceStep(config.problemType === 'forecasting' ? 'forecasting_config' : 'hpo')} className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                      Back
                    </button>
                    <button
                      onClick={runPipeline}
                      disabled={!config.servingTarget || !config.inferenceType}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        config.servingTarget && config.inferenceType ? 'text-white cursor-pointer hover:opacity-90' : 'opacity-30 cursor-not-allowed'
                      }`}
                      style={{ 
                        backgroundImage: config.servingTarget && config.inferenceType ? 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-600))' : undefined,
                        backgroundColor: !config.servingTarget || !config.inferenceType ? 'rgba(255,255,255,0.1)' : undefined,
                      }}
                    >
                      Run Pipeline
                    </button>
                  </div>
                </div>
              )}

              {/* Running / Complete */}
              {(step === 'running' || step === 'complete') && (
                <div className="card-animate space-y-4">
                  <p className="text-lg font-bold">
                    {isRunning ? 'Pipeline Running...' : 'Pipeline Complete'}
                  </p>

                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: step === 'complete' ? '100%' : '85%',
                        backgroundImage: 'linear-gradient(to right, var(--color-primary-400), var(--color-secondary-400))',
                      }}
                    >
                      {isRunning && (
                        <div className="h-full w-1/3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-secondary-400)', opacity: 0.5 }} />
                      )}
                    </div>
                  </div>

                  {logs.length > 0 && (
                    <div className="p-4 rounded-lg border border-white/5 font-mono text-xs max-h-40 overflow-y-auto custom-scrollbar" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                      {logs.map((log, i) => (
                        <p key={i} className="text-slate-400 mb-1 leading-relaxed">{log}</p>
                      ))}
                      {isRunning && <span className="animate-pulse text-slate-300">_</span>}
                    </div>
                  )}

                  {metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(metrics).map(([key, value]) => (
                        <div key={key} className="p-3 rounded-lg border border-white/5 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                          <p className="text-xs text-slate-500 font-mono">{key}</p>
                          <p className="text-base font-bold mt-1" style={{ color: 'var(--color-primary-400)' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {showReset && (
                    <button 
                      onClick={resetAll}
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer underline underline-offset-4"
                    >
                      Reset and start over
                    </button>
                  )}
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

          {/* Terminal - Original Production Pipeline Code */}
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
          TECH STACK (Imported Component)
      ══════════════════════════════════════════════════════════ */}
      <TechStack currentTheme={currentTheme} />

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