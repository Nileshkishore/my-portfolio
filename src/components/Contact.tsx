import React from 'react';
import { ThemeType } from '../utils/themes';

interface ContactProps {
  currentTheme: ThemeType;
}

// ─── Dynamic Data Array ────────────────────────────────────────────────────
const contactData = [
  {
    id: 'email',
    label: 'nileshkishore2001@gmail.com',
    href: 'mailto:nileshkishore2001@gmail.com',
    hoverColor: 'var(--color-primary-400)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    )
  },
  {
    id: 'phone',
    label: '+91 74886 02895',
    href: 'tel:+917488602895',
    hoverColor: 'var(--color-secondary-400)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.58 2.72h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    )
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/Nileshkishore',
    hoverColor: 'var(--color-primary-400)',
    external: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    )
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/nilesh-kishore-1b70381b2',
    hoverColor: '#60a5fa', // Brand color for LinkedIn
    external: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  }
];

export default function Contact({ currentTheme }: ContactProps) {
  // Helper to determine the default text color based on the theme
  const defaultColor = currentTheme === 'white' ? '#475569' : '#cbd5e1';

  return (
    <section id="contact" className="max-w-4xl mx-auto px-6 py-16 relative z-10 border-t border-white/5 scroll-mt-20 text-center" aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="text-3xl font-bold mb-4">Let's Connect</h2>
      <p className="text-slate-400 mb-8 max-w-xl mx-auto">
        Open to MLOps, ML engineering, data engineering, and LLM roles — feel free to reach out.
      </p>

      <address className="not-italic flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 text-sm font-medium">
        {contactData.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            className="flex items-center gap-2 text-slate-300 transition-colors duration-300"
            onMouseEnter={(e) => (e.currentTarget.style.color = item.hoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = defaultColor)}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </address>
    </section>
  );
}