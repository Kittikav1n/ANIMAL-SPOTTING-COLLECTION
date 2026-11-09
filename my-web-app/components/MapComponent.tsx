"use client";

import { useEffect, useRef } from "react";
import { renderToString } from "react-dom/server";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  lat: number;
  lng: number;
  address?: string;
  photoUrl?: string;
}

// Sample spots placed inside the allowed KMUTT campus zone:
// Notice: spot-1, spot-2, and spot-3 are within ~40-60 meters of each other (Cluster 1)
// spot-4 is >250m away near the greenhouse (Cluster 2)
// spot-5 & spot-6 are Dogs within ~35m of each other (Cluster 3)
export const SAMPLE_SPOTS: SpotPinData[] = [
  {
    id: "spot-1",
    title: "Fruit-Loving Cat",
    author: { name: "Kingkong1212", avatar: "🐱" },
    description:
      "A friendly local cat with a quirky habit of resting under apple trees. Known by students for enjoying small fruit treats near the campus walkway.",
    images: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop",
    ],
    category: ["cat"],
    lat: 13.6512,
    lng: 100.494,
    address: "KMUTT Central Garden",
    photoUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&h=120&fit=crop",
  },
  {
    id: "spot-2",
    title: "Playful Kitten & Campus Dog",
    author: { name: "Whiskers99", avatar: "🐾" },
    description:
      "Tiny orange kitten playing with leaves alongside the campus dog by the garden lawn.",
    images: [
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
    ],
    category: ["cat", "dog"],
    lat: 13.6514,
    lng: 100.4943,
    address: "Lawn near CB2",
    photoUrl:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=120&h=120&fit=crop",
  },
  {
    id: "spot-3",
    title: "Sunbathing Tabby & Birds",
    author: { name: "CampusStray", avatar: "☀️" },
    description:
      "Warm tabby cat sleeping peacefully on the stone bench while pigeons gather nearby.",
    images: [
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&h=400&fit=crop",
    ],
    category: ["cat", "bird"],
    lat: 13.651,
    lng: 100.4944,
    address: "Stone Bench Walkway",
    photoUrl:
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=120&h=120&fit=crop",
  },
  {
    id: "spot-4",
    title: "Garden Eagle / Falcon",
    author: { name: "GreenPaw", avatar: "🌿" },
    description:
      "Majestic bird perched on the greenhouse roof observing the campus grounds.",
    images: [
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop",
    ],
    category: ["bird", "eagle"],
    lat: 13.6535,
    lng: 100.4925,
    address: "Botany Greenhouse",
    photoUrl:
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=120&h=120&fit=crop",
  },
  {
    id: "spot-5",
    title: "Walkway Dog",
    author: { name: "CampusWalker", avatar: "🐶" },
    description: "A dog resting beside a quiet campus walkway.",
    images: [
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop",
    ],
    category: "Dog",
    lat: 13.6504,
    lng: 100.49215,
    photoUrl:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120&h=120&fit=crop",
  },
  {
    id: "spot-6",
    title: "Lawn Explorer",
    author: { name: "TrailNotes", avatar: "🐾" },
    description: "A dog exploring the grass near the edge of the path.",
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    ],
    category: "Dog",
    lat: 13.65062,
    lng: 100.49232,
    photoUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&h=120&fit=crop",
  },
  {
    id: "spot-7",
    title: "Garden Perch",
    author: { name: "BirdWatch", avatar: "🐦" },
    description: "A bird paused on a branch above the garden path.",
    images: [
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&h=400&fit=crop",
    ],
    category: "Bird",
    lat: 13.6528,
    lng: 100.49182,
    photoUrl:
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=120&h=120&fit=crop",
  },
  {
    id: "spot-8",
    title: "Canopy Visitor",
    author: { name: "LeafLookout", avatar: "🌳" },
    description: "A colorful bird spotted among the leaves.",
    images: [
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop",
    ],
    category: "Bird",
    lat: 13.65255,
    lng: 100.49165,
    photoUrl:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=120&h=120&fit=crop",
  },
  {
    id: "spot-9",
    title: "Courtyard Cat",
    author: { name: "QuietPaws", avatar: "🐱" },
    description: "A cat taking a break in a quiet corner of the courtyard.",
    images: [
      "https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400&h=400&fit=crop",
    ],
    category: "Cat",
    lat: 13.65182,
    lng: 100.49495,
    photoUrl:
      "https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=120&h=120&fit=crop",
  },
  {
    id: "spot-10",
    title: "Pathside Pals",
    author: { name: "CampusWalker", avatar: "🐶" },
    description: "Two dogs on the move near a campus path.",
    images: [
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop",
    ],
    category: "Dog",
    lat: 13.6505,
    lng: 100.4945,
    photoUrl:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=120&h=120&fit=crop",
  },
  {
    id: "spot-11",
    title: "Garden Dog",
    author: { name: "TrailNotes", avatar: "🐾" },
    description: "A dog spotted beside the campus garden.",
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
    ],
    category: "Dog",
    lat: 13.6517,
    lng: 100.49285,
    photoUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=120&h=120&fit=crop",
  },
  {
    id: "spot-12",
    title: "Curious Campus Cat",
    author: { name: "QuietPaws", avatar: "🐱" },
    description: "A curious cat that stopped to look at the camera.",
    images: [
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop",
    ],
    category: "Cat",
    lat: 13.65312,
    lng: 100.49092,
    photoUrl:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=120&h=120&fit=crop",
  },
  {
    id: "spot-13",
    title: "Afternoon Cat",
    author: { name: "GreenPaw", avatar: "🌿" },
    description: "A cat settling into a quiet spot for the afternoon.",
    images: [
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400&h=400&fit=crop",
    ],
    category: "Cat",
    lat: 13.64985,
    lng: 100.49422,
    photoUrl:
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=120&h=120&fit=crop",
  },
];

