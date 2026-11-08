"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import SpotModal from "@/components/SpotModal";
import SearchBar from "@/components/map/SearchBar";
import AnimalFilterChips from "@/components/map/AnimalFilterChips";
import FilterDropdown from "@/components/map/FilterDropdown";
import AnimalFilterDrawer from "@/components/map/AnimalFilterDrawer";
import SpotCard from "@/components/map/SpotCard";
import MobileSpotDrawer from "@/components/map/MobileSpotDrawer";
import SpotPhotoViewerModal from "@/components/map/SpotPhotoViewerModal";
import DesktopPhotoViewer from "@/components/map/DesktopPhotoViewer";
import MapFloatingControls from "@/components/map/MapFloatingControls";
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

  // Multi-category Filter Drawer State (Figma Drawer Filter)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Full-screen photo viewer state (Screen 5)
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [activePhotoList, setActivePhotoList] = useState<string[]>([]);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);

  // Zoom trigger state for custom floating controls
  const [zoomTrigger, setZoomTrigger] = useState<{
    type: "in" | "out";
    timestamp: number;
  } | null>(null);

  // Right-click to add spot
  const [addSpotCoord, setAddSpotCoord] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // 🔍 Filter Spots based on:
  // 1. Search text
  // 2. Filter chips (All / Cat / Dog / Bird)
  // 3. Multi-select Animal Drawer Filter (selectedCategories)
  const filteredSpots = useMemo(() => {
    return SAMPLE_SPOTS.filter((spot) => {
      const spotCats = Array.isArray(spot.category)
        ? spot.category.map((c) => c.toLowerCase())
        : [String(spot.category).toLowerCase()];

      // 1. Drawer Multi-select Filter
      if (selectedCategories.length > 0) {
        const matchesDrawer = selectedCategories.some((sel) =>
          spotCats.includes(sel.toLowerCase())
        );
        if (!matchesDrawer) return false;
      }

      // 2. Chip Filter (e.g. "Cat", "Dog")
      if (activeAnimal !== "All") {
        const chipCat = activeAnimal.replace(/[^a-zA-Z]/g, "").toLowerCase();
        if (!spotCats.includes(chipCat)) return false;
      }

      // 3. Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = spot.title.toLowerCase().includes(q);
        const matchesDesc = spot.description.toLowerCase().includes(q);
        const matchesAuthor = spot.author.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAuthor) return false;
      }

      return true;
    });
  }, [search, activeAnimal, selectedCategories]);

  const handleMapRightClick = (lat: number, lng: number, address: string) => {
    setAddSpotCoord({ lat, lng, address });
    setIsOpen(true);
  };

  const handleSelectSpot = (spot: SpotPinData) => {
    setSelectedSpot(spot);
    setSelectedCategory(Array.isArray(spot.category) ? spot.category[0] : spot.category);
    setShowSpotCard(true);
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setShowSpotCard(true);
  };

  const handleOpenPhotoViewer = (photoUrl: string, index = 0) => {
    if (selectedSpot && selectedSpot.images.length > 0) {
      setActivePhotoList(selectedSpot.images);
      setInitialPhotoIndex(index);
    } else {
      setActivePhotoList([photoUrl]);
      setInitialPhotoIndex(0);
    }
    setPhotoViewerOpen(true);
  };

  return (
    <main className="flex flex-1 flex-col h-full w-full relative overflow-hidden">
      {/* 1. Top Bar: Search + Filter Chips + Filter Dropdown Button */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <SearchBar value={search} onChange={setSearch} />
          <AnimalFilterChips
            activeItem={activeAnimal}
            onSelect={setActiveAnimal}
          />
        </div>
        <div className="pointer-events-auto">
          <FilterDropdown
            onClick={() => setIsFilterDrawerOpen((prev) => !prev)}
            selectedCount={selectedCategories.length}
          />
        </div>
      </div>

      {/* 1.1 Animal Filter Drawer / Modal (Figma Drawer Filter) */}
      <AnimalFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        selectedCategories={selectedCategories}
        onChange={setSelectedCategories}
      />

      {/* 2. Desktop Split View: Spot Card on Left + Big Photo Viewer on Right (md: screens) */}
      {showSpotCard && (
        <div className="absolute top-20 left-4 right-4 bottom-6 z-20 hidden md:flex items-start gap-3 pointer-events-none">
          <div className="pointer-events-auto shrink-0 animate-in fade-in zoom-in-95 duration-200">
            <SpotCard
              data={selectedSpot || undefined}
              onClose={() => {
                setShowSpotCard(false);
                setPhotoViewerOpen(false);
              }}
              onPhotoClick={handleOpenPhotoViewer}
              activePhotoIndex={photoViewerOpen ? initialPhotoIndex : undefined}
            />
          </div>

          {/* Balanced Photo Viewer displayed side-by-side to the right */}
          {photoViewerOpen && (
            <div className="pointer-events-auto shrink-0">
              <DesktopPhotoViewer
                isOpen={photoViewerOpen}
                onClose={() => setPhotoViewerOpen(false)}
                images={activePhotoList}
                initialIndex={initialPhotoIndex}
                onIndexChange={setInitialPhotoIndex}
              />
            </div>
          )}
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

      {/* 4. Full-Screen Photo Viewer Modal (Mobile only) */}
      <div className="block md:hidden">
        <SpotPhotoViewerModal
          isOpen={photoViewerOpen}
          onClose={() => setPhotoViewerOpen(false)}
          images={activePhotoList}
          initialIndex={initialPhotoIndex}
        />
      </div>

      {/* 5. Interactive Leaflet Map with Filtered Spots */}
      <div className="flex-1 w-full relative h-full">
        {/* Floating Zoom Controls at Bottom-Right */}
        <div className="absolute bottom-24 right-4 z-20 pointer-events-auto hidden md:block">
          <MapFloatingControls
            onZoomIn={() =>
              setZoomTrigger({ type: "in", timestamp: Date.now() })
            }
            onZoomOut={() =>
              setZoomTrigger({ type: "out", timestamp: Date.now() })
            }
          />
        </div>
        <MapComponent
          spots={filteredSpots}
          zoomTrigger={zoomTrigger}
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
