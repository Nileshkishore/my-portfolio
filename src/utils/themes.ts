// src/utils/themes.ts

export type ThemeType = 'fuchsia' | 'ocean' | 'forest' | 'sunset' | 'white';

export const themes: Record<ThemeType, { primary: string; secondary: string; accent: string; glow: string; bg: string; bgGradient: string }> = {
  fuchsia: { primary: 'fuchsia', secondary: 'cyan',  accent: 'violet', glow: 'rgba(139, 92, 246, 0.12)', bg: '#030014', bgGradient: 'fuchsia-600 cyan-600 violet-600' },
  ocean:   { primary: 'blue',    secondary: 'cyan',  accent: 'teal',   glow: 'rgba(30, 144, 255, 0.12)',  bg: '#0a0e27', bgGradient: 'blue-600 cyan-600 teal-600' },
  forest:  { primary: 'emerald', secondary: 'teal',  accent: 'green',  glow: 'rgba(16, 185, 129, 0.12)',  bg: '#050f0a', bgGradient: 'emerald-600 teal-600 green-600' },
  sunset:  { primary: 'orange',  secondary: 'amber', accent: 'rose',   glow: 'rgba(249, 115, 22, 0.12)',  bg: '#1a0f05', bgGradient: 'orange-600 amber-600 rose-600' },
  white:   { primary: 'slate',   secondary: 'zinc',  accent: 'gray',   glow: 'rgba(0, 0, 0, 0.15)',      bg: '#ffffff', bgGradient: 'slate-600 zinc-600 gray-600' },
};