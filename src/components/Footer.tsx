import React from 'react';
import { ArrowRight } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface FooterProps {
  onStartJourney: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onStartJourney, onNavigate }) => {
  return (
    <footer className="relative w-full bg-[#050505] text-[#F4F3EF] border-t border-white/[0.08] pt-28 pb-16 overflow-hidden">
      
      {/* Background Subtle Lime Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full bg-[#C7FF3D]/[0.02] blur-[160px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Massive Call to Action */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-20 border-b border-white/[0.08] gap-10">
          <div>
            <span className="font-mono text-xs tracking-[0.25em] text-[#C7FF3D] uppercase block mb-3">
              YOUR TIME BEHIND THE WHEEL
            </span>
            <h2
              className="font-display font-black tracking-[-0.04em] uppercase text-[#F4F3EF] leading-[0.92]"
              style={{ fontSize: 'clamp(2.8rem, 6.5vw, 6.5rem)' }}
            >
              WHERE WILL YOU<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e2e2e2] to-[#777]">
                DRIVE NEXT?
              </span>
            </h2>
          </div>

          <div>
            <button
              onClick={() => {
                audioEngine.playClick();
                onStartJourney();
              }}
              className="btn-lime text-sm py-4 px-9 font-mono font-bold flex items-center gap-3 shadow-xl group"
            >
              <span>START YOUR JOURNEY</span>
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Middle Navigation & Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-16 border-b border-white/[0.08]">
          
          {/* Brand Column */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2.5 h-2.5 bg-[#C7FF3D] rounded-full shadow-[0_0_10px_#C7FF3D]" />
              <span className="font-display text-2xl font-black tracking-[-0.04em] uppercase text-white">
                VÉLOCÉ
              </span>
            </div>
            <p className="font-sans text-sm text-[#8B8B8B] leading-relaxed max-w-sm font-light mb-6">
              A private automotive rental house delivering curated high-performance and luxury machines to private runways, five-star valets, and discerning drivers.
            </p>
            <div className="flex items-center gap-2 font-mono text-xs text-[#C7FF3D]">
              <span className="w-2 h-2 rounded-full bg-[#C7FF3D] animate-ping" />
              <span>ALL HUBS ACTIVE • 24/7 CONCIERGE DISPATCH</span>
            </div>
          </div>

          {/* Quick Sections */}
          <div className="md:col-span-3">
            <span className="font-mono text-xs tracking-widest text-[#8B8B8B] uppercase block mb-4">
              EXPERIENCE
            </span>
            <ul className="space-y-3 font-mono text-xs text-[#F4F3EF]">
              {[
                { name: 'THE FLEET', id: 'fleet' },
                { name: 'DELIVERY PROTOCOL', id: 'experience' },
                { name: 'STRATEGIC HUBS', id: 'locations' },
                { name: 'THE JOURNAL', id: 'journal' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      audioEngine.playClick();
                      onNavigate(link.id);
                    }}
                    className="hover:text-[#C7FF3D] transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Hubs */}
          <div className="md:col-span-2">
            <span className="font-mono text-xs tracking-widest text-[#8B8B8B] uppercase block mb-4">
              LOCATIONS
            </span>
            <ul className="space-y-3 font-mono text-xs text-[#8B8B8B]">
              <li className="hover:text-white transition-colors">MUMBAI</li>
              <li className="hover:text-white transition-colors">DELHI NCR</li>
              <li className="hover:text-white transition-colors">BANGALORE</li>
              <li className="hover:text-white transition-colors">HYDERABAD</li>
              <li className="hover:text-white transition-colors">GOA</li>
            </ul>
          </div>

          {/* Concierge Hotline */}
          <div className="md:col-span-3">
            <span className="font-mono text-xs tracking-widest text-[#8B8B8B] uppercase block mb-4">
              DIRECT CONCIERGE
            </span>
            <div className="space-y-2 font-mono text-xs text-[#F4F3EF]">
              <p className="text-[#C7FF3D] font-bold">+91 1800 911 8800</p>
              <p className="text-[#8B8B8B]">concierge@veloce-machines.com</p>
              <p className="text-[#8B8B8B] pt-2">PRIVATE HANGAR 4, BOM CSMI AIRPORT</p>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Credits */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between text-[0.7rem] font-mono text-[#8B8B8B] gap-4">
          <div className="flex items-center gap-6">
            <span>© 2026 VÉLOCÉ AUTOMOTIVE. ALL RIGHTS RESERVED.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">TERMS OF CUSTODY</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">TRACK SAFETY PROTOCOL</span>
          </div>

          <div className="flex items-center gap-2">
            <span>18.9220° N, 72.8347° E</span>
            <span>•</span>
            <span className="text-white/60">CRAFTED FOR THE DRIVER</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
