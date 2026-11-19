// Type definitions สำหรับข้อมูล Spot ทั้งระบบ
// ใช้ร่วมกันทั้ง UI Component และ API layer

export interface SpotCreator {
  id: string;
  name: string;
  avatar?: string;
}

export interface SpotItem {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
  images: string[];         // URL รูปภาพ (สามารถมีหลายรูป)
  animals: string[];        // ชนิดสัตว์ที่พบ เช่น ["Cat", "Dog"]
  createdBy: SpotCreator;
  createdAt: string;        // ISO date string
}

export interface SpotFilters {
  animal?: string;          // "All" หรือชื่อสัตว์ เช่น "Elephant"
  search?: string;          // keyword สำหรับค้นหาชื่อ/คำอธิบาย
}
