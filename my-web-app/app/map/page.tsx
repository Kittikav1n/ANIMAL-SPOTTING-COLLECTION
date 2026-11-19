"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
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
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      Loading Map...
    </div>
  ),
});

interface ExtendedAnimalOption extends AnimalCategoryOption {
  animalId?: number;
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
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

  const [backendAnimals, setBackendAnimals] = useState<ExtendedAnimalOption[]>(
    [],
  );
  const [isSyncing, setIsSyncing] = useState(false);

  // แปลงข้อมูลดิบจาก Backend ให้ตรงกับ SpotPinData
  const mapRawSpotToPinData = (
    raw: any,
    pinLookup: Record<string, string>,
  ): SpotPinData => {
    const lat = Number(raw.lat ?? raw.latitude ?? raw.spotLat);
    const lng = Number(raw.lng ?? raw.lon ?? raw.longitude ?? raw.spotLng);

    const categories = Array.isArray(raw.animals)
      ? raw.animals.map((a: any) =>
          (typeof a === "string" ? a : a.name || "animal").toLowerCase(),
        )
      : ["general"];

    const firstPin =
      raw.animals?.[0]?.animalImagePin ||
      pinLookup[categories[0]] ||
      "ph:question";

    const images = Array.isArray(raw.photos)
      ? raw.photos
          .map((p: any) => (typeof p === "string" ? p : p.photoUrl || p.url))
          .filter(Boolean)
      : [];

    return {
      id: String(raw.spotId || raw.id || Date.now()),
      title: raw.title || "Animal Spot",
      lat,
      lng,
      address: raw.address || "",
      description: raw.description || "",
      category: categories,
      pinName: firstPin,
      images,
      photoUrl: images[0] || "",
      author: {
        name:
          raw.user?.username ||
          "Spotter",
        avatar: raw.user?.avatar || raw.author?.avatar || "",
      },
    };
  };

