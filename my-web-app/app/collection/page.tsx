"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { isAxiosError } from "axios";
import axiosInstance from "@/utils/axiosInstance";
import GuestProfileContent from "@/components/auth/GuestProfileContent";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { SpotPinData } from "@/components/MapComponent";
import { ArrowLeft, ChevronLeft, ChevronRight, ImageOff, Images, MapPin, User } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });
const ignoreMapClick = () => undefined;

type CollectionProfile = {
    username: string;
    email: string;
    avatar: string;
};

type CollectionSpotResponse = {
    spotId: number;
    title: string;
    description: string | null;
    address: string;
    latitude: string | number;
    longitude: string | number;
    photos: { photoId: number; photoUrl: string }[];
};

function toCollectionSpot(spot: CollectionSpotResponse, profile: CollectionProfile): SpotPinData {
    const lat = Number(spot.latitude);
    const lng = Number(spot.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("Invalid spot coordinates");
    }

    const images = [...spot.photos]
        .sort((a, b) => a.photoId - b.photoId)
        .map((photo) => photo.photoUrl)
        .filter((url) => url.trim().length > 0);

    return {
        id: String(spot.spotId),
        title: spot.title,
        description: spot.description ?? "",
        address: spot.address,
        author: { name: profile.username, avatar: profile.avatar },
        images,
        category: [],
        lat,
        lng,
    };
}

function SpotPost({ spot }: { spot: SpotPinData }) {
    const [photoIndex, setPhotoIndex] = useState(0);
    const photos = spot.images;

    function changePhoto(direction: number) {
        setPhotoIndex((current) => (current + direction + photos.length) % photos.length);
    }

    return (
        <article id={`collection-post-${spot.id}`} aria-labelledby={`collection-post-title-${spot.id}`} tabIndex={-1} className="space-y-3 focus:outline-none">
            <header className="flex items-center gap-3">
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E0ECDD] text-[#526E4E] sm:size-12">
                    {spot.author.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={spot.author.avatar} alt="" className="size-full object-cover" />
                    ) : <User className="size-5 sm:size-6" />}
                </span>
                <div className="min-w-0">
                    <p className="break-words text-base font-semibold sm:text-lg">{spot.author.name}</p>
                    <h2 id={`collection-post-title-${spot.id}`} className="break-words text-sm text-slate-600">{spot.title}</h2>
                </div>
            </header>

            <div className="relative overflow-hidden rounded-md bg-slate-100">
                {photos.length > 0 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={photos[photoIndex]}
                        alt={`${spot.title}, photo ${photoIndex + 1}`}
                        loading="lazy"
                        className="block aspect-square w-full object-contain"
                    />
                ) : (
                    <div className="grid aspect-square w-full place-items-center text-slate-400">
                        <ImageOff className="size-12" aria-hidden="true" />
                        <span className="sr-only">No photos</span>
                    </div>
                )}
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
                <span>{spot.address || "KMUTT"} · {spot.lat.toFixed(6)}, {spot.lng.toFixed(6)}</span>
            </p>
        </article>
    );
}

