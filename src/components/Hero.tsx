import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Play, Zap, ShieldCheck } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface HeroProps {
  onExploreFleet: () => void;
  onOpenReservation: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreFleet, onOpenReservation }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [soundIgnited, setSoundIgnited] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Staged commercial reveal sequence
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleIgnition = () => {
    audioEngine.playIgnition();
    setSoundIgnited(true);
    setTimeout(() => setSoundIgnited(false), 2000);
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-[#080808] flex flex-col justify-between overflow-hidden pt-24 md:pt-28 pb-12 select-none"
      id="hero"
    >
      {/* Background Cinematic Atmosphere & Radial Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Soft studio light directly above car */}
        <div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[50vh] rounded-full blur-[140px] opacity-40 transition-opacity duration-700 pointer-events-none"
          style={{
            background: isHovered
              ? 'radial-gradient(circle, rgba(199, 255, 61, 0.12) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, rgba(199, 255, 61, 0.03) 40%, transparent 70%)',
          }}
        />

        {/* Studio Floor Grid Texture */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[45vh] opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'linear-gradient(to top, black 20%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 95%)',
            transform: 'perspective(600px) rotateX(60deg) translateY(120px)',
            transformOrigin: 'bottom center'
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
              PREMIUM CAR RENTALS
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-[0.75rem] font-mono tracking-widest text-[#8B8B8B]">
            <span>CHASSIS REF // VLC-992</span>
            <span>FLEET STATUS: IMMACULATE</span>
            <span className="text-[#F4F3EF]">MUMBAI • DELHI • BANGALORE</span>
          </div>
        </div>

        {/* Central Vehicle & Massive Typographic Composition */}
        <div className="relative my-auto py-8 md:py-12 flex flex-col items-center justify-center">
          
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
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#F4F3EF] via-[#d4d4d4] to-[#555]">
                WHAT MOVES
              </span><br />
              YOU.
            </h1>
          </div>

          {/* Focal Vehicle Stage with Parallax and Hover HUD */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleIgnition}
            className="relative w-full max-w-[1100px] -mt-16 md:-mt-32 lg:-mt-44 z-20 cursor-pointer group"
            title="Click to ignite Porsche 911 Flat-6 engine"
            style={{
              transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 12}px, 0)`,
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Vehicle Shadow and Ground Reflections */}
            <div
              className="absolute -bottom-6 md:-bottom-10 left-[8%] right-[8%] h-12 md:h-20 rounded-full blur-2xl pointer-events-none transition-all duration-500"
              style={{
                background: isHovered
                  ? 'radial-gradient(ellipse at center, rgba(199, 255, 61, 0.35) 0%, rgba(0,0,0,0.95) 70%, transparent 100%)'
                  : 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.95) 0%, rgba(0,0,0,0.85) 60%, transparent 100%)',
                transform: isHovered ? 'scale(1.06)' : 'scale(1)'
              }}
            />

            {/* Vehicle Image */}
            <div className="relative overflow-visible">
              <img
                src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=2400&q=88"
                alt="Porsche 911 Carrera S in Cinematic Dark Studio"
                className={`w-full object-contain filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)] transition-all duration-700 ease-out ${
                  isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
                }`}
                style={{
                  transitionDelay: '400ms',
                  transform: isHovered ? 'scale(1.03) translateY(-4px)' : 'scale(1) translateY(0)'
                }}
              />

              {/* Electric Rim Light Overlay Glow on Hover */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                  opacity: isHovered ? 0.35 : 0,
                  background: 'radial-gradient(ellipse at 50% 80%, rgba(199, 255, 61, 0.4) 0%, transparent 60%)'
                }}
              />
            </div>

            {/* Interactive Specification HUD Overlay Pill */}
            <div
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-500 pointer-events-none ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex items-center gap-3 md:gap-5 px-5 py-2.5 rounded-full bg-black/85 backdrop-blur-xl border border-white/20 shadow-2xl">
                <span className="font-mono text-xs font-bold text-[#C7FF3D] tracking-wider">
                  PORSCHE 911 CARRERA S
                </span>
                <span className="text-white/20">|</span>
                <span className="font-mono text-xs text-[#F4F3EF] tracking-wider">443 HP</span>
                <span className="text-white/20">|</span>
                <span className="font-mono text-xs text-[#F4F3EF] tracking-wider">3.5 SEC</span>
                <span className="text-white/20">|</span>
                <span className="font-mono text-xs text-[#8B8B8B] tracking-wider">PDK AUTOMATIC</span>
              </div>
            </div>

            {/* Subtle Interactive Hint */}
            <div className="absolute top-2 right-4 md:right-8 hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-[0.7rem] font-mono tracking-wider text-[#8B8B8B] group-hover:border-[#C7FF3D]/40 group-hover:text-[#F4F3EF] transition-all">
              <Play size={10} className="text-[#C7FF3D]" />
              <span>{soundIgnited ? 'IGNITION ACTIVE' : 'CLICK VEHICLE FOR IGNITION'}</span>
            </div>
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
              Exceptional machines. Exceptional journeys. Crafted for drivers who understand that how you arrive is everything.
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
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
        onClick={onExploreFleet}
      >
        <span className="font-mono text-[0.65rem] tracking-[0.25em] text-[#8B8B8B] uppercase">SCROLL TO EXPLORE</span>
        <div className="w-[1px] h-6 bg-gradient-to-b from-[#C7FF3D] to-transparent animate-pulse" />
      </div>
    </section>
  );
};
