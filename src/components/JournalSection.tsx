import React, { useState } from 'react';
import { JOURNAL_ARTICLES } from '../data/journalData';
import type { JournalArticle } from '../types';
import { ArrowUpRight, X } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export const JournalSection: React.FC = () => {
  const [activeArticle, setActiveArticle] = useState<JournalArticle | null>(null);

  const openArticle = (article: JournalArticle) => {
    audioEngine.playClick();
    setActiveArticle(article);
  };

  return (
    <section id="journal" className="relative w-full bg-[#080808] py-28 md:py-36 border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-[#C7FF3D]" />
              <span className="font-mono text-xs tracking-[0.2em] text-[#C7FF3D] uppercase">
                EDITORIAL DISPATCHES
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.04em] text-[#F4F3EF] uppercase">
              THE JOURNAL.
            </h2>
            <p className="mt-3 font-sans text-[#8B8B8B] text-base md:text-lg max-w-xl font-light">
              Essays on mechanical telemetry, driving psychology, and the cultural philosophy of velocity.
            </p>
          </div>

          <div className="hidden md:block">
            <span className="font-mono text-xs text-[#8B8B8B] tracking-widest uppercase">
              CURATED BY VÉLOCÉ ATELIER
            </span>
          </div>
        </div>

        {/* 3 Editorial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {JOURNAL_ARTICLES.map((article) => (
            <article
              key={article.id}
              onClick={() => openArticle(article)}
              className="group cursor-pointer bg-[#0e0e0e] border border-white/[0.08] hover:border-white/20 transition-all duration-500 rounded-sm overflow-hidden flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover filter brightness-75 group-hover:brightness-95 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />
                <div className="absolute top-4 left-4 font-mono text-[0.65rem] tracking-widest text-[#C7FF3D] bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-sm border border-white/10">
                  {article.tag}
                </div>
              </div>

              {/* Text Meta */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs font-mono text-[#8B8B8B] mb-3">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="font-display text-xl md:text-2xl font-bold text-[#F4F3EF] uppercase tracking-tight group-hover:text-[#C7FF3D] transition-colors mb-3 leading-snug">
                    {article.title}
                  </h3>

                  <p className="font-sans text-sm text-[#8B8B8B] leading-relaxed font-light line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs text-[#F4F3EF]">
                  <span className="group-hover:text-[#C7FF3D] transition-colors">READ ESSAY</span>
                  <ArrowUpRight size={15} className="text-[#C7FF3D] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8">
          <div className="relative w-full max-w-3xl bg-[#0e0e0e] border border-white/15 rounded-sm overflow-hidden my-auto p-6 md:p-12 shadow-2xl animate-hero-text">
            
            <button
              onClick={() => {
                audioEngine.playClick();
                setActiveArticle(null);
              }}
              className="absolute top-6 right-6 w-9 h-9 rounded-sm bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#F4F3EF] hover:text-[#C7FF3D] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 text-xs font-mono text-[#C7FF3D] mb-3">
              <span>{activeArticle.tag}</span>
              <span>•</span>
              <span>{activeArticle.readTime}</span>
            </div>

            <h3 className="font-display text-3xl md:text-4xl font-extrabold uppercase text-[#F4F3EF] mb-6">
              {activeArticle.title}
            </h3>

            <div className="h-64 rounded-sm overflow-hidden mb-6">
              <img src={activeArticle.image} alt={activeArticle.title} className="w-full h-full object-cover" />
            </div>

            <p className="font-sans text-base md:text-lg text-[#d4d4d4] leading-relaxed font-light mb-6">
              {activeArticle.summary}
            </p>

            <p className="font-sans text-sm text-[#8B8B8B] leading-relaxed font-light">
              Modern automotive culture has become obsessed with lap times, 0-to-100 sprints, and specification sheets. Yet behind the wheel of a truly engineered machine, those numbers fade. The pulse of the hydraulic steering rack, the mechanical crescendo of six individual throttle bodies, and the scent of heated brake pads form a language older than data. At VÉLOCÉ, every vehicle in the fleet is chosen because it speaks that language fluently.
            </p>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button
                onClick={() => {
                  audioEngine.playClick();
                  setActiveArticle(null);
                }}
                className="btn-secondary text-xs py-2.5 px-6"
              >
                CLOSE DISPATCH
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
