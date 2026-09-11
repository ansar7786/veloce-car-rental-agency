import React, { useState } from 'react';
import { CITY_HUBS } from '../data/locationsData';
import { Clock, ArrowRight } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface LocationsSectionProps {
  onReserveCity: (cityName: string) => void;
}

export const LocationsSection: React.FC<LocationsSectionProps> = ({ onReserveCity }) => {
  const [activeCityId, setActiveCityId] = useState<string>(CITY_HUBS[0].id);

  const activeCity = CITY_HUBS.find((c) => c.id === activeCityId) || CITY_HUBS[0];

  return (
    <section id="locations" className="relative w-full bg-[#080808] py-28 md:py-36 border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-[#C7FF3D]" />
            <span className="font-mono text-xs tracking-[0.2em] text-[#C7FF3D] uppercase">
              STRATEGIC OPERATIONAL HUBS
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.04em] text-[#F4F3EF] uppercase">
            WHERE WE DRIVE.
          </h2>
          <p className="mt-3 font-sans text-[#8B8B8B] text-base md:text-lg max-w-xl font-light">
            Active private lounges and dedicated flight line tarmac delivery across key metropolitan hubs.
          </p>
        </div>

        {/* Interactive Location Showcase Container */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#0c0c0c] border border-white/[0.08] rounded-sm overflow-hidden p-6 md:p-12">
          
          {/* Left Column: Interactive City Selectors */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              {CITY_HUBS.map((city) => {
                const isActive = city.id === activeCityId;
                return (
                  <div
                    key={city.id}
                    onMouseEnter={() => {
                      audioEngine.playClick();
                      setActiveCityId(city.id);
                    }}
                    onClick={() => {
                      audioEngine.playClick();
                      setActiveCityId(city.id);
                    }}
                    className={`group p-5 rounded-sm border cursor-pointer transition-all duration-300 flex items-center justify-between ${
                      isActive
                        ? 'bg-[#181818] border-[#C7FF3D] translate-x-1 shadow-lg'
                        : 'bg-[#101010] border-white/[0.05] hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`font-display text-2xl md:text-3xl font-extrabold uppercase tracking-tight ${
                          isActive ? 'text-[#C7FF3D]' : 'text-[#F4F3EF] group-hover:text-white'
                        }`}>
                          {city.name}
                        </h3>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#C7FF3D] animate-ping" />
                        )}
                      </div>
                      <span className="font-mono text-xs text-[#8B8B8B] tracking-wider block mt-1">
                        {city.coordinates}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs text-[#C7FF3D] font-bold block">
                        {city.fleetCount} MACHINES
                      </span>
                      <span className="font-mono text-[0.65rem] text-[#8B8B8B] uppercase">
                        {city.leadTime}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="font-mono text-xs text-[#8B8B8B]">
                EXPANDING TO CHENNAI & JAIPUR Q4 2026
              </span>
              <button
                onClick={() => onReserveCity(activeCity.name)}
                className="btn-lime text-xs py-2.5 px-5 font-mono font-bold flex items-center gap-2"
              >
                <span>RESERVE IN {activeCity.name}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Atmospheric Visual Stage */}
          <div className="lg:col-span-6 relative rounded-sm overflow-hidden min-h-[380px] md:min-h-[460px] bg-black border border-white/10 flex flex-col justify-between p-6 md:p-8">
            {/* Background City Atmospheric Photography */}
            <img
              key={activeCity.id}
              src={activeCity.image}
              alt={activeCity.name}
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4] contrast-125 transition-all duration-700 animate-hero-text"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

            {/* Top Hub Telemetry Overlay */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-sm border border-white/15 text-xs font-mono tracking-widest text-[#C7FF3D]">
                HUB // {activeCity.name}
              </div>
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/15 text-xs font-mono text-[#F4F3EF]">
                <Clock size={13} className="text-[#C7FF3D]" />
                <span>{activeCity.leadTime}</span>
              </div>
            </div>

            {/* Bottom Strategic Details */}
            <div className="relative z-10 space-y-4">
              <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-5 rounded-sm space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[#8B8B8B] text-[0.65rem] uppercase tracking-widest block mb-1">
                    RUNWAY / AIRPORT ACCESS POINTS
                  </span>
                  <p className="text-white font-medium">
                    {activeCity.airports.join(' • ')}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-[#8B8B8B] text-[0.65rem] uppercase tracking-widest block mb-1">
                    EXCLUSIVE PARTNER LOUNGE
                  </span>
                  <p className="text-[#C7FF3D]">
                    {activeCity.lounges}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