  useEffect(() => {
    let isMounted = true;
    setIsSyncing(true);

    const loadData = async () => {
      try {
        // 1. ดึงข้อมูลสัตว์และ animalImagePin จาก Backend (GET /api/animals)
        const animalRes = await axiosInstance.get("/api/animals");
        const rawAnimals = animalRes.data?.data || animalRes.data || [];

        const formattedAnimals: ExtendedAnimalOption[] = rawAnimals.map(
          (item: any) => ({
            animalId: item.animalId,
            id: item.name.toLowerCase().trim(),
            name: item.name.toUpperCase(),
            pinName: item.animalImagePin || "ph:question",
          }),
        );

        //dictionary for pin
        const pinLookup: Record<string, string> = {};
        formattedAnimals.forEach((a) => {
          pinLookup[a.id] = a.pinName || "ph:question";
        });

        if (isMounted && formattedAnimals.length > 0) {
          setBackendAnimals(formattedAnimals);
        }

        // 2. ดึงข้อมูล Spots ทั้งหมด (GET /api/spots)
        const spotRes = await axiosInstance.get("/api/spots");
        const rawSpots = spotRes.data?.data || spotRes.data || [];
        if (isMounted && Array.isArray(rawSpots) && rawSpots.length > 0) {
          const formattedSpots = rawSpots
            .map((raw: any) => mapRawSpotToPinData(raw, pinLookup))
            .filter((s) => !Number.isNaN(s.lat) && !Number.isNaN(s.lng));
          setSpots(formattedSpots);
          if (formattedSpots.length > 0) {
            setSelectedSpot(formattedSpots[0]);
            setShowSpotCard(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch map data:", err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // รายการหมวดหมู่สัตว์ดึงจาก Backend เท่านั้น
  const dynamicFilterChips: AnimalChipItem[] = useMemo(() => {
    const topAnimals: AnimalChipItem[] = backendAnimals
      .slice(3, 8) // ยอดนิยม order มาให้จาก bn เเล้ว
      .map((a: any) => ({
        id: a.name,
        label: a.name.toUpperCase(),
        pinName: a.pinName,
      }));
    return [{ id: "ALL", label: "ALL" }, ...topAnimals];
  }, [backendAnimals]);

  // Map ชื่อสัตว์ -> รหัส pinName จาก Database สำหรับใช้แสดงไอคอนบนหมุดแผนที่
  const animalPinMap = useMemo(() => {
      const map: Record<string, string> = {};
      backendAnimals.forEach((a: any) => {
        const key = String(a.name || a.id || "").trim().toLowerCase();
        // ดักทั้ง camelCase (pinName) และ snake_case (pin_name) จาก Backend
        const pin = a.pinName || a.pin_name || a.icon;
        if (key && pin) {
          map[key] = pin;
        }
      });
      return map;
    }, [backendAnimals]);

  const filteredSpots = useMemo(() => {
    return spots
      .filter((spot) => {
        const spotCats = Array.isArray(spot.category)
          ? spot.category.map((c) => c.toLowerCase())
          : [String(spot.category).toLowerCase()];

        // 1. Drawer Multi-select Filter
        if (selectedCategories.length > 0) {
          const matchesDrawer = selectedCategories.some((sel) =>
            spotCats.includes(sel.toLowerCase()),
          );
          if (!matchesDrawer) return false;
        }

        // 2. Chip Filter (e.g. "Cat", "Dog")
        if (activeAnimal !== "ALL") {
          const chipCat = activeAnimal.trim().toLowerCase();
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
      })
      .map((spot) => {
        // กรองให้หมุดบนแผนที่แสดงเฉพาะชนิดสัตว์ที่กำลังเลือกใน Filter
        const cats = Array.isArray(spot.category)
          ? spot.category
          : [spot.category];
        const filteredCats = cats.filter((cat) => {
          const lower = cat.toLowerCase();
          if (
            activeAnimal !== "ALL" &&
            lower !== activeAnimal.trim().toLowerCase()
          ) {
            return false;
          }
          if (
            selectedCategories.length > 0 &&
            !selectedCategories.some((sel) => sel.toLowerCase() === lower)
          ) {
            return false;
          }
          return true;
        });

        return {
          ...spot,
          category: filteredCats.length > 0 ? filteredCats : cats,
        };
      });
  }, [spots, search, activeAnimal, selectedCategories]);

  // ทำงานเมื่อ Double-click บนแผนที่เพื่อเปิด Modal สร้าง Spot
  const handleMapDoubleClick = (lat: number, lng: number, address: string) => {
    if (!user) {
      toast.error("Please log in before creating a spot.");
      router.push("/login");
      return;
    }
    
    setAddSpotCoord({ lat, lng, address });
    setIsOpen(true);
  };

  const handleSelectSpot = (spot: SpotPinData) => {
    setSelectedSpot(spot);
    setSelectedCategory(
      Array.isArray(spot.category) ? spot.category[0] : spot.category,
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
    title: string;
    description: string;
    date: Date;
    animals: any[];
    images: File[];
  }) => {
    const finalTitle = newSpotData.title
      ? newSpotData.title
      : newSpotData.animals.length > 0
        ? `${newSpotData.animals[0].name} Spot`
        : "New Animal Spot";

    const pinName =
      newSpotData.animals.length > 0
        ? newSpotData.animals[0].pinName ||
          animalPinMap[newSpotData.animals[0].name.toLowerCase()]
        : undefined;

    try {
      // 1. ขอ Presigned URL และอัปโหลดรูปแต่ละไฟล์ขึ้น Cloudflare R2
      const uploadedPhotoUrls: string[] = [];

      for (const file of newSpotData.images) {
        const presignRes = await axiosInstance.post(
          "/api/spots/presigned-url",
          {
            fileName: file.name,
            fileType: file.type,
          },
        );

        const { uploadUrl, publicUrl } = presignRes.data.data;

        await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        uploadedPhotoUrls.push(publicUrl);
      }

      // 2. เตรียมอาเรย์ของ animalId สำหรับส่งให้ Backend
      const mappedAnimals = newSpotData.animals
        .map((a: any) => {
          if (a.animalId) return { animalId: a.animalId };
          const found = backendAnimals.find(
            (ba) => ba.name.toLowerCase() === a.name.toLowerCase(),
          );
          return found?.animalId ? { animalId: found.animalId } : null;
        })
        .filter(Boolean);

      // 3. ส่ง JSON ไปบันทึก Spot ลง Database (POST /api/spots)
      const response = await axiosInstance.post("/api/spots", {
        title: finalTitle,
        description: newSpotData.description,
        address: newSpotData.address,
        lat: newSpotData.lat,
        lng: newSpotData.lng,
        photoUrls: uploadedPhotoUrls,
        animals: mappedAnimals,
        date: new Date().toISOString(),
      });

      const rawCreated = response.data?.data || response.data;
      const createdSpot = mapRawSpotToPinData(
        {
          ...rawCreated,
          photos: uploadedPhotoUrls,
          animals: newSpotData.animals,
          user: rawCreated.user,
        },
        animalPinMap,
      );
      setSpots((prev) => [{ ...createdSpot, pinName }, ...prev]);
      setSelectedSpot({ ...createdSpot, pinName });
      setShowSpotCard(true);
      toast.success(response.data?.message || "Spot created successfully!");
    } catch (err) {
      console.error("Failed to create spot:", err);
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Unable to save spot. Please check your connection.");
      }

      throw err;
    }
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
              animalPinMap={animalPinMap}
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
        animalPinMap={animalPinMap}
        isOpen={showSpotCard}
        onClose={() => setShowSpotCard(false)}
        onPhotoClick={handleOpenPhotoViewer}
      />

      {/* 4. Full-Screen Photo Viewer Modal (Mobile only) */}
        <SpotPhotoViewerModal
          isOpen={photoViewerOpen}
          onClose={() => setPhotoViewerOpen(false)}
          images={activePhotoList}
          initialIndex={initialPhotoIndex}
        />

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
