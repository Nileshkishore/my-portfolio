import React from 'react';
import { ThemeType } from '../utils/themes';

interface AboutProps {
  currentTheme: ThemeType;
}

// ─── Helper Function ───────────────────────────────────────────────────────
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

export default function About({ currentTheme }: AboutProps) {
  return (
    <section id="about" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/5 scroll-mt-20" aria-labelledby="about-heading">
      <div className="grid lg:grid-cols-[1fr_minmax(320px,380px)_1fr] gap-10 lg:gap-8 items-center">
        
        <div className="flex justify-center lg:justify-start relative">
          <div className={`absolute inset-0 blur-3xl rounded-full -z-10 bg-${currentTheme === 'white' ? 'slate' : currentTheme}-500/20`} />
          <div className="w-[280px] h-[280px] md:w-[320px] md:h-[420px] rounded-3xl bg-[#0a0a1a] border border-white/10 overflow-hidden relative group shadow-[0_0_40px_rgba(139,92,246,0.15)] mx-auto lg:ml-0">
            <img src="/images/nilesh_pic.png" alt="Nilesh Kishore — MLOps and Data Engineer based in India" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" width={320} height={420} />
          </div>
        </div>

        <article className="flex flex-col gap-6 w-full mx-auto">
          {/* Experience */}
          <div className="relative p-6 rounded-2xl border border-white/10 bg-[#0a0a1a]/50 hover:bg-white/5 transition-colors duration-300 group overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to bottom right, var(--color-secondary-400)/10, #3b82f6/10)` }} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-400)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                <h2 className="text-lg font-bold text-white tracking-wide">Experience</h2>
              </div>
              <h3 className="text-base font-bold tracking-wide mb-4" style={{ color: 'var(--color-secondary-400)' }}>Sigmoid</h3>
              <div className="space-y-4 border-l-2 border-white/10 pl-4 ml-1.5">
                <div className="relative group/role">
                  <span className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#0a0a1a] group-hover/role:scale-125 transition-transform duration-300" style={{ backgroundColor: 'var(--color-secondary-400)' }} />
                  <h4 className="font-semibold text-slate-200 text-sm">Associate DataOps Engineer</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1">Nov 2024 – Present · <span suppressHydrationWarning>{getDuration('Nov 2024', 'Present')}</span></p>
                </div>
                <div className="relative group/role">
                  <span className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-600 ring-4 ring-[#0a0a1a] group-hover/role:scale-125 transition-transform duration-300 group-hover/role:bg-slate-400" />
                  <h4 className="font-semibold text-slate-300 text-sm">DevOps Intern</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1">Feb 2024 – Oct 2024 · <span suppressHydrationWarning>{getDuration('Feb 2024', 'Oct 2024')}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="relative p-6 rounded-2xl border border-white/10 bg-[#0a0a1a]/50 hover:bg-white/5 transition-colors duration-300 group overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to bottom right, var(--color-primary-400)/10, var(--color-secondary-400)/10)` }} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-400)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                <h2 className="text-lg font-bold text-white tracking-wide">Education</h2>
              </div>
              <h3 className="font-semibold text-sm md:text-base leading-tight mb-2" style={{ color: 'var(--color-primary-400)' }}>Bihar Engineering University, Patna</h3>
              <p className="text-sm text-slate-300 leading-snug">B.Tech — Computer Science and Engineering</p>
              <p className="text-xs text-slate-500 font-mono mt-2">2019 – 2023</p>
            </div>
          </div>
        </article>

        <div className="space-y-5 text-center lg:text-left h-full flex flex-col justify-center">
          <p className="uppercase tracking-widest text-sm font-semibold" style={{ color: 'var(--color-primary-400)' }}>About Me</p>
          <h2 id="about-heading" className="text-3xl md:text-4xl font-bold leading-tight">
            Connecting Data to{' '}
            <span className="text-transparent bg-clip-text block lg:inline" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-400), var(--color-secondary-400))` }}>
              Intelligence
            </span>
          </h2>
          <p className="text-slate-400 leading-relaxed text-[15px] lg:text-[16px]">
            I build scalable <strong className="text-slate-300 font-medium">machine learning systems</strong>,{' '}
            <strong className="text-slate-300 font-medium">OCR pipelines</strong>,{' '}
            <strong className="text-slate-300 font-medium">LLM-powered applications</strong>, and enterprise{' '}
            <strong className="text-slate-300 font-medium">MLOps infrastructure</strong>. My focus includes
            cloud-native deployment, <strong className="text-slate-300 font-medium">Databricks</strong> workflows,{' '}
            <strong className="text-slate-300 font-medium">MLflow</strong> integration, and automation of
            large-scale AI and <strong className="text-slate-300 font-medium">data engineering</strong> systems.
          </p>
        </div>
      </div>
    </section>
  );
}