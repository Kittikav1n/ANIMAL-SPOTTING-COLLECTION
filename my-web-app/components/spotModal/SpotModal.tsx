"use client";

import { useState, useEffect } from "react";
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
  Edit,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/utils/axiosInstance";
import AnimalIcon from "@/components/spotModal/AnimalIcon";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export interface AnimalItem {
  animalId: number;
  categoryId: number;
  name: string;
  spotsCount: number;
  animalImagePin: string;
}

export type SpotImageItem =
  | { type: "existing"; url: string }
  | { type: "new"; file: File; previewUrl: string };

export interface SpotEditData {
  id: string;
  title: string;
  description: string;
  date: Date;
  animals: AnimalItem[];
  images: string[]; // URL รูปเดิมทั้งหมด
}

interface SpotModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  mode?: "create" | "edit";
  initialData?: SpotEditData | null;
  spotData: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  onSaveSpot: (data: {
    lat: number;
    lng: number;
    address: string;
    title: string;
    description: string;
    date: Date;
    animals: AnimalItem[];
    images: File[]; // รูปใหม่เพิ่มมาตอน edit เเยกเพื่อเอามา upload to r2
    existingImageUrls?: string[]; // รูปเดิมที่ผู้ใช้ยังเก็บไว้ตอน edit
  }) => Promise<void> | void;
}