interface MapComponentProps {
  spots?: SpotPinData[];
  onRightClick: (lat: number, lng: number, address: string) => void;
  onSelectSpot?: (spot: SpotPinData) => void;
  onSelectCategory?: (category: string) => void;
  zoomTrigger?: { type: "in" | "out"; timestamp: number } | null;
}

// 1. Polygon boundary coordinates
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

// 📏 Distance calculation formula (Haversine in meters)
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth radius in meters
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

// Emoji mapping for each category matching the filter options
export const CATEGORY_EMOJI_MAP: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  bird: "🐦",
  eagle: "🦅",
  salmon: "🐟",
  frog: "🐸",
  snake: "🐍",
  butterfly: "🦋",
  elephant: "🐘",
  giraffe: "🦒",
  dolphin: "🐬",
};

export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJI_MAP[category.toLowerCase()] || "🐾";
}

// Group spots by category, then cluster those within 100 meters
interface SpotCluster {
  category: string;
  centerLat: number;
  centerLng: number;
  spots: SpotPinData[];
}

function clusterSpotsByDistance(
  spots: SpotPinData[],
  radiusMeters: number,
): SpotCluster[] {
  const clusters: SpotCluster[] = [];

  // Group by category (a spot with multiple categories can participate in corresponding clusters)
  const categoryMap: { [cat: string]: SpotPinData[] } = {};
  spots.forEach((spot) => {
    const cats = Array.isArray(spot.category) ? spot.category : [spot.category];
    cats.forEach((cat) => {
      const normalized = cat.toLowerCase();
      if (!categoryMap[normalized]) categoryMap[normalized] = [];
      categoryMap[normalized].push(spot);
    });
  });

  // For each category, cluster items within radiusMeters
  Object.entries(categoryMap).forEach(([category, catSpots]) => {
    catSpots.forEach((spot) => {
      const matchingCluster = clusters.find(
        (c) =>
          c.category === category &&
          getDistanceInMeters(c.centerLat, c.centerLng, spot.lat, spot.lng) <=
            radiusMeters,
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
  polygon: [number, number][],
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

// Cluster Pin Icon
interface ClusterPinIconProps {
  emoji: string;
  count: number;
}

function ClusterPinIcon({ emoji, count }: ClusterPinIconProps) {
  return (
    <div className="relative size-11 rounded-full bg-[#E0ECDD] border-[1.5px] border-[#536E50]/40 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105">
      <span className="text-[22px] leading-none drop-shadow-xs select-none">
        {emoji}
      </span>
      {count > 1 && (
        <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-bold size-[18px] rounded-full border-[1.5px] border-white flex items-center justify-center shadow-md select-none">
          {count}
        </span>
      )}
    </div>
  );
}

export default function MapComponent({
  spots = SAMPLE_SPOTS,
  onRightClick,
  onSelectSpot,
  onSelectCategory,
  zoomTrigger,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spotsLayerRef = useRef<L.LayerGroup | null>(null);

  // Keep references stable
  const onRightClickRef = useRef(onRightClick);
  onRightClickRef.current = onRightClick;
  const onSelectSpotRef = useRef(onSelectSpot);
  onSelectSpotRef.current = onSelectSpot;
  const onSelectCategoryRef = useRef(onSelectCategory);
  onSelectCategoryRef.current = onSelectCategory;
  const spotsRef = useRef(spots);
  spotsRef.current = spots;

  const currentModeRef = useRef<"cluster" | "photo" | null>(null);
  const updateMarkersRef = useRef<((force?: boolean) => void) | null>(null);

  // 🔄 Update markers function
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
      // ZOOM OUT (< 18): Group nearby animals into Category Pins
      const clusters = clusterSpotsByDistance(
        currentSpots,
        CLUSTER_DISTANCE_METERS,
      );

      clusters.forEach((cluster) => {
        const count = cluster.spots.length;

        const categoryIcon = L.divIcon({
          className: "category-cluster-pin",
          html: renderToString(
            <ClusterPinIcon
              emoji={getCategoryEmoji(cluster.category)}
              count={count}
            />
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
      // ZOOM IN (>= 18): Breakout photo pins
      currentSpots.forEach((spot) => {
        const validPhotoUrl =
          spot.photoUrl ||
          spot.images?.[0] ||
          "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop";

        const photoPinIcon = L.divIcon({
          className: "photo-spot-pin",
          html: `
            <div style="width: 48px; height: 48px; border-radius: 12px; overflow: hidden; border: 2.5px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.35); cursor: pointer; background: white; transition: transform 0.2s;">
              <img src="${validPhotoUrl}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
            </div>
          `,
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

  // Re-draw when filtered spots prop changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    updateMarkersRef.current?.(true);
  }, [spots]);

  // Handle zoom triggered from custom UI buttons
  useEffect(() => {
    if (!mapRef.current || !zoomTrigger) return;
    if (zoomTrigger.type === "in") {
      mapRef.current.zoomIn();
    } else if (zoomTrigger.type === "out") {
      mapRef.current.zoomOut();
    }
  }, [zoomTrigger]);

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

    // Initial draw
    updateMarkers(true);

    const onZoomEnd = () => updateMarkers();
    map.on("zoomend", onZoomEnd);

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Right-click to add spot
    map.on("contextmenu", async (e) => {
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
    lon: number,
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
