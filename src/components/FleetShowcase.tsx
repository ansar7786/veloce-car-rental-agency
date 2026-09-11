import React, { useState, useEffect } from 'react';
import type { Vehicle } from '../types';
import { FLEET_DATA } from '../data/fleetData';
import { ArrowRight, ChevronLeft, ChevronRight, Gauge, Zap, Wind } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface FleetShowcaseProps {
  onSelectVehicle: (vehicle: Vehicle) => void;
  onReserveVehicle: (vehicle: Vehicle) => void;
}

// Subtle technical specification number animator
const AnimatedNumber: React.FC<{ value: number; duration?: number; decimals?: number }> = ({
  value,
  duration = 380,
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Fast ease-out quint
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = startVal + (value - startVal) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}</span>;
};

export const FleetShowcase: React.FC<FleetShowcaseProps> = ({
  onSelectVehicle,
  onReserveVehicle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');

  const categories = ['ALL', 'PERFORMANCE', 'SUPERCAR', 'LUXURY SUV', 'EXECUTIVE EV'];

  const filteredFleet = selectedCategory === 'ALL'
    ? FLEET_DATA
    : FLEET_DATA.filter((v) => v.category === selectedCategory);

  const activeVehicle = filteredFleet[currentIndex] || filteredFleet[0] || FLEET_DATA[0];

  const switchVehicle = (newIndex: number, direction: 'left' | 'right' = 'right') => {
    audioEngine.playClick();
    setTransitionDirection(direction);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsTransitioning(false);
    }, 240);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % filteredFleet.length;
    switchVehicle(next, 'right');
  };

  const handlePrev = () => {
    const prev = (currentIndex - 1 + filteredFleet.length) % filteredFleet.length;
    switchVehicle(prev, 'left');
  };

  const handleCategoryChange = (cat: string) => {
    audioEngine.playClick();
    setSelectedCategory(cat);
    setCurrentIndex(0);
  };

  // Parse numeric values for animated telemetry
  const hpNum = parseInt(activeVehicle.power.replace(/\D/g, ''), 10) || 440;
  const accelNum = parseFloat(activeVehicle.acceleration.replace(/[^0-9.]/g, '')) || 3.5;
  const speedNum = parseInt(activeVehicle.topSpeed.replace(/\D/g, ''), 10) || 300;

  return (
    <section id="fleet" className="relative w-full bg-[#080808] py-28 md:py-36 border-t border-white/[0.06]">
      {/* Background Lighting Flare */}
      <div className="absolute top-1/3 right-[-10%] w-[600px] h-[600px] rounded-full bg-[#C7FF3D]/[0.025] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-[-10%] w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[140px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-[#C7FF3D]" />
              <span className="font-mono text-xs tracking-[0.2em] text-[#C7FF3D] uppercase">
                THE CURATED FLEET
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.04em] text-[#F4F3EF] uppercase">
              CHOOSE YOUR MACHINE.
            </h2>
            <p className="mt-3 font-sans text-[#8B8B8B] text-base md:text-lg max-w-xl font-light">
              A curated collection of machines built for different kinds of moments. Maintained strictly to manufacturer track-spec standards.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`font-mono text-xs tracking-wider px-3.5 py-1.5 rounded transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-black font-semibold'
                    : 'bg-white/[0.04] text-[#8B8B8B] hover:text-[#F4F3EF] hover:bg-white/[0.08]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Large Editorial Vehicle Showcase Stage */}
        <div className="relative bg-[#0d0d0d] border border-white/[0.08] rounded-sm p-6 md:p-12 lg:p-16 overflow-hidden">
          
          {/* Subtle Stage Ambient Light */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-white/[0.02] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Vehicle Telemetry & Editorial Detail */}
            <div
              className={`lg:col-span-5 flex flex-col justify-between transition-all duration-300 ${
                isTransitioning
                  ? transitionDirection === 'right'
                    ? 'opacity-20 -translate-x-6'
                    : 'opacity-20 translate-x-6'
                  : 'opacity-100 translate-x-0'
              }`}
            >
              <div>
                {/* Index Order Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm tracking-[0.2em] text-[#C7FF3D] font-bold">
                    {activeVehicle.orderNumber}
                  </span>
                  <span className="font-mono text-xs tracking-widest text-[#8B8B8B] uppercase px-2.5 py-0.5 border border-white/10 rounded">
                    {activeVehicle.category}
                  </span>
                </div>

                {/* Model Title */}
                <div className="mb-6">
                  <span className="font-mono text-sm tracking-widest text-[#8B8B8B] block mb-1">
                    {activeVehicle.brand}
                  </span>
                  <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-[#F4F3EF] uppercase leading-tight">
                    {activeVehicle.model}
                  </h3>
                  <span className="font-mono text-sm text-[#C7FF3D] tracking-wider block mt-1">
                    {activeVehicle.variant}
                  </span>
                </div>

                {/* Animated Technical Specifications Grid */}
                <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/[0.08] my-6">
                  <div>
                    <div className="flex items-center gap-1 text-[#8B8B8B] mb-1">
                      <Zap size={13} className="text-[#C7FF3D]" />
                      <span className="font-mono text-[0.65rem] tracking-widest uppercase">POWER</span>
                    </div>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-[#F4F3EF]">
                      <AnimatedNumber key={`hp-${activeVehicle.id}`} value={hpNum} /> HP
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[#8B8B8B] mb-1">
                      <Gauge size={13} className="text-[#C7FF3D]" />
                      <span className="font-mono text-[0.65rem] tracking-widest uppercase">0–100</span>
                    </div>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-[#F4F3EF]">
                      <AnimatedNumber key={`acc-${activeVehicle.id}`} value={accelNum} decimals={1} /> SEC
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[#8B8B8B] mb-1">
                      <Wind size={13} className="text-[#C7FF3D]" />
                      <span className="font-mono text-[0.65rem] tracking-widest uppercase">V-MAX</span>
                    </div>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-[#F4F3EF]">
                      <AnimatedNumber key={`spd-${activeVehicle.id}`} value={speedNum} />
                    </span>
                  </div>
                </div>

                {/* Machine Summary Quote */}
                <p className="font-sans text-sm text-[#8B8B8B] italic mb-8 border-l-2 border-[#C7FF3D] pl-3 py-1">
                  "{activeVehicle.featuredQuote}"
                </p>
              </div>

              {/* Price & Actions */}
              <div className="pt-2">
                <div className="mb-6">
                  <span className="font-mono text-[0.7rem] tracking-widest text-[#8B8B8B] uppercase block">
                    STARTING AT
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl md:text-4xl font-extrabold text-[#F4F3EF]">
                      ₹<AnimatedNumber key={`prc-${activeVehicle.id}`} value={activeVehicle.pricePerDay} />
                    </span>
                    <span className="font-mono text-xs text-[#8B8B8B] tracking-wider">
                      / CALENDAR DAY
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      audioEngine.playClick();
                      onSelectVehicle(activeVehicle);
                    }}
                    className="btn-primary flex-1 min-w-[170px]"
                  >
                    <span>VIEW VEHICLE</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    onClick={() => {
                      audioEngine.playClick();
                      onReserveVehicle(activeVehicle);
                    }}
                    className="btn-lime px-6"
                  >
                    RESERVE
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Massive Studio Vehicle Visual with 3D Camera Transition Illusion */}
            <div className="lg:col-span-7 relative flex items-center justify-center min-h-[340px] md:min-h-[460px] perspective-1000">
              
              {/* Studio Light Disc Backdrop */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[85%] h-[75%] rounded-full bg-radial from-white/[0.04] to-transparent blur-3xl" />
              </div>

              {/* Animated Vehicle Image with Inertial Camera Transition */}
              <div
                className={`relative w-full transition-all duration-500 ease-out transform ${
                  isTransitioning
                    ? transitionDirection === 'right'
                      ? 'opacity-0 scale-90 translate-x-12 rotate-y-6'
                      : 'opacity-0 scale-90 -translate-x-12 -rotate-y-6'
                    : 'opacity-100 scale-100 translate-x-0 rotate-y-0'
                }`}
              >
                <img
                  src={activeVehicle.image}
                  alt={`${activeVehicle.brand} ${activeVehicle.model}`}
                  className="w-full h-auto max-h-[480px] object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.9)] transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>

              {/* Navigation Arrows */}
              <div className="absolute bottom-2 right-2 flex items-center gap-2 z-20">
                <button
                  onClick={handlePrev}
                  className="w-11 h-11 rounded-sm bg-black/60 border border-white/15 flex items-center justify-center text-white hover:bg-[#C7FF3D] hover:text-black hover:border-transparent transition-all cursor-pointer"
                  aria-label="Previous vehicle"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="w-11 h-11 rounded-sm bg-black/60 border border-white/15 flex items-center justify-center text-white hover:bg-[#C7FF3D] hover:text-black hover:border-transparent transition-all cursor-pointer"
                  aria-label="Next vehicle"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Carousel Thumb Strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {filteredFleet.map((vehicle, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={vehicle.id}
                onClick={() => switchVehicle(idx, idx > currentIndex ? 'right' : 'left')}
                className={`p-3 rounded-sm border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#181818] border-[#C7FF3D] shadow-[0_0_20px_rgba(199,255,61,0.12)]'
                    : 'bg-[#0e0e0e] border-white/[0.06] hover:border-white/[0.2] hover:bg-[#141414]'
                }`}
              >
                <div className="flex items-center justify-between mb-2 text-[0.65rem] font-mono">
                  <span className={isActive ? 'text-[#C7FF3D] font-bold' : 'text-[#8B8B8B]'}>
                    {vehicle.orderNumber}
                  </span>
                  <span className={isActive ? 'text-white font-bold' : 'text-[#8B8B8B]'}>
                    {vehicle.power}
                  </span>
                </div>

                <div className="h-14 w-full flex items-center justify-center overflow-hidden my-1">
                  <img
                    src={vehicle.image}
                    alt={vehicle.model}
                    className="max-h-full object-contain filter grayscale-[30%] hover:grayscale-0 transition-all"
                  />
                </div>

                <div className="mt-1">
                  <span className="font-display font-bold text-xs uppercase tracking-tight text-[#F4F3EF] block truncate">
                    {vehicle.brand} {vehicle.model}
                  </span>
                  <span className="font-mono text-[0.7rem] text-[#8B8B8B] block mt-0.5">
                    ₹{vehicle.pricePerDay.toLocaleString('en-IN')}/day
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
