import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const ExperienceSection: React.FC = () => {
  const experiences = [
    {
      num: '01',
      title: 'DELIVERY',
      subtitle: 'WHEREVER YOU LAND',
      desc: 'Your vehicle arrives where you need it. Direct runway private aviation tarmac handovers, five-star hotel valet arrivals, or personal residence drop-offs. Zero queues, zero paperwork counters.',
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
      specs: 'LEAD TIME: < 45 MIN • FULL CONCIERGE BRIEFING'
    },
    {
      num: '02',
      title: 'FREEDOM',
      subtitle: 'UNCOMPLICATED VELOCITY',
      desc: 'Flexible journeys without the usual car rental friction. Digital vehicle custody, unconstrained state border crossings, flexible return extensions, and comprehensive track-grade insurance coverage.',
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
      specs: 'ZERO DEDUCTIBLE • 24/7 ROADSIDE TELEMETRY'
    },
    {
      num: '03',
      title: 'MACHINES',
      subtitle: 'CURATED FOR ENTHUSIASTS',
      desc: 'A fleet selected exclusively for drivers who understand weight transfer, throttle modulation, and mechanical harmony. Every machine is maintained strictly to factory track-spec tolerances.',
      image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
      specs: 'TRACK SPEC • FACTORY TUNED • 100% HEALTH'
    }
  ];

  return (
    <section id="experience" className="relative w-full bg-[#080808] py-28 md:py-36 border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-[#C7FF3D]" />
            <span className="font-mono text-xs tracking-[0.2em] text-[#C7FF3D] uppercase">
              THE VÉLOCÉ PHILOSOPHY
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.04em] text-[#F4F3EF] uppercase">
            MORE THAN A RENTAL.
          </h2>
          <p className="mt-3 font-sans text-[#8B8B8B] text-base md:text-lg max-w-xl font-light">
            We operate at the intersection of private aviation discretion and high-performance automotive obsession.
          </p>
        </div>

        {/* 3 Editorial Experience Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experiences.map((exp) => (
            <div
              key={exp.num}
              className="group relative bg-[#0e0e0e] border border-white/[0.08] hover:border-white/25 transition-all duration-500 rounded-sm overflow-hidden flex flex-col justify-between"
            >
              {/* Image Banner */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover filter brightness-[0.75] group-hover:brightness-90 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />
                
                {/* Number Badge */}
                <div className="absolute top-4 left-4 font-mono text-xs font-bold px-2.5 py-1 bg-black/80 backdrop-blur-md text-[#C7FF3D] border border-white/10 rounded-sm">
                  {exp.num}
                </div>
              </div>

              {/* Text Description */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[0.65rem] tracking-[0.2em] text-[#8B8B8B] uppercase block mb-1">
                    {exp.subtitle}
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-[#F4F3EF] uppercase tracking-tight mb-4">
                    {exp.title}
                  </h3>
                  <p className="font-sans text-sm text-[#8B8B8B] leading-relaxed font-light">
                    {exp.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-[0.7rem] font-mono text-[#8B8B8B]">
                  <span>{exp.specs}</span>
                  <ArrowUpRight size={14} className="text-[#C7FF3D] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
