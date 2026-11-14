"use client";

import { useEffect, useRef } from "react";
import { renderToString } from "react-dom/server";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AnimalIcon from "@/components/spotModal/AnimalIcon";

// Fix Leaflet Default Marker Icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface SpotPinData {
  id: string;
  title: string;
  author: { name: string; avatar?: string };
  description: string;
  images: string[];
  category: string[];
  pinName?: string; // รหัสไอคอนจาก Database เช่น "mdi:cat"
  lat: number;
  lng: number;
  address?: string;
  photoUrl?: string;
}

interface MapComponentProps {
  spots?: SpotPinData[];
  animalPinMap?: Record<string, string>; // Map ชื่อสัตว์ -> รหัส pinName จาก Database
  onRightClick: (lat: number, lng: number, address: string) => void;
  onSelectSpot?: (spot: SpotPinData) => void;
  onSelectCategory?: (category: string) => void;
  zoomTrigger?: { type: "in" | "out"; timestamp: number } | null;
  flyToTarget?: {
    lat: number;
    lng: number;
    name?: string;
    timestamp: number;
  } | null;
}

// Polygon boundary coordinates (KMUTT Campus Zone)
const customPolygonCoords: [number, number][] = [
  [13.65299, 100.495336],
  [13.652589, 100.495819],
  [13.652347, 100.496345],
  [13.652023, 100.496315],
  [13.651765, 100.49657],
  [13.650637, 100.496342],
  [13.650733, 100.49601],
  [13.6506, 100.49587],
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
  [13.65242, 100.490339],
  [13.654348, 100.491477],
  [13.653697, 100.493676],
  [13.654166, 100.494148],
  [13.654468, 100.493606],
  [13.655318, 100.494151],
  [13.654682, 100.49558],
  [13.654202, 100.495108],
  [13.653764, 100.495747],
];

const pinCenter: [number, number] = [13.651028246362888, 100.49416681954621];

function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const CLUSTER_DISTANCE_METERS = 100;
const ZOOM_BREAKOUT_THRESHOLD = 18;

interface SpotCluster {
  category: string;
  pinName?: string;
  centerLat: number;
  centerLng: number;
  spots: SpotPinData[];
}

function clusterSpotsByDistance(
  spots: SpotPinData[],
  radiusMeters: number,
  animalPinMap?: Record<string, string>
): SpotCluster[] {
  const clusters: SpotCluster[] = [];

  const categoryMap: { [cat: string]: SpotPinData[] } = {};
  spots.forEach((spot) => {
    if (!spot.category) return;
    const cats = Array.isArray(spot.category) ? spot.category : [spot.category];
    cats.forEach((cat) => {
      const normalized = cat.toLowerCase();
      if (!categoryMap[normalized]) categoryMap[normalized] = [];
      categoryMap[normalized].push(spot);
    });
  });

  Object.entries(categoryMap).forEach(([category, catSpots]) => {
    catSpots.forEach((spot) => {
      const matchingCluster = clusters.find(
        (c) =>
          c.category === category &&
          getDistanceInMeters(c.centerLat, c.centerLng, spot.lat, spot.lng) <=
            radiusMeters
      );

      if (matchingCluster) {
        if (!matchingCluster.spots.some((s) => s.id === spot.id)) {
          matchingCluster.spots.push(spot);
        }
        matchingCluster.centerLat =
          matchingCluster.spots.reduce((sum, s) => sum + s.lat, 0) /
          matchingCluster.spots.length;
        matchingCluster.centerLng =
          matchingCluster.spots.reduce((sum, s) => sum + s.lng, 0) /
          matchingCluster.spots.length;
      } else {
        clusters.push({
          category,
          pinName: spot.pinName || animalPinMap?.[category],
          centerLat: spot.lat,
          centerLng: spot.lng,
          spots: [spot],
        });
      }
    });
  });

  return clusters;
}

