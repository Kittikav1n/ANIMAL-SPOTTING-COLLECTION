"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { SpotPinData } from "@/components/MapComponent";
import { ArrowLeft, ChevronLeft, ChevronRight, Images, MapPin, User } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });
const ignoreMapClick = () => undefined;

function subscribeToProfile(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener("animal-spotting:profile-updated", onChange);

    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("animal-spotting:profile-updated", onChange);
    };
}
function readProfile() {
    try {
        return localStorage.getItem("animal-spotting:profile-preview:v1") ?? "";
    } catch {
        return "";
    }
}

function SpotPost({ spot }: { spot: SpotPinData }) {
    const [photoIndex, setPhotoIndex] = useState(0);
    const photos = spot.images.length > 0 ? spot.images : [spot.photoUrl];

    function changePhoto(direction: number) {
        setPhotoIndex((current) => (current + direction + photos.length) % photos.length);
    }

    return (
        <article id={`collection-post-${spot.id}`} aria-labelledby={`collection-post-title-${spot.id}`} tabIndex={-1} className="space-y-3 focus:outline-none">
            <header className="flex items-center gap-3">
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E0ECDD] text-[#526E4E] sm:size-12">
                    {spot.author.avatar || <User className="size-5 sm:size-6" />}
                </span>
                <div className="min-w-0">
                    <p className="break-words text-base font-semibold sm:text-lg">{spot.author.name}</p>
                    <h2 id={`collection-post-title-${spot.id}`} className="break-words text-sm text-slate-600">{spot.title}</h2>
                </div>
            </header>

            <div className="relative overflow-hidden rounded-md bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={photos[photoIndex]}
                    alt={`${spot.title}, photo ${photoIndex + 1}`}
                    loading="lazy"
                    className="block aspect-square w-full object-contain"
                />
                {photos.length > 1 && (
                    <>
                        <button type="button" aria-label="Previous photo" onClick={() => changePhoto(-1)} className="absolute top-1/2 left-2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/65 text-white hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                            <ChevronLeft className="size-5" aria-hidden="true" />
                        </button>
                        <button type="button" aria-label="Next photo" onClick={() => changePhoto(1)} className="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/65 text-white hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                            <ChevronRight className="size-5" aria-hidden="true" />
                        </button>
                        <p aria-live="polite" className="absolute right-2 bottom-2 rounded bg-black/65 px-2 py-1 text-xs text-white">
                            {photoIndex + 1} / {photos.length}
                        </p>
                    </>
                )}
            </div>

            <p className="text-sm leading-relaxed sm:text-base">{spot.description}</p>
            <p className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                <span>KMUTT · {spot.lat.toFixed(6)}, {spot.lng.toFixed(6)}</span>
            </p>
        </article>
    );
}

