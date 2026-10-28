"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface SpotPinData {
  id: string;
  title: string;
  author: { name: string; avatar?: string };
  description: string;
  images: string[];
  category: "Cat" | "Dog" | "Bird";
  lat: number;
  lng: number;
  photoUrl: string;
}

// Sample spots placed inside the allowed KMUTT campus zone:
// Notice: spot-1, spot-2, and spot-3 are within ~40-60 meters of each other (Cluster 1)
// spot-4 is >250m away near the greenhouse (Cluster 2)
// spot-5 & spot-6 are Dogs within ~35m of each other near the sports area (Cluster 3)
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
    category: "Cat",
    lat: 13.6512,
    lng: 100.494,
    photoUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&h=120&fit=crop",
  },
  {
    id: "spot-2",
    title: "Playful Kitten",
    author: { name: "Whiskers99", avatar: "🐾" },
    description:
      "Tiny orange kitten playing with fallen leaves by the garden lawn (~40m from Fruit Cat).",
    images: [
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
    ],
    category: "Cat",
    lat: 13.6514,
    lng: 100.4943,
    photoUrl:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=120&h=120&fit=crop",
  },
  {
    id: "spot-3",
    title: "Sunbathing Tabby",
    author: { name: "CampusStray", avatar: "☀️" },
    description:
      "Warm tabby cat sleeping peacefully on the stone bench (~50m from Fruit Cat).",
    images: [
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&h=400&fit=crop",
    ],
    category: "Cat",
    lat: 13.651,
    lng: 100.4944,
    photoUrl:
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=120&h=120&fit=crop",
  },
  {
    id: "spot-4",
    title: "Garden Prowler",
    author: { name: "GreenPaw", avatar: "🌿" },
    description:
      "Curious cat exploring the botany greenhouse bushes (>250m away from the central garden).",
    images: [
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop",
    ],
    category: "Cat",
    lat: 13.6535,
    lng: 100.4925,
    photoUrl:
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=120&h=120&fit=crop",
  },
];

