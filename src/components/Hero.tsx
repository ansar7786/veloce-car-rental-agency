import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, ShieldCheck, Play } from 'lucide-react';
import { Vehicle3DViewer } from './Vehicle3DViewer';
import { audioEngine } from '../utils/audioEngine';

interface HeroProps {
  onExploreFleet: () => void;
  onOpenReservation: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreFleet, onOpenReservation }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [soundIgnited, setSoundIgnited] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Staged commercial reveal sequence
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleIgnition = () => {
    audioEngine.playIgnition();
    setSoundIgnited(true);
    setTimeout(() => setSoundIgnited(false), 2000);
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full bg-[#080808] flex flex-col justify-between overflow-hidden pt-24 md:pt-28 pb-12 select-none"
      id="hero"
    >
      {/* Background Cinematic Atmosphere & Radial Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Soft studio light directly above car */}
        <div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[50vh] rounded-full blur-[140px] opacity-40 transition-opacity duration-700 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(199, 255, 61, 0.08) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%)',
          }}
        />

        {/* Ambient Top Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/90 via-transparent to-[#080808] pointer-events-none" />
      </div>

      {/* Main Composition Container */}
      <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 md:px-12 flex-1 flex flex-col justify-between">
        
        {/* Top Telemetry & Eyebrow */}
        <div
          className={`flex items-center justify-between transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#C7FF3D] animate-ping" />
            <span className="font-mono text-xs tracking-[0.2em] text-[#C7FF3D] font-medium uppercase">
              3D DIGITAL ATELIER • INTERACTIVE LAUNCH
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-[0.75rem] font-mono tracking-widest text-[#8B8B8B]">
            <span>CHASSIS REF // VLC-992</span>
            <span>REAL-TIME PBR ENGINE: ACTIVE</span>
            <button
              onClick={handleIgnition}
              className="flex items-center gap-1.5 text-[#C7FF3D] hover:underline cursor-pointer"
            >
              <Play size={10} className="fill-[#C7FF3D]" />
              <span>{soundIgnited ? 'FLAT-6 IGNITED' : 'IGNITE ENGINE'}</span>
            </button>
          </div>
        </div>

        {/* Central 3D Vehicle & Enormous Typographic Composition */}
        <div className="relative my-auto py-4 flex flex-col items-center justify-center">
          
          {/* Backplate Enormous Headline */}
          <div
            className={`w-full text-center transition-all duration-1000 ease-out z-0 pointer-events-none ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <h1
              className="font-display font-black tracking-[-0.05em] uppercase text-[#F4F3EF] leading-[0.88] select-none"
              style={{
                fontSize: 'clamp(3.8rem, 11vw, 9.8rem)',
                textShadow: '0 20px 80px rgba(0,0,0,0.95)'
              }}
            >
              DRIVE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#F4F3EF] via-[#d4d4d4] to-[#444]">
                WHAT MOVES
              </span><br />
              YOU.
            </h1>
          </div>

          {/* Focal Real-Time 3D Vehicle Experience */}
          <div className="relative w-full max-w-[1280px] -mt-16 md:-mt-28 lg:-mt-40 z-20">
            <Vehicle3DViewer
              onVehicleIgnited={handleIgnition}
              onExploreFleet={onExploreFleet}
              onOpenReservation={onOpenReservation}
            />
          </div>
        </div>

        {/* Bottom Narrative & Action Cluster */}
        <div
          className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-end transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          {/* Subtitle / Philosophy */}
          <div className="md:col-span-6 lg:col-span-5">
            <p className="font-sans text-base md:text-lg text-[#8B8B8B] font-light leading-relaxed max-w-md">
              Exceptional machines. Exceptional journeys. Orbit, inspect aerodynamics, and customize your machine before stepping onto the tarmac.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs font-mono text-[#8B8B8B]">
              <span className="flex items-center gap-1.5 text-[#F4F3EF]">
                <ShieldCheck size={14} className="text-[#C7FF3D]" /> Zero Counter Waiting
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-[#F4F3EF]">
                <Zap size={14} className="text-[#C7FF3D]" /> Direct Runway Handover
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-wrap items-center justify-start md:justify-end gap-4">
            <button
              onClick={() => {
                audioEngine.playClick();
                onExploreFleet();
              }}
              className="btn-primary group"
            >
              <span>EXPLORE THE FLEET</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            <button
              onClick={() => {
                audioEngine.playClick();
                onOpenReservation();
              }}
              className="btn-secondary"
            >
              RESERVE A CAR
            </button>
          </div>
        </div>
      </div>

      {/* Downward Continuity Transition Indicator */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer z-20"
        onClick={onExploreFleet}
      >
        <span className="font-mono text-[0.65rem] tracking-[0.25em] text-[#8B8B8B] uppercase">SCROLL TO FLEET</span>
        <div className="w-[1px] h-6 bg-gradient-to-b from-[#C7FF3D] to-transparent animate-pulse" />
      </div>
    </section>
  );
};
