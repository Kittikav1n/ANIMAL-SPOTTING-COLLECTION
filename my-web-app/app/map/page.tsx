"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import SpotModal from "@/components/spotModal/SpotModal";
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
import MapHintBanner from "@/components/spotModal/MapHintBanner";

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
  const [spots, setSpots] = useState<SpotPinData[]>(SAMPLE_SPOTS);
  const [showSpotCard, setShowSpotCard] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<SpotPinData | null>(
    SAMPLE_SPOTS[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "Cat"
  );
  const [search, setSearch] = useState("");
  const [activeAnimal, setActiveAnimal] = useState("All");

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [activePhotoList, setActivePhotoList] = useState<string[]>([]);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);

  const [zoomTrigger, setZoomTrigger] = useState<{
    type: "in" | "out";
    timestamp: number;
  } | null>(null);

  const [addSpotCoord, setAddSpotCoord] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const spotCats = Array.isArray(spot.category)
        ? spot.category.map((c) => c.toLowerCase())
        : [String(spot.category).toLowerCase()];

      if (selectedCategories.length > 0) {
        const matchesDrawer = selectedCategories.some((sel) =>
          spotCats.includes(sel.toLowerCase())
        );
        if (!matchesDrawer) return false;
      }

      if (activeAnimal !== "All") {
        const chipCat = activeAnimal.replace(/[^a-zA-Z]/g, "").toLowerCase();
        if (!spotCats.includes(chipCat)) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = spot.title.toLowerCase().includes(q);
        const matchesDesc = spot.description.toLowerCase().includes(q);
        const matchesAuthor = spot.author.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAuthor) return false;
      }

      return true;
    });
  }, [spots, search, activeAnimal, selectedCategories]);

  const handleMapRightClick = (lat: number, lng: number, address: string) => {
    setAddSpotCoord({ lat, lng, address });
    setIsOpen(true);
  };

  const handleSelectSpot = (spot: SpotPinData) => {
    setSelectedSpot(spot);
    setSelectedCategory(
      Array.isArray(spot.category) ? spot.category[0] : spot.category
    );
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
      URL.createObjectURL(file)
    );

    const createdSpot: SpotPinData = {
      id: Date.now().toString(),
      title:
        newSpotData.animals.length > 0
          ? `${newSpotData.animals[0].name} Spot`
          : "New Animal Spot",
      category:
        newSpotData.animals.length > 0
          ? newSpotData.animals.map((animal) => animal.name)
          : ["General"],
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
      photoUrl:
        imageUrls[0] ||
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
    };

    setSpots((prev) => [...prev, createdSpot]);
    setSelectedSpot(createdSpot);
    setShowSpotCard(true);
  };

  return (
    <main className="flex flex-1 flex-col h-full w-full relative overflow-hidden">
      {/* 1. Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-2.5 pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto flex-1 min-w-0 md:flex-initial">
          <SearchBar
            value={search}
            onChange={setSearch}
            activeAnimal={activeAnimal}
            onSelectAnimal={setActiveAnimal}
            onFilterClick={() => setIsFilterDrawerOpen((prev) => !prev)}
          />
          <div className="hidden md:block">
            <AnimalFilterChips
              activeItem={activeAnimal}
              onSelect={setActiveAnimal}
            />
          </div>
        </div>

        {/* ปุ่ม FilterbyAnimal: ใส่ hidden md:block เพื่อซ่อนบนมือถือ และให้แสดงเฉพาะบน Desktop */}
        <div className="pointer-events-auto shrink-0 hidden md:block">
          <FilterDropdown
            onClick={() => setIsFilterDrawerOpen((prev) => !prev)}
            selectedCount={selectedCategories.length}
          />
        </div>
      </div>

      <MapHintBanner />

      {/* 1.1 Animal Filter Drawer / Modal */}
      <AnimalFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        selectedCategories={selectedCategories}
        onChange={setSelectedCategories}
      />

      {/* 2. Desktop Split View */}
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

      {/* 3. Mobile Bottom Drawer / Sheet */}
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

      {/* 5. Interactive Leaflet Map */}
      <div className="flex-1 w-full relative h-full">
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

      {/* 6. Modal for adding new spots */}
      <SpotModal
        isOpen={isOpen}
        onClose={setIsOpen}
        spotData={addSpotCoord}
        onSaveSpot={handleAddNewSpot}
      />
    </main>
  );
}