const isPointInPolygon = (
  lat: number,
  lng: number,
  polygon: [number, number][]
) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1],
      yi = polygon[i][0];
    const xj = polygon[j][1],
      yj = polygon[j][0];

    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// ใช้ AnimalIcon (Iconify) แทนอิโมจิ
interface ClusterPinIconProps {
  pinName?: string;
  count: number;
}

function ClusterPinIcon({ pinName, count }: ClusterPinIconProps) {
  return (
    <div className="relative size-11 rounded-full bg-[#E0ECDD] border-[1.5px] border-[#536E50]/40 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105 text-[#3B5238]">
      <AnimalIcon pinName={pinName} className="size-6" />
      {count > 1 && (
        <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-bold size-[18px] rounded-full border-[1.5px] border-white flex items-center justify-center shadow-md select-none">
          {count}
        </span>
      )}
    </div>
  );
}

export default function MapComponent({
  spots = [],
  animalPinMap,
  onRightClick,
  onSelectSpot,
  onSelectCategory,
  zoomTrigger,
  flyToTarget,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spotsLayerRef = useRef<L.LayerGroup | null>(null);

  const onRightClickRef = useRef(onRightClick);
  onRightClickRef.current = onRightClick;
  const onSelectSpotRef = useRef(onSelectSpot);
  onSelectSpotRef.current = onSelectSpot;
  const onSelectCategoryRef = useRef(onSelectCategory);
  onSelectCategoryRef.current = onSelectCategory;
  const spotsRef = useRef(spots);
  spotsRef.current = spots;
  const animalPinMapRef = useRef(animalPinMap);
  animalPinMapRef.current = animalPinMap;

  const currentModeRef = useRef<"cluster" | "photo" | null>(null);
  const updateMarkersRef = useRef<((force?: boolean) => void) | null>(null);

  const updateMarkers = (force = false) => {
    if (!mapRef.current || !spotsLayerRef.current) return;

    const currentZoom = mapRef.current.getZoom();
    const isZoomedIn = currentZoom >= ZOOM_BREAKOUT_THRESHOLD;
    const targetMode = isZoomedIn ? "photo" : "cluster";

    if (!force && currentModeRef.current === targetMode) return;
    currentModeRef.current = targetMode;

    spotsLayerRef.current.clearLayers();
    const currentSpots = spotsRef.current;

    if (!isZoomedIn) {
      const clusters = clusterSpotsByDistance(
        currentSpots,
        CLUSTER_DISTANCE_METERS,
        animalPinMapRef.current
      );

      clusters.forEach((cluster) => {
        const count = cluster.spots.length;

        const categoryIcon = L.divIcon({
          className: "category-cluster-pin",
          html: renderToString(
            <ClusterPinIcon pinName={cluster.pinName} count={count} />
          ),
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const marker = L.marker([cluster.centerLat, cluster.centerLng], {
          icon: categoryIcon,
        });

        marker.on("click", () => {
          mapRef.current?.flyTo([cluster.centerLat, cluster.centerLng], 18, {
            duration: 0.8,
          });
          onSelectCategoryRef.current?.(cluster.category);
          if (cluster.spots.length === 1) {
            onSelectSpotRef.current?.(cluster.spots[0]);
          }
        });

        spotsLayerRef.current?.addLayer(marker);
      });
    } else {
      currentSpots.forEach((spot) => {
        const validPhotoUrl = spot.photoUrl || spot.images?.[0] || "";
        const fallbackPin =
          spot.pinName ||
          animalPinMapRef.current?.[spot.category?.[0]?.toLowerCase() || ""];

        const photoPinIcon = L.divIcon({
          className: "photo-spot-pin",
          html: validPhotoUrl
            ? `
              <div style="width: 48px; height: 48px; border-radius: 12px; overflow: hidden; border: 2.5px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.35); cursor: pointer; background: white; transition: transform 0.2s;">
                <img src="${validPhotoUrl}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
              </div>
            `
            : renderToString(
                <div className="size-11 rounded-full bg-[#E0ECDD] border-2 border-white shadow-md flex items-center justify-center cursor-pointer text-[#3B5238]">
                  <AnimalIcon pinName={fallbackPin} className="size-6" />
                </div>
              ),
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        const marker = L.marker([spot.lat, spot.lng], {
          icon: photoPinIcon,
        });

        marker.on("click", () => {
          onSelectSpotRef.current?.(spot);
        });

        spotsLayerRef.current?.addLayer(marker);
      });
    }
  };
  updateMarkersRef.current = updateMarkers;

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    updateMarkersRef.current?.(true);
  }, [spots, animalPinMap]);

  // บินไปยังจุดที่กำหนดเมื่อ flyToTarget เปลี่ยน
  // useEffect(() => {
  //   if (!mapRef.current || !zoomTrigger) return;
  //   if (zoomTrigger.type === "in") {
  //     mapRef.current.zoomIn();
  //   } else if (zoomTrigger.type === "out") {
  //     mapRef.current.zoomOut();
  //   }
  // }, [zoomTrigger]);

  // useEffect(() => {
  //   if (!mapRef.current || !flyToTarget) return;

  //   const { lat, lng, name } = flyToTarget;

  //   mapRef.current.flyTo([lat, lng], 18, {
  //     duration: 1.2,
  //   });

  //   if (markerRef.current) {
  //     markerRef.current.setLatLng([lat, lng]);
  //   } else {
  //     markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
  //   }

  //   if (name) {
  //     markerRef.current.bindPopup(name).openPopup();
  //   }
  // }, [flyToTarget]);

  useEffect(() => {
    if (!mapRef.current || !flyToTarget) return;

    const { lat, lng, name } = flyToTarget;

    // เช็คว่าอยู่ในกรอบเขต มจธ. บางมด หรือไม่
    const allowedBounds = L.polygon(customPolygonCoords).getBounds().pad(0.2);
    if (!allowedBounds.contains([lat, lng])) {
      console.log("Location is outside Bangmod campus area");
      return;
    }

    mapRef.current.flyTo([lat, lng], 18, {
      duration: 1.2,
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    }

    if (name) {
      markerRef.current.bindPopup(name).openPopup();
    }
  }, [flyToTarget]);

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
      doubleClickZoom: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    allowedPolygon
      .setStyle({
        color: "#3388ff",
        weight: 2,
        fillColor: "#3388ff",
        fillOpacity: 0.1,
      })
      .addTo(map);

    map.on("drag", function () {
      if (!paddedBounds.contains(map.getCenter())) {
        map.panTo(pinCenter, { animate: true, duration: 0.25 });
      }
    });

    const spotsLayer = L.layerGroup().addTo(map);
    spotsLayerRef.current = spotsLayer;
    mapRef.current = map;

    updateMarkers(true);

    const onZoomEnd = () => updateMarkers();
    map.on("zoomend", onZoomEnd);

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    map.on("dblclick", async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      const isInZone = isPointInPolygon(lat, lng, customPolygonCoords);
      if (!isInZone) {
        console.log("Clicked outside the allowed zone");
        return;
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      const address = await getAddressFromLatLon(lat, lng);
      onRightClickRef.current(lat, lng, address);
    });

    return () => {
      clearTimeout(timer);
      map.off("zoomend", onZoomEnd);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const getAddressFromLatLon = async (
    lat: number,
    lon: number
  ): Promise<string> => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "AnimalSpottingApp/1.0" },
      });
      const data = await res.json();
      return data.display_name || "No address found at this location";
    } catch (err) {
      console.error(err);
      return "Failed to retrieve address";
    }
  };

  return (
    <div
      ref={containerRef}
      id="map"
      className="w-full h-full absolute inset-0 z-10"
    />
  );
}