export default function Collection() {
    const [authStatus, setAuthStatus] = useState<
        "checking" | "guest" | "member" | "error"
    >("checking");
    const [sessionCheck, setSessionCheck] = useState(0);

    const [profile, setProfile] = useState<CollectionProfile | null>(null);
    const [spots, setSpots] = useState<SpotPinData[] | null>(null);
    const [collectionError, setCollectionError] = useState<string | null>(null);
    const [collectionCheck, setCollectionCheck] = useState(0);
    const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
    const gridScrollRef = useRef<HTMLDivElement>(null);
    const detailScrollRef = useRef<HTMLDivElement>(null);
    const gridPosition = useRef<{ spotId: string; scrollTop: number } | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function checkSession() {
            try {
                const response = await axiosInstance.get(
                    "/api/auth/me",
                    {
                        withCredentials: true,
                        signal: controller.signal,
                    },
                );

                if (controller.signal.aborted) return;

                const result = response.data;

                if (result.success !== true || !result.data?.userID) {
                    throw new Error("Invalid session response");
                }

                if (!controller.signal.aborted) {
                    setProfile({
                        username: result.data.username,
                        email: result.data.email,
                        avatar: result.data.profileImage ?? "",
                    });

                    setAuthStatus("member");
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setProfile(null);
                    setSpots(null);
                    setSelectedSpotId(null);
                    setCollectionError(null);

                    setAuthStatus(
                        isAxiosError(error) && error.response?.status === 401
                            ? "guest"
                            : "error",
                    );
                }
            }
        }

        void checkSession();

        return () => controller.abort();
    }, [sessionCheck]);

    useEffect(() => {
        const owner = profile;
        if (authStatus !== "member" || !owner) return;

        const controller = new AbortController();

        async function loadCollection(owner: CollectionProfile) {
            try {
                const response = await axiosInstance.get<{
                    success: boolean;
                    data: CollectionSpotResponse[];
                }>("/api/collection", {
                    withCredentials: true,
                    signal: controller.signal,
                });

                if (controller.signal.aborted) return;

                const result = response.data;
                if (result.success !== true || !Array.isArray(result.data)) {
                    throw new Error("Invalid collection response");
                }

                setSpots(result.data.map((spot) => toCollectionSpot(spot, owner)));
                setCollectionError(null);
            } catch (error) {
                if (controller.signal.aborted) return;

                setSpots(null);
                if (isAxiosError(error) && error.response?.status === 401) {
                    setProfile(null);
                    setSelectedSpotId(null);
                    setAuthStatus("guest");
                    return;
                }

                setCollectionError("Unable to load your spots. Please try again.");
            }
        }

        void loadCollection(owner);
        return () => controller.abort();
    }, [authStatus, profile, collectionCheck]);

useLayoutEffect(() => {
    if (authStatus !== "member") return;

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
}, [authStatus, selectedSpotId]);

function openSpot(spotId: string) {
    gridPosition.current = { spotId, scrollTop: gridScrollRef.current?.scrollTop ?? 0 };
    setSelectedSpotId(spotId);
}

const selectedSpot = authStatus === "member"
    ? spots?.find((spot) => spot.id === selectedSpotId)
    : undefined;

