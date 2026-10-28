"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import SpotModal from "@/components/SpotModal";
import SearchBar from "@/components/map/SearchBar";
import AnimalFilterChips from "@/components/map/AnimalFilterChips";
import FilterDropdown from "@/components/map/FilterDropdown";
import SpotCard from "@/components/map/SpotCard";
import MapFloatingControls from "@/components/map/MapFloatingControls";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      Loading Map...
    </div>
  ),
});

export default function MapPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSpotCard, setShowSpotCard] = useState(true);
  const [search, setSearch] = useState("");
  const [activeAnimal, setActiveAnimal] = useState("All");

  const [selectedSpot, setSelectedSpot] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // function คลิกขวาเพื่อ addspot -> Get Address
  const handleMapRightClick = (lat: number, lng: number, address: string) => {
    setSelectedSpot({ lat, lng, address });
    setIsOpen(true);
  };

  return (
    <main className="flex flex-1 flex-col h-full w-full relative overflow-hidden">
      {/* 1. แถบเครื่องมือด้านบน (Top Bar: Search + Filter Chips + Dropdown) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <SearchBar value={search} onChange={setSearch} />
          <AnimalFilterChips
            activeItem={activeAnimal}
            onSelect={setActiveAnimal}
          />
        </div>
        <div className="pointer-events-auto">
          <FilterDropdown />
        </div>
      </div>

      {/* 2. การ์ดแสดงข้อมูล Spot (Spot Card Popup ทางซ้ายบน) */}
      {showSpotCard && (
        <div className="absolute top-20 left-4 z-20 animate-in fade-in zoom-in-95 duration-200">
          <SpotCard onClose={() => setShowSpotCard(false)} />
        </div>
      )}

      {/* 3. ปุ่มควบคุมลอยขวามือ (Floating Controls: Compass + Zoom) */}
      <div className="absolute top-24 right-4 z-20">
        <MapFloatingControls />
      </div>

      {/* 4. แผนที่ Leaflet (พร้อมหมุดรูปสัตว์) */}
      <div className="flex-1 w-full relative h-full">
        <MapComponent
          onRightClick={handleMapRightClick}
          onSpotClick={() => setShowSpotCard(true)}
        />
      </div>

      {/* 5. Modal สำหรับ Add Spot (เวลาคลิกขวาบนแผนที่) */}
      <SpotModal
        isOpen={isOpen}
        onClose={setIsOpen}
        spotData={selectedSpot}
      />
    </main>
  );
}
