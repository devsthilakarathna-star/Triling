/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { Search, Volume2, Languages, Book, Info, Loader2, ExternalLink, GraduationCap, Play, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTranslations, TranslationResult } from './services/gemini';

const speak = (text: string, lang: 'en' | 'ta' | 'si') => {
  if (!window.speechSynthesis) return;
  
  // Stop any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Attempt to find best voice
  const voices = window.speechSynthesis.getVoices();
  if (lang === 'en') {
    utterance.lang = 'en-US';
  } else if (lang === 'ta') {
    utterance.lang = 'ta-IN';
  } else if (lang === 'si') {
    utterance.lang = 'si-LK';
  }

  window.speechSynthesis.speak(utterance);
};

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getTranslations(input);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const openYouGlish = (text: string) => {
    window.open(`https://youglish.com/pronounce/${encodeURIComponent(text)}/english`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e2e2e7] font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-[#232328] bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Languages size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Trilingo</h1>
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-[0.2em]">Syllabic Learning Suite</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-neutral-400">
            <a href="#" className="text-indigo-400 border-b border-indigo-400 pb-1">Translator</a>
            <a href="#" className="hover:text-white transition-colors text-[10px] uppercase tracking-widest">v1.5</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Search Section */}
        <section className="mb-12">
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter word or phrase to translate..."
              className="w-full h-32 p-6 rounded-2xl bg-[#16161a] border border-[#232328] text-[#e2e2e7] text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-neutral-600 shadow-xl resize-none font-medium"
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={handleSearch}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:scale-100 transition-all flex items-center gap-2 group"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Search size={18} className="group-hover:scale-110 transition-transform" />
                )}
                {loading ? 'Processing...' : 'Translate'}
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs text-neutral-500 uppercase tracking-widest font-semibold flex items-center gap-2 opacity-60">
            <Info size={12} />
            Tip: Press Enter for Syllable breakdown and Native TTS
          </p>
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-red-900/20 text-red-400 rounded-2xl text-center font-medium border border-red-900/30 mb-8"
            >
              {error}
            </motion.div>
          )}

          {result && (
            <div className="flex flex-col gap-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* English Card */}
                <LanguageCard
                  title="English"
                  langCode="en"
                  data={result.english}
                  accent="indigo"
                  onWatch={() => openYouGlish(result.english.text)}
                />

                {/* Tamil Card */}
                <LanguageCard
                  title="Tamil | தமிழ்"
                  langCode="ta"
                  data={result.tamil}
                  accent="neutral"
                />

                {/* Sinhala Card */}
                <LanguageCard
                  title="Sinhala | සිංහල"
                  langCode="si"
                  data={result.sinhala}
                  accent="neutral"
                />
              </motion.div>

              {/* Bottom Details Section */}
              <div className="flex flex-col gap-12">
                {/* Dictionary Section */}
                <div className="bg-[#16161a] border border-[#232328] rounded-2xl overflow-hidden flex flex-col shadow-sm">
                  <div className="px-6 py-4 border-b border-[#232328] flex items-center justify-between bg-[#1b1b21]/50">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Contextual Meanings & Dictionary Analysis</h3>
                    </div>
                  </div>
                  <div className="p-8">
                    {result.english.meanings && result.english.meanings.length > 0 ? (
                      <div className="space-y-6">
                        {result.english.meanings.map((meaning, idx) => (
                          <div key={idx} className="flex gap-6 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${idx * 100}ms` }}>
                             <span className="text-neutral-600 font-black text-sm pt-1">0{idx + 1}</span>
                             <p className="text-lg leading-relaxed font-serif italic text-neutral-300">
                               "{meaning}"
                             </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                       <div className="flex flex-col items-center justify-center py-12 text-neutral-600 gap-4 text-center">
                         <Book size={48} strokeWidth={1} />
                         <p className="text-xs uppercase tracking-[0.3em] font-bold opacity-40">Detailed definitions appear for specific words</p>
                       </div>
                    )}
                    
                    {result.english.grammarNote && (
                      <div className="mt-8 pt-8 border-t border-[#232328] flex gap-4">
                        <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Instructional Note</h4>
                          <p className="text-sm text-neutral-400 leading-relaxed italic">{result.english.grammarNote}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Support Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#16161a] border border-[#232328] rounded-2xl p-8 flex flex-col items-center text-center group bg-gradient-to-br from-indigo-900/10 to-transparent"
                >
                  <div className="w-16 h-16 rounded-full bg-[#ff0000] shadow-xl shadow-red-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Youtube className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 font-serif italic">Watch Pronunciation</h3>
                  <p className="text-xs text-neutral-400 mb-8 max-w-sm leading-relaxed">
                    View native speakers pronouncing <span className="text-indigo-400 font-bold">"{result.english.text}"</span> flawlessly in real-world contexts on YouGlish.
                  </p>
                  <button 
                    onClick={() => openYouGlish(result.english.text)}
                    className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-lg"
                  >
                    Watch on YouGlish
                    <ExternalLink size={14} />
                  </button>
                </motion.div>

                {/* Examples Section */}
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-[#232328]" />
                    <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em] flex items-center gap-2 text-center">
                      <GraduationCap size={14} className="text-indigo-400" />
                      Interactive Usage & Syllable Guide
                    </h3>
                    <div className="h-px flex-1 bg-[#232328]" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* English Examples */}
                    <ExampleColumn 
                      title="English Context" 
                      icon={<span className="text-indigo-400 font-bold">EN</span>}
                      examples={result.examples.map(ex => ex.english)}
                      accentColor="border-indigo-500/20"
                      lang="en"
                    />
                    {/* Tamil Examples */}
                    <ExampleColumn 
                      title="Tamil Context" 
                      icon={<span className="text-orange-400 font-bold">TA</span>}
                      examples={result.examples.map(ex => ex.tamil)}
                      accentColor="border-orange-500/20"
                      lang="ta"
                    />
                    {/* Sinhala Examples */}
                    <ExampleColumn 
                      title="Sinhala Context" 
                      icon={<span className="text-emerald-400 font-bold">SI</span>}
                      examples={result.examples.map(ex => ex.sinhala)}
                      accentColor="border-emerald-500/20"
                      lang="si"
                    />
                  </div>
                </section>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Developer Footer Section */}
      <footer className="mt-auto border-t border-white/5 bg-[#0a0a0c]/90 backdrop-blur-xl sticky bottom-0 z-40">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Developer:</span>
                <span className="text-sm font-semibold text-white">Shehan Thilakarathna</span>
              </div>
              <span className="hidden md:inline text-neutral-800">|</span>
              <div className="flex items-center gap-4">
                <a 
                  href="mailto:sthilakarathna@gmail.com" 
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest border-b border-transparent hover:border-indigo-400 pb-0.5"
                >
                  Email Developer
                </a>
                <a 
                  href="https://wa.me/94779012471" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest border-b border-transparent hover:border-emerald-400 pb-0.5"
                >
                  Connect on WhatsApp
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-neutral-600 uppercase tracking-widest font-black leading-none mb-1">sthilakarathna@gmail.com</span>
                <span className="text-[9px] text-neutral-600 uppercase tracking-widest font-black leading-none">WhatsApp: 0779012471</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ExampleColumn({ title, icon, examples, accentColor, lang }: { title: string, icon: React.ReactNode, examples: { text: string, pronunciation: string }[], accentColor: string, lang: 'en' | 'ta' | 'si' }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 px-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-[#16161a] border ${accentColor} text-xs`}>
          {icon}
        </div>
        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{title}</h4>
      </div>
      <div className="space-y-4">
        {examples.map((ex, i) => (
          <div key={i} className="p-5 bg-[#16161a] border border-[#232328] rounded-2xl hover:border-indigo-500/20 transition-colors group relative">
            <button 
              onClick={() => speak(ex.text, lang)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
            >
              <Volume2 size={12} className="text-indigo-400" />
            </button>
            <p className="text-sm text-neutral-200 leading-relaxed font-medium group-hover:text-white transition-colors pr-8">{ex.text}</p>
            <div className={`mt-3 flex items-center gap-2 text-[10px] font-mono font-bold italic tracking-tight ${lang === 'en' ? 'text-indigo-400/90' : 'text-neutral-500'}`}>
              <div className="w-1 h-1 rounded-full bg-current opacity-30" />
              {ex.pronunciation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguageCard({ 
  title, 
  data, 
  accent = 'neutral',
  onWatch
}: { 
  title: string; 
  langCode: string;
  data: any; 
  accent?: 'indigo' | 'neutral';
  onWatch?: () => void;
}) {
  const lang: 'en' | 'ta' | 'si' = title.toLowerCase().includes('english') ? 'en' : title.toLowerCase().includes('tamil') ? 'ta' : 'si';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#16161a] border border-[#232328] rounded-2xl p-7 flex flex-col justify-between shadow-sm hover:border-indigo-500/30 transition-all hover:bg-[#1b1b21] relative group"
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">
            {title}
          </span>
          {accent === 'indigo' && (
            <span className="px-2 py-0.5 bg-neutral-800 rounded text-[9px] text-neutral-400 font-mono tracking-tighter uppercase opacity-60">Syllable Mode</span>
          )}
        </div>
        <h2 className={`text-2xl font-semibold leading-relaxed ${accent === 'indigo' ? 'text-white' : 'text-indigo-100'}`}>
          {data.text}
        </h2>
        
        {/* Syllable/Phonetic Highlight */}
        <div className={`mt-4 py-2 px-3 rounded-lg flex items-center gap-3 text-xs font-mono font-bold italic tracking-tight border-l-2 transition-colors ${accent === 'indigo' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500' : 'bg-neutral-800/40 text-neutral-500 border-neutral-700'}`}>
           <Volume2 size={16} className="opacity-40" />
           {data.pronunciation}
        </div>
      </div>

      <div className="mt-8 pt-6 flex flex-col gap-3">
        <button
          onClick={() => speak(data.text, lang)}
          className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#e2e2e7] transition-all"
        >
          <Play size={14} className="fill-current" />
          Listen Native Audio
        </button>
        {onWatch && (
          <button
            onClick={onWatch}
            className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-neutral-600 hover:text-red-500 transition-colors"
          >
            <Youtube size={12} />
            Watch on YouTube
          </button>
        )}
      </div>
    </motion.div>
  );
}