export default function SpotModal({
  isOpen,
  onClose,
  spotData,
  onSaveSpot,
  mode,
  initialData,
}: SpotModalProps) {
  const [view, setView] = useState<"main" | "select-animal">("main");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnimals, setSelectedAnimals] = useState<AnimalItem[]>([]);
  const [selectedImages, setSelectedImages] = useState<SpotImageItem[]>([]);
  const [isEditingImages, setIsEditingImages] = useState(false);
  const [previewFullImage, setPreviewFullImage] = useState<string | null>(null);
  const [animalsList, setAnimalsList] = useState<AnimalItem[]>([]);
  const [isLoadingAnimals, setIsLoadingAnimals] = useState(false);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // เพิ่มสัตว์ลงในรายการที่เลือก
  const handleSelectAnimal = (animal: AnimalItem) => {
    setSelectedAnimals((prev) => [...prev, animal]);
  };

  // ลบสัตว์ออกจากรายการที่เลือก
  const handleRemoveAnimal = (animalId: number) => {
    setSelectedAnimals((prev) =>
      prev.filter((item) => item.animalId !== animalId),
    );
  };

  // กรองสัตว์ที่ไม่ถูกเลือก และตรงกับคำค้นหา
  const availableAnimals = animalsList.filter(
    (animal) =>
      !selectedAnimals.some(
        (selected) => selected.animalId === animal.animalId,
      ) && animal.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // save spot จาก form information
  const handleSave = async () => {
    if (!spotData) {
      toast.error("Location coordinates not found on the map.");
      return;
    }
    if (selectedAnimals.length === 0) {
      toast.warning("Please select at least one animal species.");
      return;
    }

    if (selectedImages.length === 0) {
      toast.warning("Please upload at least one photo.");
      return;
    }
    try {
      setIsSubmitting(true);

      const existingImageUrls = selectedImages
        .filter(
          (item): item is { type: "existing"; url: string } =>
            item.type === "existing",
        )
        .map((item) => item.url);

      const newFiles = selectedImages
        .filter(
          (item): item is { type: "new"; file: File; previewUrl: string } =>
            item.type === "new",
        )
        .map((item) => item.file);

      await onSaveSpot({
        lat: spotData.lat,
        lng: spotData.lng,
        address: spotData.address,
        title: title.trim(),
        description,
        date: selectedDate || new Date(),
        animals: selectedAnimals,
        images: newFiles,
        existingImageUrls,
      });

      // เคลียร์ค่าเมื่อบันทึกสำเร็จเท่านั้น
      setTitle("");
      setDescription("");
      setSelectedAnimals([]);
      setSelectedImages([]);
      onClose(false);
    } catch (error) {
      // Error ถูกจัดการและแจ้งเตือนในหน้าหลักแล้ว Modal จะไม่ปิดเพื่อให้ผู้ใช้กดลองใหม่ได้
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setView("main");
      setTitle("");
      setDescription("");
      setSelectedAnimals([]);
      setSelectedImages([]);
      setIsEditingImages(false);
      setSearchQuery("");
    }
    onClose(open);
  };

  // ดึงข้อมูลสัตว์จากฐานข้อมูลเมื่อเปิด Modal
  useEffect(() => {
    const fetchAnimals = async () => {
      if (!isOpen) return;
      setIsLoadingAnimals(true);
      try {
        const response = await axiosInstance.get("/api/animals");
        if (response.data.success) {
          setAnimalsList(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching animals:", err);
      } finally {
        setIsLoadingAnimals(false);
      }
    };
    fetchAnimals();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setSelectedDate(
        initialData.date ? new Date(initialData.date) : new Date(),
      );
      setSelectedAnimals(initialData.animals || []);
      setSelectedImages(
        (initialData.images || []).map((url) => ({ type: "existing", url })),
      );
    } else {
      // โหมด create เคลียร์ค่าเริ่มต้น
      setTitle("");
      setDescription("");
      setSelectedDate(new Date());
      setSelectedAnimals([]);
      setSelectedImages([]);
    }
  }, [isOpen, mode, initialData]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`
            flex flex-col bg-card shadow-2xl overflow-hidden outline-none duration-100
            fixed inset-0 h-[100dvh] w-full max-w-none rounded-none p-4 translate-x-0 translate-y-0
            md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
            md:h-auto md:max-h-[120dvh] md:max-w-[700px] md:rounded-2xl md:p-6
        `}
        showCloseButton={view !== "select-animal"}
      >
        {/* Header หน้า Add spot กับ Add animal species */}
        <DialogHeader className="pb-3 border-b border-border relative flex flex-row items-center justify-center min-h-[40px]">
          {view === "select-animal" && (
            <button
              type="button"
              onClick={() => setView("main")}
              className="absolute left-0 p-1 hover:bg-muted rounded-full transition text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <DialogTitle className="text-lg font-bold text-center text-foreground">
            {view === "main"
              ? mode == "edit"
                ? "Edit Spot"
                : "Add New Spot"
              : "Add Animal Species"}
          </DialogTitle>
        </DialogHeader>

        {view === "main" && (
          <>
            {spotData && (
              <div className="flex flex-1 min-h-0 flex-col md:max-h-[70vh] overflow-y-auto gap-4 pb-8 md:pb-1 mt-2 w-full pl-1 pr-2 custom-scrollbar">
                {/* Profile */}
                <div className="flex items-center gap-3 bg-muted/60 p-3 rounded-xl border border-border w-full">
                  <div className="w-10 h-10 rounded-full bg-accent text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.username || "User profile"}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      user?.username?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {user?.username}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                      <span className="flex-shrink-0">Address:</span>
                      <span className="truncate">{spotData.address}</span>
                    </div>
                  </div>
                </div>

                {/* Display Selected Animals Badges (ใช้สีเขียวเทา bg-accent text-accent-foreground) */}
                {selectedAnimals.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg border border-dashed border-border">
                    {selectedAnimals.map((animal) => (
                      <span
                        key={animal.animalId}
                        className="text-xs bg-accent text-accent-foreground border border-secondary/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium"
                      >
                        <AnimalIcon
                          pinName={animal.animalImagePin}
                          className="w-4 h-4 text-secondary"
                        />
                        {animal.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title input */}
                <div className="w-full">
                  <Input
                    placeholder="Enter spot title (e.g., Friendly cat near garden)"
                    className="w-full rounded-xl border-border bg-card text-sm h-11 focus-visible:ring-secondary"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Spot Description */}
                <div className="w-full h-[140px] md:h-[160px] shrink-0 rounded-xl border border-border p-3 overflow-hidden bg-card focus-within:ring-2 focus-within:ring-secondary flex flex-col">
                  <Textarea
                    placeholder="Describe or share something about your experience"
                    className="w-full flex-1 resize-none border-0 bg-transparent p-1 focus-visible:ring-0 shadow-none focus-visible:outline-none custom-scrollbar"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Image Selected */}
                {selectedImages.length > 0 && (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="hidden md:flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Photos ({selectedImages.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingImages(true)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-lg transition cursor-pointer border border-border"
                      >
                        <Edit className="w-4 h-4 text-secondary" />
                        Edit All
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 w-full">
                      {selectedImages.slice(0, 6).map((file, index) => {
                        const mobileRemaining = selectedImages.length - 5;
                        const desktopRemaining = selectedImages.length - 6;

                        return (
                          <div
                            key={index}
                            onClick={() => {
                              setIsEditingImages(true);
                            }}
                            className={`relative rounded-xl overflow-hidden border border-border bg-muted cursor-pointer group ${
                              index === 0
                                ? "col-span-2 md:col-span-1 h-36 md:h-28"
                                : "h-28 md:h-28"
                            } ${
                              index === 5 ? "hidden md:block" : "" // รูปที่ 6 ซ่อนบนมือถือ แสดงเฉพาะ Desktop
                            }`}
                          >
                            <img
                              src={
                                file.type === "existing"
                                  ? file.url
                                  : file.previewUrl
                              }
                              alt={`preview-${index}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            />

                            {/* Overlay +N สำหรับมือถือ (รูปที่ 5, index === 4) */}
                            {index === 4 && mobileRemaining > 0 && (
                              <div className="md:hidden absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-lg">
                                +{mobileRemaining}
                              </div>
                            )}

                            {/* Overlay +N สำหรับ Desktop (รูปที่ 6, index === 5) */}
                            {index === 5 && desktopRemaining > 0 && (
                              <div className="hidden md:flex absolute inset-0 bg-black/50 backdrop-blur-[2px] items-center justify-center text-white font-bold text-lg">
                                +{desktopRemaining}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImages((prev) =>
                                  prev.filter((_, i) => i !== index),
                                );
                              }}
                              className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tool Submit btn */}
            <div className="flex flex-shrink-0 items-end justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-3 md:gap-6 text-muted-foreground">
                {/* Image Dropdown -> Camera, Gallery */}
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <ImageIcon className="hover:text-secondary cursor-pointer w-5 h-5" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    className="rounded-xl shadow-lg border-border p-2 bg-popover"
                  >
                    <DropdownMenuItem
                      onClick={() =>
                        document.getElementById("camera-input")?.click()
                      }
                      className="cursor-pointer gap-2 rounded-lg py-2 text-foreground hover:text-secondary hover:bg-muted"
                    >
                      <Camera className="w-4 h-4 text-secondary" /> Take a Photo
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        document.getElementById("gallery-input")?.click()
                      }
                      className="cursor-pointer gap-2 rounded-lg py-2 text-foreground hover:text-secondary hover:bg-muted"
                    >
                      <FolderOpen className="w-4 h-4 text-secondary" /> Choose
                      from Gallery
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Select animal btn */}
                <button
                  type="button"
                  onClick={() => setView("select-animal")}
                  className="hover:text-secondary transition flex items-center gap-1 text-[10px] md:text-xs font-medium cursor-pointer"
                >
                  <Users className="w-5 h-5" />
                  {selectedAnimals.length > 0
                    ? `Selected (${selectedAnimals.length})`
                    : "Select Animal"}
                </button>

                {/* Calendar part */}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger>
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-muted-foreground hover:text-secondary transition cursor-pointer bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-full border border-border">
                      <CalendarIcon className="w-4 h-4" />
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
                    className="w-auto p-0 rounded-2xl shadow-xl border-border"
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
                disabled={isSubmitting}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 h-9 rounded-xl font-medium cursor-pointer"
              >
                {isSubmitting
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save Changes"
                    : "Continue"}
              </Button>
            </div>
          </>
        )}

        {/* หน้าต่างย่อย Edit Image เปิดเมื่อกด Edit All */}
        {isEditingImages && (
          <div className="absolute inset-0 bg-card z-50 flex flex-col p-4 md:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <button
                type="button"
                onClick={() => setIsEditingImages(false)}
                className="p-1.5 hover:bg-muted rounded-full transition text-foreground cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-xs font-medium hidden md:inline">
                  Back
                </span>
              </button>
              <h3 className="text-base font-bold text-foreground">
                Edit Image/Video
              </h3>
              <Button
                type="button"
                onClick={() => setIsEditingImages(false)}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 py-1.5 h-8 rounded-lg text-xs font-medium cursor-pointer"
              >
                Accept
              </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedImages.map((file, index) => {
                const imgUrl =
                  file.type === "existing" ? file.url : file.previewUrl;
                return (
                  <div
                    key={index}
                    onClick={() => setPreviewFullImage(imgUrl)} // <-- กดรูปเพื่อดูเต็มจอ
                    className="relative w-full h-56 md:h-48 rounded-2xl overflow-hidden border border-border bg-muted shadow-sm group cursor-zoom-in"
                  >
                    <img
                      src={imgUrl}
                      alt={`edit-preview-${index}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // <-- กันไม่ให้ไปทริกเกอร์เปิดรูปเต็มตอนกดปุ่มลบ
                        setSelectedImages((prev) =>
                          prev.filter((_, i) => i !== index),
                        );
                        if (selectedImages.length <= 1) {
                          setIsEditingImages(false);
                        }
                      }}
                      className="absolute top-3 right-3 bg-black/70 hover:bg-destructive text-white rounded-full p-1.5 transition shadow-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Modal แสดงรูปเต็มเมื่อคลิกที่รูปในหน้า Edit All */}
            {previewFullImage && (
              <div
                onClick={() => setPreviewFullImage(null)}
                className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-zoom-out"
              >
                <button
                  type="button"
                  onClick={() => setPreviewFullImage(null)}
                  className="absolute top-4 right-4 bg-white/15 hover:bg-white/30 text-white rounded-full p-2 transition cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={previewFullImage}
                  alt="Full screen preview"
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-full max-h-[85dvh] object-contain rounded-xl shadow-2xl cursor-default"
                />
              </div>
            )}
          </div>
        )}

        {view === "select-animal" && (
          <div className="flex flex-col gap-4 pt-2 flex-1 min-h-0">
            {/* Animal Selected Box */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <span className="text-xs text-muted-foreground font-medium">
                Animal Selected
              </span>
              <div className="min-h-[46px] max-h-[85px] overflow-y-auto p-2 rounded-xl border border-border flex flex-wrap gap-1.5 items-center bg-muted/40 custom-scrollbar">
                {selectedAnimals.length === 0 ? (
                  <span className="text-xs text-muted-foreground pl-1">
                    No animal selected
                  </span>
                ) : (
                  selectedAnimals.map((animal) => (
                    <div
                      key={animal.animalId}
                      className="flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full animate-in fade-in zoom-in duration-150"
                    >
                      <AnimalIcon
                        pinName={animal.animalImagePin}
                        className="w-4 h-4 text-secondary"
                      />
                      <span>{animal.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAnimal(animal.animalId)}
                        className="hover:bg-secondary/15 rounded-full p-0.5 transition cursor-pointer"
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
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ex. Dog, Cat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full bg-card border-border text-xs h-9 focus-visible:ring-secondary"
              />
            </div>

            {/* Animal List */}
            <div className="flex-1 min-h-0 md:max-h-[260px] overflow-y-auto custom-scrollbar divide-border border-t border-b border-border">
              {availableAnimals.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No options found
                </div>
              ) : (
                availableAnimals.map((animal) => (
                  <div
                    key={animal.animalId}
                    onClick={() => handleSelectAnimal(animal)}
                    className="flex items-center justify-between p-2.5 hover:bg-muted/60 cursor-pointer transition rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent text-secondary flex items-center justify-center shrink-0">
                        <AnimalIcon
                          pinName={animal.animalImagePin}
                          className="w-4 h-4 text-current"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">
                          {animal.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
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
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 rounded-xl font-medium text-md h-9 cursor-pointer"
              >
                Confirm
              </Button>
            </div>
          </div>
        )}

        {/* Two types input for upload image -> gallery(environment), camera */}
        <input
          id="camera-input"
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              const newItems: SpotImageItem[] = files.map((file) => ({
                type: "new",
                file,
                previewUrl: URL.createObjectURL(file),
              }));
              setSelectedImages((prev) => [...prev, ...newItems]);
            }
          }}
        />
        <input
          id="gallery-input"
          type="file"
          accept="image/*"
          className="hidden"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              const newItems: SpotImageItem[] = files.map((file) => ({
                type: "new",
                file,
                previewUrl: URL.createObjectURL(file),
              }));
              setSelectedImages((prev) => [...prev, ...newItems]);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
