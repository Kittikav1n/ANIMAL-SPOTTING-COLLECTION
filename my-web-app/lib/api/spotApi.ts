import axiosInstance from "@/utils/axiosInstance";
import { SpotPinData } from "@/components/MapComponent";
import { AnimalCategoryOption } from "@/components/map/AnimalFilterDrawer";

// -------------------------------------------------------------
// Type Definitions for Backend Data Transfer
// -------------------------------------------------------------

export interface BackendAnimalItem {
  animalId: number;
  categoryId: number;
  name: string;
  animalImagePin?: string;
  spotsCount?: number;
}

export interface BackendSpotItem {
  id?: number | string;
  spotId?: number | string;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  address?: string;
  images?: string[];
  photoUrl?: string;
  category?: string[] | string;
  animals?: Array<{ animalId?: number; name: string } | string>;
  author?: {
    name: string;
    avatar?: string;
  };
  authorName?: string;
  authorAvatar?: string;
  createdAt?: string;
}

export interface CreateSpotPayload {
  title: string;
  lat: number;
  lng: number;
  address: string;
  description: string;
  category: string[];
  images: string[];
  photoUrl: string;
  authorName?: string;
  authorAvatar?: string;
  animals?: any[];
}

// Transform backend spot data into SpotPinData for Map UI
export function transformBackendSpot(raw: any): SpotPinData {
  const id = String(raw.id || raw.spotId || Date.now());
  const title = raw.title || "Animal Spot";
  const lat = Number(raw.lat);
  const lng = Number(raw.lng);
  const address = raw.address || "Unknown Location";
  const description = raw.description || "";

  // Handle category / animals
  let category: string[] = ["general"];
  if (Array.isArray(raw.category)) {
    category = raw.category.map((c: any) => String(c).toLowerCase());
  } else if (typeof raw.category === "string" && raw.category.trim()) {
    category = [raw.category.toLowerCase()];
  } else if (Array.isArray(raw.animals) && raw.animals.length > 0) {
    category = raw.animals.map((a: any) =>
      typeof a === "string"
        ? a.toLowerCase()
        : String(a.name || "animal").toLowerCase()
    );
  }

  // Handle images / photoUrl
  let images: string[] = [];
  if (Array.isArray(raw.images) && raw.images.length > 0) {
    images = raw.images;
  } else if (raw.photoUrl) {
    images = [raw.photoUrl];
  }
  const photoUrl = raw.photoUrl || images[0] || "";

  // Handle author
  const author = {
    name:
      raw.author?.name ||
      raw.authorName ||
      raw.createdBy?.name ||
      "Spotter",
    avatar:
      raw.author?.avatar ||
      raw.authorAvatar ||
      raw.createdBy?.avatar ||
      "",
  };

  return {
    id,
    title,
    lat,
    lng,
    address,
    description,
    category,
    images,
    photoUrl,
    author,
  };
}

// -------------------------------------------------------------
// API Functions
// -------------------------------------------------------------

/**
 * 1. Fetch all animal spots (GET /api/spots)
 */
export async function fetchSpotsApi(): Promise<{
  spots: SpotPinData[];
  isFromBackend: boolean;
}> {
  try {
    const response = await axiosInstance.get("/api/spots", { timeout: 4000 });
    const data = response.data;

    let spotList: any[] = [];
    if (data && data.success && Array.isArray(data.data)) {
      spotList = data.data;
    } else if (Array.isArray(data)) {
      spotList = data;
    }

    if (spotList.length > 0) {
      const transformed = spotList.map(transformBackendSpot);
      return { spots: transformed, isFromBackend: true };
    }
  } catch (error) {
    console.warn("Backend /api/spots is unreachable or returned error:", error);
  }

  // Return empty array instead of static data
  return { spots: [], isFromBackend: false };
}

/**
 * 2. Create a new animal spot (POST /api/spots)
 */
export async function createSpotApi(
  payload: CreateSpotPayload
): Promise<SpotPinData> {
  try {
    const response = await axiosInstance.post("/api/spots", payload, {
      timeout: 5000,
    });
    const data = response.data;

    if (data && data.success && data.data) {
      return transformBackendSpot(data.data);
    }
    if (data && data.id) {
      return transformBackendSpot(data);
    }
  } catch (error) {
    console.warn("POST /api/spots failed or backend offline:", error);
  }

  return {
    id: Date.now().toString(),
    title: payload.title,
    lat: payload.lat,
    lng: payload.lng,
    address: payload.address,
    description: payload.description,
    category: payload.category,
    images: payload.images,
    photoUrl: payload.photoUrl,
    author: {
      name: payload.authorName || "Spotter",
      avatar: payload.authorAvatar || "",
    },
  };
}

/**
 * 3. Fetch all animal categories from database (GET /api/animals)
 */
export async function fetchAnimalsApi(): Promise<AnimalCategoryOption[]> {
  try {
    const response = await axiosInstance.get("/api/animals", { timeout: 4000 });
    const data = response.data;

    let animalList: BackendAnimalItem[] = [];
    if (data && data.success && Array.isArray(data.data)) {
      animalList = data.data;
    } else if (Array.isArray(data)) {
      animalList = data;
    }

    if (animalList.length > 0) {
      return animalList.map((item) => ({
        id: item.name.toLowerCase().trim(),
        name: item.name.toUpperCase(),
        // ดึงรหัสไอคอน Iconify จาก column animalImagePin ใน Database มาใส่ใน pinName
        pinName: item.animalImagePin || "ph:question",
      }));
    }
  } catch (error) {
    console.warn("Backend /api/animals is unreachable:", error);
  }

  // Return empty array instead of static ANIMAL_OPTIONS
  return [];
}