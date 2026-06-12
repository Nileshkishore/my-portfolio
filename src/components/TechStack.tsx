import React from 'react';
import { ThemeType, themes } from '../utils/themes';

interface TechStackProps {
  currentTheme: ThemeType;
}

// ─── Dynamic Data Array ────────────────────────────────────────────────────
// Simply add or remove items from this list to update your Tech Stack section
const techSkills = [
  "Python", 
  "PyTorch", 
  "TensorFlow", 
  "MLflow", 
  "Databricks", 
  "Apache Spark", 
  "PySpark", 
  "LangChain", 
  "Docker", 
  "Kubernetes", 
  "AWS", 
  "Azure ML", 
  "FastAPI", 
  "PostgreSQL", 
  "Delta Lake", 
  "Kafka",
  "C++"
];

export default function TechStack({ currentTheme }: TechStackProps) {
  return (
    <section id="stack" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/5 scroll-mt-20" aria-labelledby="stack-heading">
      <div className="text-center mb-16">
        <h2 id="stack-heading" className="text-3xl md:text-4xl font-bold mb-4">Tech Stack</h2>
        <p className="text-slate-400">
          Tools and frameworks I use to build production-grade ML, MLOps, LLM, and data engineering systems.
        </p>
      </div>
      <ul className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto list-none p-0" aria-label="Technology skills">
        {techSkills.map((tool) => (
          <li 
            key={tool}
            className="px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-slate-300 font-medium transition-all duration-200 cursor-default hover:scale-105"
            onMouseEnter={(e) => { 
              const el = e.currentTarget as HTMLElement; 
              el.style.backgroundColor = themes[currentTheme].glow; 
              el.style.color = 'var(--color-secondary-400)'; 
              el.style.boxShadow = `0 0 15px ${themes[currentTheme].glow}`; 
            }}
            onMouseLeave={(e) => { 
              const el = e.currentTarget as HTMLElement; 
              el.style.backgroundColor = currentTheme === 'white' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'; 
              el.style.color = currentTheme === 'white' ? '#475569' : '#cbd5e1'; 
              el.style.boxShadow = 'none'; 
            }}
          >
            {tool}
          </li>
        ))}
      </ul>
    </section>
  );
}