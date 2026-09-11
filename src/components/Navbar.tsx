import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, ArrowUpRight } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface NavbarProps {
  onOpenReservation: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReservation }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSoundToggle = () => {
    const active = audioEngine.toggleMute();
    setSoundEnabled(active);
    if (active) {
      audioEngine.playClick();
    }
  };

  const scrollTo = (id: string) => {
    audioEngine.playClick();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3.5 bg-obsidian/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/80'
            : 'py-6 bg-gradient-to-b from-black/80 via-black/30 to-transparent'
        }`}
        style={{
          backgroundColor: isScrolled ? 'rgba(8, 8, 8, 0.88)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Brand Mark */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-2.5 h-2.5 bg-[#C7FF3D] rounded-full transition-transform duration-300 group-hover:scale-125 shadow-[0_0_12px_#C7FF3D]" />
            <span className="font-display text-xl md:text-2xl font-extrabold tracking-[-0.04em] text-[#F4F3EF] uppercase">
              VÉLOCÉ
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {[
              { label: 'FLEET', id: 'fleet' },
              { label: 'EXPERIENCE', id: 'experience' },
              { label: 'LOCATIONS', id: 'locations' },
              { label: 'JOURNAL', id: 'journal' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="font-mono text-[0.8rem] tracking-[0.14em] text-[#8B8B8B] hover:text-[#F4F3EF] transition-colors duration-200 relative group uppercase"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C7FF3D] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden md:flex items-center gap-5">
            {/* Audio Toggle */}
            <button
              onClick={handleSoundToggle}
              className="flex items-center gap-2 py-1.5 px-3 rounded text-[0.75rem] font-mono tracking-widest text-[#8B8B8B] hover:text-[#F4F3EF] border border-white/[0.06] hover:border-white/[0.2] transition-all"
              title={soundEnabled ? 'Mute engine audio' : 'Enable acoustic telemetry'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 size={14} className="text-[#C7FF3D] animate-pulse" />
                  <span className="text-[#C7FF3D]">AUDIO ON</span>
                </>
              ) : (
                <>
                  <VolumeX size={14} />
                  <span>AUDIO</span>
                </>
              )}
            </button>

            {/* Primary Action */}
            <button
              onClick={() => {
                audioEngine.playClick();
                onOpenReservation();
              }}
              className="btn-lime text-[0.75rem] py-2 px-5 font-mono tracking-[0.14em]"
            >
              RESERVE
            </button>
          </div>

          {/* Mobile Hamburger Trigger */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={handleSoundToggle}
              className="p-2 text-[#8B8B8B] hover:text-[#F4F3EF]"
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 size={18} className="text-[#C7FF3D]" /> : <VolumeX size={18} />}
            </button>
            <button
              onClick={() => {
                audioEngine.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="p-2 text-[#F4F3EF] hover:text-[#C7FF3D] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#080808]/98 backdrop-blur-2xl flex flex-col justify-between p-8 pt-28 md:hidden animate-hero-text">
          <div className="flex flex-col gap-6">
            <span className="font-mono text-xs tracking-widest text-[#8B8B8B]">NAVIGATION MENU</span>
            {[
              { label: 'FLEET', id: 'fleet', num: '01' },
              { label: 'EXPERIENCE', id: 'experience', num: '02' },
              { label: 'LOCATIONS', id: 'locations', num: '03' },
              { label: 'JOURNAL', id: 'journal', num: '04' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="flex items-center justify-between text-left py-3 border-b border-white/[0.08] text-2xl font-display font-bold tracking-tight text-[#F4F3EF] hover:text-[#C7FF3D] transition-colors"
              >
                <span>{item.label}</span>
                <span className="font-mono text-sm text-[#8B8B8B] font-normal">{item.num}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <button
              onClick={() => {
                audioEngine.playClick();
                setMobileMenuOpen(false);
                onOpenReservation();
              }}
              className="btn-lime w-full justify-center py-4 font-mono text-sm font-bold"
            >
              RESERVE A MACHINE <ArrowUpRight size={18} />
            </button>
            <div className="flex items-center justify-between text-xs font-mono text-[#8B8B8B] pt-4">
              <span>MUMBAI • DELHI • BANGALORE</span>
              <span>24/7 CONCIERGE</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
