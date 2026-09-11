import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FleetShowcase } from './components/FleetShowcase';
import { ExperienceSection } from './components/ExperienceSection';
import { LocationsSection } from './components/LocationsSection';
import { JournalSection } from './components/JournalSection';
import { Footer } from './components/Footer';
import { VehicleModal } from './components/VehicleModal';
import { ReservationModal } from './components/ReservationModal';
import { CustomCursor } from './components/CustomCursor';
import type { Vehicle } from './types';
import { audioEngine } from './utils/audioEngine';

/**
 * VÉLOCÉ — High-End Luxury Automotive Rental Platform
 * Source Credit Reference: SION Automotive Concept (Jonas Arleth on Webflow / Foxora 7.4.0)
 * Reconstructed & engineered as an original $20,000+ agency-tier automotive experience.
 */

export const App: React.FC = () => {
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationVehicle, setReservationVehicle] = useState<Vehicle | null>(null);
  const [initialCity, setInitialCity] = useState<string>('MUMBAI');

  const scrollToSection = (id: string) => {
    audioEngine.playClick();
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth'
      });
    }
  };

  const handleOpenReservation = (vehicle?: Vehicle, city?: string) => {
    audioEngine.playClick();
    if (vehicle) {
      setReservationVehicle(vehicle);
    }
    if (city) {
      setInitialCity(city);
    }
    setReservationOpen(true);
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    audioEngine.playClick();
    setSelectedVehicleForDetail(vehicle);
  };

  const handleReserveFromDetail = (vehicle: Vehicle) => {
    setSelectedVehicleForDetail(null);
    handleOpenReservation(vehicle);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F4F3EF] selection:bg-[#C7FF3D] selection:text-black">
      {/* Desktop Precision Cursor */}
      <CustomCursor />

      {/* Global Minimal Floating Navbar */}
      <Navbar
        onOpenReservation={() => handleOpenReservation()}
        activeSection="hero"
      />

      {/* Main Experience Layout */}
      <main>
        {/* Section 01: The Money Shot Hero */}
        <Hero
          onExploreFleet={() => scrollToSection('fleet')}
          onOpenReservation={() => handleOpenReservation()}
        />

        {/* Section 02: Curated Machine Showcase */}
        <FleetShowcase
          onSelectVehicle={handleSelectVehicle}
          onReserveVehicle={(v) => handleOpenReservation(v)}
        />

        {/* Section 03: The Experience Pillars */}
        <ExperienceSection />

        {/* Section 04: Strategic Operational Hubs */}
        <LocationsSection
          onReserveCity={(cityName) => {
            handleOpenReservation(undefined, cityName);
          }}
        />

        {/* Section 05: Editorial Dispatches */}
        <JournalSection />
      </main>

      {/* Minimal Automotive Brand Footer */}
      <Footer
        onStartJourney={() => handleOpenReservation()}
        onNavigate={scrollToSection}
      />

      {/* Dedicated Full-Screen Technical Specification Sheet */}
      <VehicleModal
        vehicle={selectedVehicleForDetail}
        onClose={() => setSelectedVehicleForDetail(null)}
        onReserve={handleReserveFromDetail}
      />

      {/* Multi-Step Reservation Experience */}
      <ReservationModal
        isOpen={reservationOpen}
        initialVehicle={reservationVehicle}
        initialCity={initialCity}
        onClose={() => setReservationOpen(false)}
      />
    </div>
  );
};

export default App;
