"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { SpotPinData } from "@/components/MapComponent";
import { Images, User } from "lucide-react";


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

export default function Collection() {
    const saveProfile = useSyncExternalStore(subscribeToProfile, readProfile, () => "");
    let profile: { username?: string; email?: string; avatar?: string } | null = null;
    try {
        profile = JSON.parse(saveProfile || "null");
    } catch {

    }
    const [sampleSpots, setSampleSpots] = useState<SpotPinData[] | null>(null);
    useEffect(() => {
        let active = true;

        import("@/components/MapComponent")
            .then(({ SAMPLE_SPOTS }) => {
                if (active) setSampleSpots(SAMPLE_SPOTS);
            })
            .catch((error) => console.error("Could not load sample spots", error));

        return () => { active = false; };
    }, []);



    const profileSummary = {
        avatar: profile?.avatar ?? "",
        name: profile?.username ?? "FirstName LastName",
        email: profile?.email ?? "name@example.com",
        spottingCount: sampleSpots ? `${sampleSpots.length}` : "—",
    };
    return (
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-24 sm:p-8">
            <section className="mx-auto w-full max-w-[1040px] rounded-lg bg-white p-6 shadow-md max-[360px]:px-3">
                <h1 id="collection-title" className="text-center text-[22px] font-bold tracking-tight max-sm:leading-tight sm:text-4xl lg:px-40 lg:text-[32px] lg:leading-tight">Collection</h1>
                <div className="mx-auto mt-2 h-px w-32 bg-[#DCDCE2] max-sm:col-span-3 sm:mt-5 sm:w-64" />
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
                            <li key={spot.id} className="relative overflow-hidden bg-slate-100">
                                <img
                                    src={spot.images[0] ?? spot.photoUrl}
                                    alt={spot.title}
                                    loading="lazy"
                                    className="block aspect-[4/3] w-full object-cover"
                                />
                                {spot.images.length > 1 && (
                                    <>
                                        <span aria-hidden="true" className="absolute top-1 right-1 rounded  p-1 text-white sm:top-2 sm:right-2">
                                            <Images className="size-3 sm:size-4" />
                                        </span>
                                        <span className="sr-only">Multiple photos</span>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </main>
    )
}
