export const THEMES = {
  minimal: { 
    name: 'White Minimal', 
    wrapperClass: 'p-3 sm:p-4 bg-white shadow-xl', 
    textClass: 'text-neutral-900 font-sans font-medium' 
  },
  polaroid: { 
    name: 'Retro Polaroid', 
    wrapperClass: 'p-4 sm:p-5 pb-8 sm:pb-12 bg-[#fdfaf5] shadow-md rounded-sm', 
    textClass: 'text-neutral-800 font-serif italic text-lg opacity-80' 
  },
  dark: { 
    name: 'Dark Cinematic', 
    wrapperClass: 'p-3 sm:p-4 bg-neutral-950 border border-neutral-800 shadow-2xl', 
    textClass: 'text-neutral-400 font-mono tracking-widest uppercase text-xs' 
  },
  rustic: { 
    name: 'Rustic Border', 
    wrapperClass: 'p-4 bg-stone-100 border-[6px] border-stone-200 rounded-xl shadow-lg', 
    textClass: 'text-stone-600 font-serif font-medium' 
  }
} as const;

export type ThemeId = keyof typeof THEMES;
