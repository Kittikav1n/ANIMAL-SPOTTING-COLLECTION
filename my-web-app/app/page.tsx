"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import SpotModal from "@/components/SpotModal";
import SearchBar from "@/components/map/SearchBar";
import AnimalFilterChips from "@/components/map/AnimalFilterChips";
import FilterDropdown from "@/components/map/FilterDropdown";
import SpotCard from "@/components/map/SpotCard";
import MobileSpotDrawer from "@/components/map/MobileSpotDrawer";
import SpotPhotoViewerModal from "@/components/map/SpotPhotoViewerModal";
import { SpotPinData, SAMPLE_SPOTS } from "@/components/MapComponent";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      Loading Map...
    </div>
  ),
});

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSpotCard, setShowSpotCard] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<SpotPinData | null>(
    SAMPLE_SPOTS[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>("Cat");
  const [search, setSearch] = useState("");
  const [activeAnimal, setActiveAnimal] = useState("All");

  // Full-screen photo viewer state (Screen 5)
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [activePhotoList, setActivePhotoList] = useState<string[]>([]);

  // Right-click to add spot
  const [addSpotCoord, setAddSpotCoord] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const handleMapRightClick = (lat: number, lng: number, address: string) => {
    setAddSpotCoord({ lat, lng, address });
    setIsOpen(true);
  };

  const handleSelectSpot = (spot: SpotPinData) => {
    setSelectedSpot(spot);
    setSelectedCategory(spot.category);
    setShowSpotCard(true);
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setShowSpotCard(true);
  };

  const handleOpenPhotoViewer = (photoUrl: string) => {
    if (selectedSpot && selectedSpot.images.length > 0) {
      setActivePhotoList(selectedSpot.images);
    } else {
      setActivePhotoList([photoUrl]);
    }
    setPhotoViewerOpen(true);
  };

  return (
    <main className="flex flex-1 flex-col h-full w-full relative overflow-hidden">
      {/* 1. Top Bar: Search + Filter Chips + Filter Dropdown */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <SearchBar value={search} onChange={setSearch} />
          <AnimalFilterChips
            activeItem={activeAnimal}
            onSelect={setActiveAnimal}
          />
        </div>
        <div className="pointer-events-auto hidden sm:block">
          <FilterDropdown />
        </div>
      </div>

      {/* 2. Desktop Spot Card (Floating on Top-Left on md: screens) */}
      {showSpotCard && (
        <div className="absolute top-20 left-4 z-20 hidden md:block animate-in fade-in zoom-in-95 duration-200">
          <SpotCard
            data={selectedSpot || undefined}
            onClose={() => setShowSpotCard(false)}
          />
        </div>
      )}

      {/* 3. Mobile Bottom Drawer / Sheet (Screen 1-4 on mobile screens) */}
      <MobileSpotDrawer
        spot={selectedSpot}
        category={selectedCategory}
        isOpen={showSpotCard}
        onClose={() => setShowSpotCard(false)}
        onPhotoClick={handleOpenPhotoViewer}
      />

      {/* 4. Full-Screen Photo Viewer Modal (Screen 5) */}
      <SpotPhotoViewerModal
        isOpen={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
        images={activePhotoList}
      />

      {/* 5. Interactive Leaflet Map with Zoom In/Out Category & Photo Breakout */}
      <div className="flex-1 w-full relative h-full">
        <MapComponent
          onRightClick={handleMapRightClick}
          onSelectSpot={handleSelectSpot}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {/* 6. Modal for adding new spots on right-click */}
      <SpotModal
        isOpen={isOpen}
        onClose={setIsOpen}
        spotData={addSpotCoord}
      />
    </main>
  );
}