interface MapComponentProps {
  onRightClick: (lat: number, lng: number, address: string) => void;
  onSelectSpot?: (spot: SpotPinData) => void;
  onSelectCategory?: (category: string) => void;
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
  lon2: number
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

// 🎯 Configuration:
// 1. Animals in the same category within 100 meters are grouped together
const CLUSTER_DISTANCE_METERS = 100;
// 2. Zoom breakout threshold: Zoom < 18 = Grouped category pin | Zoom >= 18 = Breakout photo pins
const ZOOM_BREAKOUT_THRESHOLD = 18;

// Group spots by category, then cluster those within 100 meters
interface SpotCluster {
  category: string;
  centerLat: number;
  centerLng: number;
  spots: SpotPinData[];
}

function clusterSpotsByDistance(
  spots: SpotPinData[],
  radiusMeters: number
): SpotCluster[] {
  const clusters: SpotCluster[] = [];

  // Group by category first (e.g. Cats with Cats, Dogs with Dogs)
  const categoryMap: { [cat: string]: SpotPinData[] } = {};
  spots.forEach((spot) => {
    if (!categoryMap[spot.category]) categoryMap[spot.category] = [];
    categoryMap[spot.category].push(spot);
  });

  // For each category, cluster items within radiusMeters
  Object.entries(categoryMap).forEach(([category, catSpots]) => {
    catSpots.forEach((spot) => {
      // Find if this spot belongs to an existing cluster within radiusMeters
      const matchingCluster = clusters.find(
        (c) =>
          c.category === category &&
          getDistanceInMeters(c.centerLat, c.centerLng, spot.lat, spot.lng) <=
            radiusMeters
      );

      if (matchingCluster) {
        matchingCluster.spots.push(spot);
        // Recalculate cluster center as average
        matchingCluster.centerLat =
          matchingCluster.spots.reduce((sum, s) => sum + s.lat, 0) /
          matchingCluster.spots.length;
        matchingCluster.centerLng =
          matchingCluster.spots.reduce((sum, s) => sum + s.lng, 0) /
          matchingCluster.spots.length;
      } else {
        // Create a new cluster
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
  polygon: [number, number][]
) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1],
      yi = polygon[i][0];
    const xj = polygon[j][1],
      yj = polygon[j][0];

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export default function MapComponent({
  onRightClick,
  onSelectSpot,
  onSelectCategory,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spotsLayerRef = useRef<L.LayerGroup | null>(null);

  // Keep callback references stable across re-renders to prevent map re-mounting
  const onRightClickRef = useRef(onRightClick);
  onRightClickRef.current = onRightClick;
  const onSelectSpotRef = useRef(onSelectSpot);
  onSelectSpotRef.current = onSelectSpot;
  const onSelectCategoryRef = useRef(onSelectCategory);
  onSelectCategoryRef.current = onSelectCategory;

  // Track cluster/photo breakout state so we only redraw when crossing threshold
  const currentModeRef = useRef<"cluster" | "photo" | null>(null);

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

    L.control.zoom({ position: "topright" }).addTo(map);

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

    // Layer group for spot markers
    const spotsLayer = L.layerGroup().addTo(map);
    spotsLayerRef.current = spotsLayer;

    // 🔄 Update markers based on Zoom Level & Distance Clustering (100m)
    const updateMarkers = (force = false) => {
      if (!spotsLayerRef.current) return;

      const currentZoom = map.getZoom();
      const isZoomedIn = currentZoom >= ZOOM_BREAKOUT_THRESHOLD;
      const targetMode = isZoomedIn ? "photo" : "cluster";

      // If mode hasn't changed (and not forced), keep existing markers to avoid flashing
      if (!force && currentModeRef.current === targetMode) return;
      currentModeRef.current = targetMode;

      spotsLayerRef.current.clearLayers();

      if (!isZoomedIn) {
        // =========================================================================
        // 🐾 ZOOM OUT (< 18): Group nearby animals within 100m into 1 Category Pin
        // =========================================================================
        const clusters = clusterSpotsByDistance(
          SAMPLE_SPOTS,
          CLUSTER_DISTANCE_METERS
        );

        clusters.forEach((cluster) => {
          const count = cluster.spots.length;

          // Category Icon: Blue circle with animal silhouette + count badge if multiple
          const categoryIcon = L.divIcon({
            className: "category-cluster-pin",
            html: `
              <div style="position: relative; width: 42px; height: 42px; border-radius: 50%; background: #0284c7; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;">
                <!-- Orange animal silhouette matching design screenshot -->
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fb923c" stroke="#ea580c" stroke-width="1.5">
                  <path d="M12 5c-4 0-7 3-7 7 0 2.5 1.5 4.5 3.5 5.5.5.3 1 .5 1.5.5h4c.5 0 1-.2 1.5-.5 2-1 3.5-3 3.5-5.5 0-4-3-7-7-7z"/>
                  <path d="M7 6L5 2l4 2.5M17 6l2-4-4 2.5"/>
                </svg>
                ${
                  count > 1
                    ? `<span style="position: absolute; top: -3px; right: -3px; background: #ea580c; color: white; font-size: 10px; font-weight: bold; width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.25);">${count}</span>`
                    : ""
                }
              </div>
            `,
            iconSize: [42, 42],
            iconAnchor: [21, 21],
          });

          const marker = L.marker([cluster.centerLat, cluster.centerLng], {
            icon: categoryIcon,
          });

          marker.on("click", () => {
            // Clicking cluster: Smoothly zooms in to break out into individual photo pins!
            map.flyTo([cluster.centerLat, cluster.centerLng], 18, {
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
        // =========================================================================
        // 📷 ZOOM IN (>= 18): Breakout! Show individual photo pins at exact GPS
        // =========================================================================
        SAMPLE_SPOTS.forEach((spot) => {
          const photoPinIcon = L.divIcon({
            className: "photo-spot-pin",
            html: `
              <div style="width: 48px; height: 48px; border-radius: 12px; overflow: hidden; border: 2.5px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.35); cursor: pointer; background: white; transition: transform 0.2s;">
                <img src="${spot.photoUrl}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
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

    // Initial draw
    updateMarkers(true);

    const onZoomEnd = () => updateMarkers();
    map.on("zoomend", onZoomEnd);

    mapRef.current = map;

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
