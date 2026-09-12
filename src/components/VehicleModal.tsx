import React, { useState } from 'react';
import type { Vehicle } from '../types';
import { X, ArrowRight, Volume2, Shield, MapPin } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface VehicleModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onReserve: (vehicle: Vehicle) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  vehicle,
  onClose,
  onReserve,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!vehicle) return null;

  const photos = vehicle.gallery && vehicle.gallery.length > 0
    ? vehicle.gallery
    : [vehicle.image];

  const handleIgnition = () => {
    audioEngine.playIgnition();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl overflow-y-auto p-4 md:p-8 animate-hero-text">
      
      {/* Background Dim Ambient Glow */}
      <div className="fixed inset-0 bg-radial from-[#C7FF3D]/[0.03] to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-6xl bg-[#0e0e0e] border border-white/15 rounded-sm overflow-hidden my-auto shadow-2xl shadow-black">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#121212]/80">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#C7FF3D] font-bold tracking-widest uppercase">
              TECHNICAL SHEET // {vehicle.orderNumber}
            </span>
            <span className="text-white/20">|</span>
            <span className="font-mono text-xs text-[#8B8B8B] tracking-wider uppercase">
              {vehicle.variant}
            </span>
          </div>

          <button
            onClick={() => {
              audioEngine.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-sm bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#F4F3EF] hover:text-[#C7FF3D] transition-colors"
            aria-label="Close vehicle specifications"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-10 lg:p-12">
          
          {/* Hero Header & Title */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="font-mono text-xs tracking-[0.25em] text-[#8B8B8B] uppercase block mb-1">
                {vehicle.brand} MOTORSPORT DIVISION
              </span>
              <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-[#F4F3EF] uppercase">
                {vehicle.model}
              </h2>
              <p className="font-mono text-sm text-[#C7FF3D] tracking-wider mt-1">
                {vehicle.variant} • {vehicle.fuelType}
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="font-mono text-xs tracking-widest text-[#8B8B8B] uppercase block">
                RENTAL TARIFF
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#F4F3EF]">
                ₹{vehicle.pricePerDay.toLocaleString('en-IN')}
                <span className="text-xs text-[#8B8B8B] font-normal tracking-normal ml-1.5">
                  / DAY
                </span>
              </div>
            </div>
          </div>

          {/* Massive Cinematic Image Stage */}
          <div className="relative rounded-sm overflow-hidden bg-black border border-white/10 mb-10 group">
            <div className="relative h-[320px] sm:h-[420px] md:h-[500px] w-full flex items-center justify-center p-4">
              <img
                src={photos[activePhotoIdx] || vehicle.image}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>

            {/* Gallery Thumbnail Selector */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded border border-white/10">
                {photos.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      audioEngine.playClick();
                      setActivePhotoIdx(idx);
                    }}
                    className={`w-14 h-9 rounded overflow-hidden border transition-all ${
                      activePhotoIdx === idx
                        ? 'border-[#C7FF3D] opacity-100 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Audio Ignition Trigger Button */}
            <button
              onClick={handleIgnition}
              className="absolute top-4 right-4 flex items-center gap-2 bg-black/80 hover:bg-[#C7FF3D] hover:text-black backdrop-blur-md px-3.5 py-2 rounded-sm border border-white/15 text-xs font-mono tracking-wider text-[#F4F3EF] transition-all"
            >
              <Volume2 size={15} />
              <span>TEST EXHAUST CADENCE</span>
            </button>
          </div>

          {/* Technical Specifications Grid (Automotive Spec Sheet) */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
              <h4 className="font-mono text-xs tracking-[0.2em] text-[#C7FF3D] uppercase font-bold">
                FACTORY SPECIFICATIONS & TELEMETRY
              </h4>
              <span className="font-mono text-xs text-[#8B8B8B]">TRACK-CERTIFIED</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'POWER', value: vehicle.power, unit: 'BHP' },
                { label: 'ACCELERATION', value: vehicle.acceleration, unit: '0–100' },
                { label: 'TOP SPEED', value: vehicle.topSpeed, unit: 'V-MAX' },
                { label: 'TRANSMISSION', value: vehicle.transmission.split(' ')[0], unit: 'GEARBOX' },
                { label: 'CAPACITY', value: `${vehicle.seats} SEATS`, unit: 'COCKPIT' },
                { label: 'WEIGHT', value: vehicle.curbWeight, unit: 'KERB' }
              ].map((spec, i) => (
                <div key={i} className="bg-[#141414] border border-white/[0.06] p-4 rounded-sm">
                  <span className="font-mono text-[0.65rem] tracking-[0.2em] text-[#8B8B8B] uppercase block mb-1">
                    {spec.label}
                  </span>
                  <span className="font-mono text-xl md:text-2xl font-bold text-[#F4F3EF] block">
                    {spec.value}
                  </span>
                  <span className="font-mono text-[0.65rem] text-[#C7FF3D] tracking-wider block mt-1">
                    {spec.unit}
                  </span>
                </div>
              ))}
            </div>

            {/* Extended Engineering Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#141414] border border-white/[0.06] p-5 rounded-sm">
                <span className="font-mono text-xs tracking-wider text-[#8B8B8B] block mb-1.5 uppercase">
                  POWERTRAIN & DRIVETRAIN
                </span>
                <p className="font-mono text-sm text-[#F4F3EF] font-medium">
                  {vehicle.engine}
                </p>
                <p className="font-mono text-xs text-[#C7FF3D] mt-1">
                  {vehicle.drivetrain}
                </p>
              </div>

              <div className="bg-[#141414] border border-white/[0.06] p-5 rounded-sm">
                <span className="font-mono text-xs tracking-wider text-[#8B8B8B] block mb-1.5 uppercase">
                  ACOUSTIC CADENCE
                </span>
                <p className="font-sans text-sm text-[#8B8B8B] leading-relaxed">
                  {vehicle.soundProfile}
                </p>
              </div>
            </div>
          </div>

          {/* Editorial Description */}
          <div className="mb-10 p-6 bg-[#121212] border-l-2 border-[#C7FF3D] rounded-r-sm">
            <p className="font-sans text-base text-[#d4d4d4] leading-relaxed">
              {vehicle.description}
            </p>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-6 text-xs font-mono text-[#8B8B8B]">
              <span className="flex items-center gap-2">
                <Shield size={14} className="text-[#C7FF3D]" /> Comprehensive Track Insurance
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-[#C7FF3D]" /> Direct Runway Delivery
              </span>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => {
                  audioEngine.playClick();
                  onClose();
                }}
                className="btn-secondary flex-1 sm:flex-none justify-center"
              >
                RETURN TO FLEET
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  onReserve(vehicle);
                }}
                className="btn-lime flex-1 sm:flex-none justify-center px-8"
              >
                <span>RESERVE THIS MACHINE</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
