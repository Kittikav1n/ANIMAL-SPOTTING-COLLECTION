"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  onRightClick: (lat: number, lng: number, address: string) => void;
  onSpotClick?: () => void;
}

// 1. กำหนดชุดพิกัดขอบเขต Polygon ของพื้นที่
const customPolygonCoords: [number, number][] = [
  [13.652990, 100.495336], 
  [13.652589, 100.495819],
  [13.652347, 100.496345],
  [13.652023, 100.496315],
  [13.651765, 100.496570],
  [13.650637, 100.496342],
  [13.650733, 100.496010], 
  [13.650600, 100.495870],
  [13.650355, 100.495996],
  [13.649657, 100.495511],
  [13.649792, 100.495006],
  [13.649307, 100.494808],
  [13.648903, 100.495269],
  [13.648479, 100.495063],
  [13.648153, 100.495548],
  [13.647441, 100.495108],
  [13.650042, 100.491042],
  [13.649678, 100.490543],
  [13.650506, 100.488768],
  [13.652367, 100.489739],
  [13.652420, 100.490339],
  [13.654348, 100.491477],
  [13.653697, 100.493676],
  [13.654166, 100.494148],
  [13.654468, 100.493606],
  [13.655318, 100.494151],
  [13.654682, 100.495580],
  [13.654202, 100.495108],
  [13.653764, 100.495747]
];

const pinCenter: [number, number] = [13.651028246362888, 100.49416681954621];

// 📌 ฟังก์ชันตรวจสอบว่าพิกัด (lat, lng) อยู่ "ภายใน" Polygon หรือไม่
const isPointInPolygon = (lat: number, lng: number, polygon: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0]; // lng, lat
    const xj = polygon[j][1], yj = polygon[j][0];

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export default function MapComponent({ onRightClick, onSpotClick }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const allowedPolygon = L.polygon(customPolygonCoords);
    const polygonBounds = allowedPolygon.getBounds();
    const paddedBounds = polygonBounds.pad(0.3);

    const map = L.map(containerRef.current, {
      center: pinCenter, 
      zoom: 17,               
      minZoom: 15,              
      maxZoom: 19,
      zoomControl: false,             
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    allowedPolygon.setStyle({
      color: "#3388ff",
      weight: 2,
      fillColor: "#3388ff",
      fillOpacity: 0.1
    }).addTo(map);

    map.on('drag', function() {
      if (!paddedBounds.contains(map.getCenter())) {
        map.panTo(pinCenter, { animate: true, duration: 0.25 });
      }
    });

    // 🐾 หมุดตัวอย่างรูปแมวตามดีไซน์ UI
    const catPinIcon = L.divIcon({
      className: "custom-spot-pin",
      html: `
        <div style="width: 44px; height: 44px; border-radius: 12px; overflow: hidden; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); cursor: pointer; background: white; transition: transform 0.2s;">
          <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const sampleSpotMarker = L.marker([13.6512, 100.4943], { icon: catPinIcon }).addTo(map);
    sampleSpotMarker.on("click", () => {
      onSpotClick?.();
    });

    mapRef.current = map;

    // รีเฟรชขนาดแผนที่
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // 🖱️ ดักอีเวนต์คลิกขวา
    map.on("contextmenu", async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      const isInZone = isPointInPolygon(lat, lng, customPolygonCoords);
      if (!isInZone) {
        console.log("คลิกอยู่นอกพื้นที่โซนที่กำหนด");
        return;
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      const address = await getAddressFromLatLon(lat, lng);
      onRightClick(lat, lng, address);
    });

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, [onRightClick, onSpotClick]);

  const getAddressFromLatLon = async (lat: number, lon: number): Promise<string> => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "AnimalSpottingApp/1.0" },
      });
      const data = await res.json();
      return data.display_name || "ไม่พบที่อยู่บริเวณนี้";
    } catch (err) {
      console.error(err);
      return "เกิดข้อผิดพลาดในการดึงที่อยู่";
    }
  };

  return <div ref={containerRef} id="map" className="w-full h-full absolute inset-0 z-10" />;
}