export default function Collection() {
    const saveProfile = useSyncExternalStore(subscribeToProfile, readProfile, () => "");
    let profile: { username?: string; email?: string; avatar?: string } | null = null;
    try {
        profile = JSON.parse(saveProfile || "null");
    } catch {
        // Keep the default profile if the stored value cannot be read.
    }
    const [sampleSpots, setSampleSpots] = useState<SpotPinData[] | null>(null);
    const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
    const gridScrollRef = useRef<HTMLDivElement>(null);
    const detailScrollRef = useRef<HTMLDivElement>(null);
    const gridPosition = useRef<{ spotId: string; scrollTop: number } | null>(null);

    useEffect(() => {
        let active = true;

        import("@/components/MapComponent")
            .then(({ SAMPLE_SPOTS }) => {
                if (active) setSampleSpots(SAMPLE_SPOTS);
            })
            .catch((error) => console.error("Could not load sample spots", error));

        return () => { active = false; };
    }, []);

    useLayoutEffect(() => {
        if (selectedSpotId) {
            const scroller = detailScrollRef.current;
            const post = document.getElementById(`collection-post-${selectedSpotId}`);
            if (!scroller || !post) return;

            scroller.scrollTop = post.previousElementSibling
                ? scroller.scrollTop + post.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 16
                : 0;
            post.focus({ preventScroll: true });
        } else if (gridPosition.current) {
            const { spotId, scrollTop } = gridPosition.current;
            if (gridScrollRef.current) gridScrollRef.current.scrollTop = scrollTop;
            document.getElementById(`collection-spot-${spotId}`)?.focus({ preventScroll: true });
            gridPosition.current = null;
        }
    }, [selectedSpotId]);

    function openSpot(spotId: string) {
        gridPosition.current = { spotId, scrollTop: gridScrollRef.current?.scrollTop ?? 0 };
        setSelectedSpotId(spotId);
    }

    const selectedSpot = sampleSpots?.find((spot) => spot.id === selectedSpotId);

    const profileSummary = {
        avatar: profile?.avatar ?? "",
        name: profile?.username ?? "FirstName LastName",
        email: profile?.email ?? "name@example.com",
        spottingCount: sampleSpots ? `${sampleSpots.length}` : "—",
    };
    return (
        <main className="relative isolate flex min-h-0 flex-1 overflow-hidden bg-[#E9ECE5] text-slate-900">
            <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" inert>
                <MapComponent onRightClick={ignoreMapClick} />
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 bg-[#17251A]/20 backdrop-blur-[3px]" aria-hidden="true" />

            <div
                ref={selectedSpot ? undefined : gridScrollRef}
                className={`relative z-20 min-h-0 min-w-0 flex-1 px-4 pt-4 pb-24 sm:p-8 ${selectedSpot ? "flex overflow-hidden" : "overflow-y-auto"}`}
            >
                {selectedSpot ? (
                    <section aria-label="Spotting details" className="mx-auto flex min-h-0 w-full max-w-[1040px] flex-col overflow-hidden rounded-lg bg-white shadow-md">
                        <header className="shrink-0 px-4 pt-3 sm:px-8 sm:pt-5">
                            <button
                                type="button"
                                aria-label="Back to Collection"
                                onClick={() => setSelectedSpotId(null)}
                                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526E4E] max-sm:w-11 max-sm:justify-center lg:text-base"
                            >
                                <ArrowLeft aria-hidden="true" className="size-5" />
                                <span className="hidden sm:inline">back</span>
                            </button>
                        </header>
                        <div ref={detailScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-8 sm:px-8 sm:pt-5 sm:pb-12">
                            <div className="mx-auto w-full max-w-[min(30rem,65svh)] space-y-8 sm:space-y-12">
                                {sampleSpots?.map((spot) => <SpotPost key={spot.id} spot={spot} />)}
                            </div>
                        </div>
                    </section>
                ) : (
                    <section aria-labelledby="collection-title" className="mx-auto w-full max-w-[1040px] rounded-lg bg-white p-6 shadow-md max-[360px]:px-3">
                        <header className="relative max-sm:grid max-sm:grid-cols-[44px_minmax(0,1fr)_44px] max-sm:items-center">
                            <Link href="/map" aria-label="Back to map" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526E4E] max-sm:justify-center sm:mb-5 lg:absolute lg:top-0 lg:left-0 lg:mb-0 lg:text-base">
                                <ArrowLeft aria-hidden="true" className="size-5" />
                                <span className="hidden sm:inline">back</span>
                            </Link>
                            <h1 id="collection-title" className="text-center text-[22px] font-bold tracking-tight max-sm:leading-tight sm:text-4xl lg:px-40 lg:text-[32px] lg:leading-tight">Collection</h1>
                            <div className="mx-auto mt-2 h-px w-32 bg-[#DCDCE2] max-sm:col-span-3 sm:mt-5 sm:w-64" />
                        </header>
                        {/**/}
                        <div className="mx-auto mt-6 flex w-full max-w-[700px] justify-center items-center gap-4 rounded-lg border border-slate-200 p-6 shadow-sm max-[360px]:gap-3 max-[360px]:px-3 sm:gap-6 sm:p-8">
                            {/*profile*/}
                            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E0ECDD] text-[#526E4E] sm:size-28">
                                {profileSummary.avatar ? (
                                    <img
                                        src={profileSummary.avatar}
                                        alt="Profile photo"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <User className="size-8 sm:size-14" strokeWidth={1.5} aria-hidden="true" />
                                )}
                            </div>
                            <dl className="min-w-0 space-y-2 text-base text-slate-900 sm:text-lg">
                                {/*name*/}
                                <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-baseline gap-x-2 sm:grid-cols-[5rem_minmax(0,1fr)]">
                                    <dt className="font-medium">Name</dt>
                                    <dd className="break-words">{profileSummary.name}</dd>
                                </div>
                                {/*email*/}
                                <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-baseline gap-x-2 sm:grid-cols-[5rem_minmax(0,1fr)]">
                                    <dt className="font-medium">Email</dt>
                                    <dd className="[overflow-wrap:anywhere]">{profileSummary.email}</dd>
                                </div>
                                {/*spot*/}
                                <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-baseline gap-x-2 sm:grid-cols-[5rem_minmax(0,1fr)]">
                                    <dt className="font-medium">Spotting</dt>
                                    <dd>{profileSummary.spottingCount}</dd>
                                </div>
                            </dl>
                        </div>
                        {/*Spotting*/}
                        <div className="mx-auto mt-6 w-full max-w-[900px] sm:mt-8">
                            <ul
                                aria-label="Spotting photos"
                                className={`grid gap-px overflow-hidden rounded-sm ${(sampleSpots?.length ?? 0) < 3 ? "grid-cols-2" : "grid-cols-3" }`}>
                                {sampleSpots?.map((spot) => (
                                    <li key={spot.id} className="overflow-hidden bg-slate-100">
                                        <button
                                            id={`collection-spot-${spot.id}`}
                                            type="button"
                                            onClick={() => openSpot(spot.id)}
                                            className="relative block w-full cursor-pointer hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#526E4E]"
                                        >
                                            <img
                                                src={spot.images[0] ?? spot.photoUrl}
                                                alt={spot.title}
                                                loading="lazy"
                                                className="block aspect-[4/3] w-full object-cover"
                                            />
                                            {spot.images.length > 1 && (
                                                <>
                                                    <span aria-hidden="true" className="absolute top-1 right-1 rounded p-1 text-white sm:top-2 sm:right-2">
                                                        <Images className="size-3 sm:size-4" />
                                                    </span>
                                                    <span className="sr-only">Multiple photos</span>
                                                </>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}
            </div>
        </main>
    )
}
