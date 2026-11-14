"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useEffect } from "react";
import SpotModal from "@/components/spotModal/SpotModal";
import SearchBar, { LocationSearchResult } from "@/components/map/SearchBar";
import AnimalFilterChips, {
  AnimalChipItem,
} from "@/components/map/AnimalFilterChips";
import FilterDropdown from "@/components/map/FilterDropdown";
import AnimalFilterDrawer, {
  AnimalCategoryOption,
} from "@/components/map/AnimalFilterDrawer";
import SpotCard from "@/components/map/SpotCard";
import MobileSpotDrawer from "@/components/map/MobileSpotDrawer";
import SpotPhotoViewerModal from "@/components/map/SpotPhotoViewerModal";
import DesktopPhotoViewer from "@/components/map/DesktopPhotoViewer";
import MapFloatingControls from "@/components/map/MapFloatingControls";
import { SpotPinData } from "@/components/MapComponent";
import MapHintBanner from "@/components/spotModal/MapHintBanner";
import {
  fetchSpotsApi,
  createSpotApi,
  fetchAnimalsApi,
} from "@/lib/api/spotApi";

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
  const [spots, setSpots] = useState<SpotPinData[]>([]);
  const [showSpotCard, setShowSpotCard] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<SpotPinData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeAnimal, setActiveAnimal] = useState("ALL");

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [activePhotoList, setActivePhotoList] = useState<string[]>([]);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);

  const [zoomTrigger, setZoomTrigger] = useState<{
    type: "in" | "out";
    timestamp: number;
  } | null>(null);

  const [flyToTarget, setFlyToTarget] = useState<{
    lat: number;
    lng: number;
    name?: string;
    timestamp: number;
  } | null>(null);

  const [addSpotCoord, setAddSpotCoord] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const [backendAnimals, setBackendAnimals] = useState<AnimalCategoryOption[]>(
    []
  );
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsSyncing(true);

    fetchSpotsApi()
      .then(({ spots: loadedSpots }) => {
        if (!isMounted) return;
        if (loadedSpots && loadedSpots.length > 0) {
          setSpots(loadedSpots);
          setSelectedSpot(loadedSpots[0]);
          setShowSpotCard(true);
        }
      })
      .finally(() => {
        if (isMounted) setIsSyncing(false);
      });

    fetchAnimalsApi().then((animals) => {
      if (!isMounted) return;
      if (animals && animals.length > 0) {
        setBackendAnimals(animals);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // รายการหมวดหมู่สัตว์ดึงจาก Backend เท่านั้น
  const dynamicFilterChips: AnimalChipItem[] = useMemo(() => {
    const topAnimals: AnimalChipItem[] = backendAnimals
      .slice(0, 5)
      .map((a: any) => ({
        id: a.name,
        label: a.name.toUpperCase(),
        pinName: a.pinName || a.icon || a.avatar,
      }));
    return [{ id: "ALL", label: "ALL" }, ...topAnimals];
  }, [backendAnimals]);

  // Map ชื่อสัตว์ -> รหัส pinName จาก Database สำหรับใช้แสดงไอคอนบนหมุดแผนที่
  const animalPinMap = useMemo(() => {
    const map: Record<string, string> = {};
    backendAnimals.forEach((a: any) => {
      const key = (a.name || a.id || "").toLowerCase();
      const pin = a.pinName || a.icon || a.avatar;
      if (key && pin) {
        map[key] = pin;
      }
    });
    return map;
  }, [backendAnimals]);

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

      if (activeAnimal.toUpperCase() !== "ALL") {
        const chipCat = activeAnimal.replace(/[^a-zA-Z]/g, "").toLowerCase();
        if (!spotCats.includes(chipCat)) return false;
      }

      return true;
    });
  }, [spots, activeAnimal, selectedCategories]);

  // ทำงานเมื่อ Double-click บนแผนที่เพื่อเปิด Modal สร้าง Spot
  const handleMapDoubleClick = (lat: number, lng: number, address: string) => {
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

  const handleAddNewSpot = async (newSpotData: {
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

    const title =
      newSpotData.animals.length > 0
        ? `${newSpotData.animals[0].name} Spot`
        : "New Animal Spot";
    const category =
      newSpotData.animals.length > 0
        ? newSpotData.animals.map((animal) => animal.name.toLowerCase())
        : [];
    const pinName =
      newSpotData.animals.length > 0
        ? newSpotData.animals[0].pinName ||
          animalPinMap[newSpotData.animals[0].name.toLowerCase()]
        : undefined;

    const createdSpot = await createSpotApi({
      title,
      lat: newSpotData.lat,
      lng: newSpotData.lng,
      address: newSpotData.address,
      description: newSpotData.description,
      category,
      images: imageUrls,
      photoUrl: imageUrls[0] || "",
      authorName: "Achirakorn Thawontantikun",
      authorAvatar: "A",
      animals: newSpotData.animals,
    });

    setSpots((prev) => [{ ...createdSpot, pinName }, ...prev]);
    setSelectedSpot({ ...createdSpot, pinName });
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
            onSelectLocation={(loc: LocationSearchResult) => {
              setFlyToTarget({
                lat: loc.lat,
                lng: loc.lng,
                name: loc.name,
                timestamp: Date.now(),
              });
            }}
            animalItems={dynamicFilterChips}
            activeAnimal={activeAnimal}
            onSelectAnimal={setActiveAnimal}
            onFilterClick={() => setIsFilterDrawerOpen((prev) => !prev)}
          />
          <div className="hidden md:block">
            <AnimalFilterChips
              items={dynamicFilterChips}
              activeItem={activeAnimal}
              onSelect={setActiveAnimal}
            />
          </div>
        </div>

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
        options={backendAnimals}
      />

      {/* 2. Desktop Split View */}
      {showSpotCard && selectedSpot && (
        <div className="absolute top-20 left-4 right-4 bottom-6 z-20 hidden md:flex items-start gap-3 pointer-events-none">
          <div className="pointer-events-auto shrink-0 animate-in fade-in zoom-in-95 duration-200">
            <SpotCard
              data={selectedSpot}
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
          animalPinMap={animalPinMap}
          zoomTrigger={zoomTrigger}
          flyToTarget={flyToTarget}
          onRightClick={handleMapDoubleClick}
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