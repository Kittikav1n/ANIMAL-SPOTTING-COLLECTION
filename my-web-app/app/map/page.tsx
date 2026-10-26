"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import SpotModal from "@/components/SpotModal";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full">Loading Map...</div>,
}); 

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
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
    <main className="flex flex-1 flex-col h-full w-full relative">
      {/* Map */}
      <div className="flex-1 w-full relative h-full">
        <MapComponent onRightClick={handleMapRightClick} />
      </div>

      {/* Modal ในการ add spot */}
      <SpotModal 
        isOpen={isOpen} 
        onClose={setIsOpen}
        spotData={selectedSpot} 
      />
    </main>
  );
}