const profileSummary = {
    avatar: profile?.avatar ?? "",
    name: profile?.username ?? "FirstName LastName",
    email: profile?.email ?? "name@example.com",
    spottingCount: spots ? `${spots.length}` : "—",
};
return (
    <main className="relative isolate flex min-h-0 flex-1 overflow-hidden bg-[#E9ECE5] text-slate-900">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" inert>
            <MapComponent onRightClick={ignoreMapClick} />
        </div>
        <div className="pointer-events-none absolute inset-0 z-10 bg-[#17251A]/20 backdrop-blur-[3px]" aria-hidden="true" />

        <div
            ref={selectedSpot ? undefined : gridScrollRef}
            className={`relative z-20 min-h-0 min-w-0 flex-1 px-4 pt-4 pb-24 sm:p-8 ${selectedSpot ? "flex overflow-hidden" : authStatus !== "member" ? "flex flex-col overflow-y-auto" : "overflow-y-auto"}`}
        >
            {authStatus !== "member" ? (
                <section aria-labelledby="collection-title" className="mx-auto my-auto w-full max-w-[560px] shrink-0 rounded-lg bg-white px-4 py-5 shadow-md sm:px-10 lg:px-14">
                    <header className="relative grid grid-cols-[44px_minmax(0,1fr)_44px] items-center sm:grid-cols-[80px_minmax(0,1fr)_80px]">
                        <Link href="/map" aria-label="Back to map" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526E4E] sm:justify-start">
                            <ArrowLeft aria-hidden="true" className="size-5" />
                            <span className="hidden sm:inline">back</span>
                        </Link>
                        <h1 id="collection-title" className="text-center text-xl font-bold leading-tight tracking-tight">Collection</h1>
                        <div className="col-span-3 mx-auto mt-3 h-px w-52 max-w-full bg-[#DCDCE2]" />
                    </header>
                    {authStatus === "checking" && (
                        <p role="status" className="mt-6 text-center text-sm text-[#7A817D]">
                            Checking your account...
                        </p>
                    )}
                    {authStatus === "error" && (
                        <div className="mt-6 text-center">
                            <p role="alert" className="text-sm text-[#AE3C32]">
                                Cannot connect to the server.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setAuthStatus("checking");
                                    setSessionCheck((current) => current + 1);
                                }}
                                className="mt-3 min-h-11 cursor-pointer rounded-md border border-[#526E4E] px-5 text-sm text-[#526E4E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526E4E]"
                            >
                                Try again
                            </button>
                        </div>
                    )}
                    {authStatus === "guest" && <GuestProfileContent />}
                </section>
            ) : selectedSpot ? (
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
                            {spots?.map((spot) => <SpotPost key={spot.id} spot={spot} />)}
                        </div>
                    </div>
                </section>
            ) : (
                <section aria-labelledby="collection-title" className="mx-auto w-full max-w-[920px] rounded-lg bg-white p-6 shadow-md max-[360px]:px-3">
                    <header className="relative max-sm:grid max-sm:grid-cols-[44px_minmax(0,1fr)_44px] max-sm:items-center">
                        <Link href="/map" aria-label="Back to map" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526E4E] max-sm:justify-center sm:mb-5 lg:absolute lg:top-0 lg:left-0 lg:mb-0 lg:text-base">
                            <ArrowLeft aria-hidden="true" className="size-5" />
                            <span className="hidden sm:inline">back</span>
                        </Link>
                        <h1 id="collection-title" className="text-center text-[22px] font-bold tracking-tight max-sm:leading-tight sm:text-4xl lg:px-40 lg:text-[24px] lg:leading-tight">Collection</h1>
                        <div className="mx-auto mt-2 h-px w-32 bg-[#DCDCE2] max-sm:col-span-3 sm:mt-5 sm:w-52" />
                    </header>
                    <div className="mx-auto mt-6 flex w-full max-w-[900px] flex-col gap-6 sm:gap-8">
                        <div className="flex w-full items-center justify-center gap-4 rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] max-[360px]:gap-3 max-[360px]:px-3 sm:gap-18 sm:p-8">
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
                            <dl className="min-w-0 space-y-2 text-sm text-slate-900 sm:text-lg">
                                {/*name*/}
                                <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-baseline gap-x-4 sm:grid-cols-[5rem_minmax(0,1fr)]">
                                    <dt className="font-medium">Name</dt>
                                    <dd className="break-words">{profileSummary.name}</dd>
                                </div>
                                {/*email*/}
                                <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-baseline gap-x-4 sm:grid-cols-[5rem_minmax(0,1fr)]">
                                    <dt className="font-medium">Email</dt>
                                    <dd className="[overflow-wrap:anywhere]">{profileSummary.email}</dd>
                                </div>
                                {/*spot*/}
                                <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-baseline gap-x-4 sm:grid-cols-[5rem_minmax(0,1fr)]">
                                    <dt className="font-medium">Spotting</dt>
                                    <dd>{profileSummary.spottingCount}</dd>
                                </div>
                            </dl>
                        </div>
                        {collectionError ? (
                            <div className="text-center">
                                <p role="alert" className="text-sm text-[#AE3C32]">{collectionError}</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSpots(null);
                                        setCollectionError(null);
                                        setCollectionCheck((current) => current + 1);
                                    }}
                                    className="mt-3 min-h-11 cursor-pointer rounded-md border border-[#526E4E] px-5 text-sm text-[#526E4E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526E4E]"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : spots === null ? (
                            <p role="status" className="text-center text-sm text-slate-600">Loading your spots...</p>
                        ) : spots.length === 0 ? (
                            <p className="text-center text-sm text-slate-600">You haven’t added any spots yet.</p>
                        ) : (
                        <ul
                            aria-label="Spotting photos"
                            className={`grid w-full gap-px overflow-hidden rounded-sm ${spots.length < 3 ? "grid-cols-2" : "grid-cols-3"}`}>
                            {spots.map((spot) => (
                                <li key={spot.id} className="overflow-hidden bg-slate-100">
                                    <button
                                        id={`collection-spot-${spot.id}`}
                                        type="button"
                                        onClick={() => openSpot(spot.id)}
                                        className="relative block w-full cursor-pointer hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#526E4E]"
                                    >
                                        {spot.images.length > 0 ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={spot.images[0]}
                                                alt={spot.title}
                                                loading="lazy"
                                                className="block aspect-[4/3] w-full object-cover"
                                            />
                                        ) : (
                                            <span className="grid aspect-[4/3] w-full place-items-center text-slate-400">
                                                <ImageOff className="size-8" aria-hidden="true" />
                                                <span className="sr-only">{spot.title}: No photos</span>
                                            </span>
                                        )}
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
                        )}
                    </div>
                </section>
            )}
        </div>
    </main>
)
}
