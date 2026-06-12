// src/components/Projects.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { projects } from '../data/projects';
import { ThemeType } from '../utils/themes';

interface ProjectsProps {
  currentTheme: ThemeType;
  themes: Record<ThemeType, { bg: string; [key: string]: string }>;
}

export default function Projects({ currentTheme, themes }: ProjectsProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const handleToggle = useCallback(() => setShowAllProjects(p => !p), []);

  useEffect(() => {
    if (showAllProjects && gridRef.current) {
      setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }, [showAllProjects]);

  return (
    <section id="projects" className="py-24 relative z-10 border-t border-white/5 scroll-mt-20" aria-labelledby="projects-heading">
      <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="uppercase tracking-widest text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-400)' }}>Featured Work</p>
          <h2 id="projects-heading" className="text-4xl md:text-5xl font-bold">
            Production{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, var(--color-secondary-400), #3b82f6)` }}>Pipelines</span>
          </h2>
        </div>
        <button type="button" onClick={handleToggle} className="px-6 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-300 font-medium text-sm text-slate-300 hover:text-white flex items-center gap-2 group cursor-pointer shadow-sm hover:shadow-md">
          {showAllProjects
            ? <><span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>Show Marquee</>
            : <>View All Projects<span className="group-hover:translate-x-1 transition-transform duration-200">→</span></>}
        </button>
      </div>

      {showAllProjects ? (
        <div ref={gridRef} className="max-w-7xl mx-auto px-6 scroll-mt-24">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 list-none p-0">
            {projects.map((project, idx) => (
              <li key={project.title} className="card-animate w-full group relative rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300 overflow-hidden backdrop-blur-sm hover:-translate-y-1" style={{ animationDelay: `${idx * 60}ms` }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative z-10 h-full flex flex-col">
                  <p className="text-xs font-mono mb-4 border self-start px-3 py-1 rounded-full" style={{ color: 'var(--color-secondary-400)', borderColor: 'rgba(34,211,238,0.3)', backgroundColor: 'rgba(34,211,238,0.05)' }}>{project.category}</p>
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-200">{project.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed flex-grow mb-6">{project.description}</p>
                  <span className="flex items-center gap-2 text-sm font-medium text-white transition-colors duration-200 cursor-pointer" onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-primary-400)')} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'inherit')}>
                    Explore Architecture <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto overflow-hidden relative w-full px-6">
          <div className="absolute inset-y-0 left-0 w-8 md:w-24 z-20 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, ${themes[currentTheme].bg}, transparent)` }} />
          <div className="absolute inset-y-0 right-0 w-8 md:w-24 z-20 pointer-events-none" style={{ backgroundImage: `linear-gradient(to left, ${themes[currentTheme].bg}, transparent)` }} />
          <ul className="animate-marquee hover:cursor-grab active:cursor-grabbing list-none p-0" aria-label="Scrolling project showcase">
            {[...projects, ...projects].map((project, idx) => (
              <li key={idx} className="w-[280px] lg:w-[290px] shrink-0 group relative rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300 overflow-hidden backdrop-blur-sm hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative z-10 h-full flex flex-col">
                  <p className="text-xs font-mono mb-4 border self-start px-3 py-1 rounded-full" style={{ color: 'var(--color-secondary-400)', borderColor: 'rgba(34,211,238,0.3)', backgroundColor: 'rgba(34,211,238,0.05)' }}>{project.category}</p>
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-200">{project.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed flex-grow mb-6">{project.description}</p>
                  <span className="flex items-center gap-2 text-sm font-medium text-white transition-colors duration-200 cursor-pointer" onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-primary-400)')} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'inherit')}>
                    Explore Architecture <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}