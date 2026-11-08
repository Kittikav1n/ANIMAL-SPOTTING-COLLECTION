"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import SpotModal from "@/components/spotModal/SpotModal";
import SearchBar from "@/components/map/SearchBar";
import AnimalFilterChips from "@/components/map/AnimalFilterChips";
import FilterDropdown from "@/components/map/FilterDropdown";
import SpotCard from "@/components/map/SpotCard";
import MobileSpotDrawer from "@/components/map/MobileSpotDrawer";
import SpotPhotoViewerModal from "@/components/map/SpotPhotoViewerModal";
import MapFloatingControls from "@/components/map/MapFloatingControls";
import DesktopPhotoViewer from "@/components/map/DesktopPhotoViewer";
import { SpotPinData, SAMPLE_SPOTS } from "@/components/MapComponent";

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
  const [spots, setSpots] = useState<SpotPinData[]>(SAMPLE_SPOTS);
  const [showSpotCard, setShowSpotCard] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<SpotPinData | null>(
    SAMPLE_SPOTS[0],
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "Cat",
  );
  const [search, setSearch] = useState("");
  const [activeAnimal, setActiveAnimal] = useState("All");

  // Full-screen photo viewer state (Screen 5)
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [activePhotoList, setActivePhotoList] = useState<string[]>([]);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);

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

  const handleAddNewSpot = (newSpotData: {
    lat: number;
    lng: number;
    address: string;
    description: string;
    animals: any[];
    images: File[];
  }) => {
    const imageUrls = newSpotData.images.map((file) =>
      URL.createObjectURL(file),
    );
    console.log("Data: ",newSpotData);

    const createdSpot: SpotPinData = {
      id: Date.now().toString(),
      title:
        newSpotData.animals.length > 0
          ? `${newSpotData.animals[0].name} Spot`
          : "New Animal Spot",
      category:
        newSpotData.animals.length > 0
          ? newSpotData.animals[0].name
          : "General",
      lat: newSpotData.lat,
      lng: newSpotData.lng,
      address: newSpotData.address,
      description: newSpotData.description,
      author: { name: "Achirakorn Thawontantikun", avatar: "A" },
      images:
        imageUrls.length > 0
          ? imageUrls
          : [
              "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
            ],
      photoUrl: imageUrls[0],
    };
    console.log("Created Spot: ", createdSpot);

    setSpots((prev) => [...prev, createdSpot]);
    setSelectedSpot(createdSpot);
    setShowSpotCard(true);
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

      {/* 2. Desktop Split View: Spot Card on Left + Big Photo Viewer on Right (md: screens) */}
      {showSpotCard && (
        <div className="absolute top-20 left-4 z-20 hidden md:flex items-start gap-3 pointer-events-none">
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

      {/* 5. Interactive Leaflet Map with Zoom In/Out Category & Photo Breakout */}
      <div className="flex-1 w-full relative h-full">
        {/* เพิ่มปุ่ม Floating Controls ไว้ที่มุมขวาล่าง (เหนือ Mobile Drawer) */}
        <div className="absolute bottom-24 right-4 z-20 pointer-events-auto hidden md:block">
          <MapFloatingControls
            onZoomIn={() => console.log("Zoom In Triggered")}
            onZoomOut={() => console.log("Zoom Out Triggered")}
          />
        </div>
        <MapComponent
          spots={spots}
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
        onSaveSpot={handleAddNewSpot}
      />
    </main>
  );
}
