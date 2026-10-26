"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Image as FolderOpen,
  Camera,
  ImageIcon,
  CalendarIcon,
  Users,
  ArrowLeft,
  Search,
  X,
} from "lucide-react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";

interface AnimalItem {
  id: number;
  name: string;
  spotsCount: number;
  avatar: string;
}

interface SpotModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  spotData: {
    lat: number;
    lng: number;
    address: string;
  } | null;
}

const INITIAL_ANIMALS: AnimalItem[] = [
  { id: 1, name: "DOG", spotsCount: 100, avatar: "🐶" },
  { id: 2, name: "CAT", spotsCount: 85, avatar: "🐱" },
  { id: 3, name: "BIRD", spotsCount: 42, avatar: "🐦" },
  { id: 4, name: "RABBIT", spotsCount: 20, avatar: "🐰" },
  { id: 5, name: "FOX", spotsCount: 15, avatar: "🦊" },
  { id: 6, name: "HAMSTER", spotsCount: 60, avatar: "🐹" },
];

export default function SpotModal({
  isOpen,
  onClose,
  spotData,
}: SpotModalProps) {
  const [view, setView] = useState<"main" | "select-animal">("main");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnimals, setSelectedAnimals] = useState<AnimalItem[]>([]);

  // เพิ่มสัตว์ลงในรายการที่เลือก
  const handleSelectAnimal = (animal: AnimalItem) => {
    setSelectedAnimals((prev) => [...prev, animal]);
  };

  // ลบสัตว์ออกจากรายการที่เลือก
  const handleRemoveAnimal = (animalId: number) => {
    setSelectedAnimals((prev) => prev.filter((item) => item.id !== animalId));
  };

  // กรองสัตว์ที่ไม่ถูกเลือก และตรงกับคำค้นหา
  const availableAnimals = INITIAL_ANIMALS.filter(
    (animal) =>
      !selectedAnimals.some((selected) => selected.id === animal.id) &&
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSave = () => {};

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setView("main"); 
    }
    onClose(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        // mobile: inset full เต็มจอ  |  Desktop Modal fixed ความกว้างในกล่อง modal ให้ element มันขยายเต็ม สูงตาม content
        className={`
            flex flex-col bg-white shadow-2xl overflow-hidden outline-none duration-100
            fixed inset-0 h-[100dvh] w-full max-w-none rounded-none p-4 translate-x-0 translate-y-0
            md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
            md:h-auto md:max-h-[85vh] md:rounded-2xl md:p-6
            ${view === "select-animal" ? "md:w-[600px]" : "md:w-auto"}
        `}
        hideCloseButton={view === "select-animal"}
      >
        {/* Header หน้า Add spot กับ Add animal species */}
        <DialogHeader className="pb-3 border-b relative flex flex-row items-center justify-center min-h-[40px]">
          {view === "select-animal" && (
            <button
              type="button"
              onClick={() => setView("main")}
              className="absolute left-0 p-1 hover:bg-slate-100 rounded-full transition text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <DialogTitle className="text-lg font-bold text-center text-slate-800">
            {view === "main" ? "Add New Spot" : "Add Animal Species"}
          </DialogTitle>
        </DialogHeader>

        {view === "main" && (
          <>
            {spotData && (
            //   Profile
              <div className="flex flex-1 min-h-0 flex-col md:max-h-[70vh] overflow-y-auto gap-4 pb-8 md:pb-1 mt-2 w-full pl-1 pr-2 custom-scrollbar">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border w-full max-w-sm md:max-w-2xl">
                  <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    A
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      Achirakorn Thawontantikun
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 min-w-0">
                      <span className="flex-shrink-0">Address:</span>
                      <span className="truncate">{spotData.address}</span>
                    </div>
                  </div>
                </div>

                {/* Display Selected Animals Badges */}
                {selectedAnimals.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    {selectedAnimals.map((animal) => (
                      <span
                        key={animal.id}
                        className="text-xs bg-amber-900 text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium"
                      >
                        <span>{animal.avatar}</span>
                        {animal.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Spot Description */}
                <div className="w-full max-w-sm md:max-w-2xl min-h-[250px] md:min-h-full rounded-xl border border-slate-200 p-3 overflow-y-auto custom-scrollbar bg-white focus-within:ring-2 focus-within:ring-emerald-700 flex flex-col">
                  <Textarea
                    placeholder="Describe or share something about your experience"
                    className="w-full flex-1 resize-none border-0 bg-transparent p-1 focus-visible:ring-0 shadow-none focus-visible:outline-none custom-scrollbar"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Tool Submit btn */}
            <div className="flex flex-shirk-0 items-end justify-between pt-2 border-t">
              <div className="flex items-center gap-3 md:gap-6 text-slate-600">
                {/* Image Dropdown -> Camera, Gallery */}
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <ImageIcon className="hover:text-emerald-700 cursor-pointer w-5 h-5" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    className="rounded-xl shadow-lg border-slate-100 p-2 bg-white"
                  >
                    {/* Camera */}
                    <DropdownMenuItem
                      onClick={() =>
                        document.getElementById("camera-input")?.click()
                      }
                      className="cursor-pointer gap-2 rounded-lg py-2 text-slate-700 hover:text-emerald-800 hover:bg-slate-50"
                    >
                      <Camera className="w-4 h-4 text-emerald-700" /> Take a
                      Photo
                    </DropdownMenuItem>

                    {/* Gallery */}
                    <DropdownMenuItem
                      onClick={() =>
                        document.getElementById("gallery-input")?.click()
                      }
                      className="cursor-pointer gap-2 rounded-lg py-2 text-slate-700 hover:text-emerald-800 hover:bg-slate-50"
                    >
                      <FolderOpen className="w-4 h-4 text-emerald-700" /> Choose
                      from Gallery
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Select animal btn */}
                <button
                  type="button"
                  onClick={() => setView("select-animal")}
                  className="hover:text-emerald-700 transition flex items-center gap-1 text-[10px] md:text-xs font-medium cursor-pointer"
                >
                  <Users className="w-5 h-5" />
                  {selectedAnimals.length > 0
                    ? `Selected (${selectedAnimals.length})`
                    : "Select Animal"}
                </button>

                {/* Calendar part */}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger>
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-slate-600 hover:text-emerald-700 transition cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                      <CalendarIcon className="w-4 h-4 hover:text-emerald-700" />
                      <span>
                        {selectedDate
                          ? selectedDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Select Date"}
                      </span>
                    </div>
                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    className="w-auto p-0 rounded-2xl shadow-xl border-slate-200"
                  >
                    <Card size="sm" className="w-fit border-0 shadow-none">
                      <CardContent className="p-3">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date); 
                            setIsCalendarOpen(false); 
                          }}
                          className="p-0"
                        />
                      </CardContent>
                    </Card>
                  </PopoverContent>
                </Popover>
              </div>
            
            {/* Save Btn */}
              <Button
                onClick={handleSave}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 rounded-xl font-medium"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {view === "select-animal" && (
          <div className="flex flex-col gap-4 pt-2 flex-1 min-h-0">
            {/* Animal Selected Box */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Animal Selected
              </span>
              <div className="min-h-[46px] max-h-[85px] overflow-y-auto p-2 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 items-center bg-slate-50/50 custom-scrollbar">
                {selectedAnimals.length === 0 ? (
                  <span className="text-xs text-slate-400 pl-1">
                    No animal selected
                  </span>
                ) : (
                  selectedAnimals.map((animal) => (
                    <div
                      key={animal.id}
                      className="flex items-center gap-1.5 bg-[#5c2a18] text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm animate-in fade-in zoom-in duration-150"
                    >
                      <span className="text-xs">{animal.avatar}</span>
                      <span>{animal.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAnimal(animal.id)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Ex. Dog, Cat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full bg-white border-slate-200 text-xs h-9 focus-visible:ring-emerald-700"
              />
            </div>

            {/* Animal List */}
            <div className="flex-1 min-h-0 md:max-h-[260px] overflow-y-auto custom-scrollbar divide-slate-100 border-t border-b">
              {availableAnimals.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No options found
                </div>
              ) : (
                availableAnimals.map((animal) => (
                  <div
                    key={animal.id}
                    onClick={() => handleSelectAnimal(animal)}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer transition rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm">
                        {animal.avatar}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          {animal.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {animal.spotsCount} Spots
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Confirm Button */}
            <div className="flex justify-end pt-1 shrink-0">
              <Button
                type="button"
                onClick={() => setView("main")}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-6 rounded-xl font-medium text-xs h-9"
              >
                Confirm
              </Button>
            </div>
          </div>
        )}

        {/* twotyoe input for upload imagge -> gallery(enviroment), camera */}
        <input
          id="camera-input"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) console.log("Camera image:", file);
          }}
        />
        <input
          id="gallery-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) console.log("Gallery image:", file);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
