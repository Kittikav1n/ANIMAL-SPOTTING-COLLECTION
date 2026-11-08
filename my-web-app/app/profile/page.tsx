"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, User, Mail, Lock, Pencil, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupButton,
} from "@/components/ui/input-group";

type Profile = { username: string; email: string; avatar: string };
type Field = "username" | "email";
type Feedback = { kind: "success" | "error" | "info"; text: string } | null;

const STORAGE_KEY = "animal-spotting:profile-preview:v1";
const STORAGE_EVENT = "animal-spotting:profile-updated";
const DEFAULT_PROFILE: Profile = { username: "FirstName LastName", email: "name@example.com", avatar: "" };
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

function subscribeToProfile(callback: () => void) {
    window.addEventListener("storage", callback);
    window.addEventListener(STORAGE_EVENT, callback);
    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(STORAGE_EVENT, callback);
    };
}

function getProfileSnapshot() {
    try { return window.localStorage.getItem(STORAGE_KEY) ?? ""; }
    catch { return ""; }
}

function parseProfile(snapshot: string): Profile {
    try {
        const value: unknown = JSON.parse(snapshot);
        if (!value || typeof value !== "object") return DEFAULT_PROFILE;
        const profile = value as Partial<Profile>;
        if (typeof profile.username !== "string" || typeof profile.email !== "string") return DEFAULT_PROFILE;
        const avatar = typeof profile.avatar === "string" && /^data:image\/(png|jpeg|webp);base64,/.test(profile.avatar)
            ? profile.avatar : "";
        return { username: profile.username, email: profile.email, avatar };
    } catch { return DEFAULT_PROFILE; }
}

const MapComponent = dynamic(
    () => import("@/components/MapComponent"),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full bg-[#E9ECE5]" />),
    }
);


export default function ProfilePage() {
    const router = useRouter();
    const snapshot = useSyncExternalStore(subscribeToProfile, getProfileSnapshot, () => "");
    const savedProfile = useMemo(() => parseProfile(snapshot), [snapshot]);
    const [draft, setDraft] = useState<Profile | null>(null);
    const [editing, setEditing] = useState<Field | null>(null);
    const [feedback, setFeedback] = useState<Feedback>(null);
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
    const [readingPhoto, setReadingPhoto] = useState(false);
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const photoRef = useRef<HTMLInputElement>(null);
    const profile = draft ?? savedProfile;
    const hasChanges = profile.username !== savedProfile.username || profile.email !== savedProfile.email || profile.avatar !== savedProfile.avatar;

    function updateField(field: Field, value: string) {
        setDraft({ ...profile, [field]: value });
        setErrors((current) => ({ ...current, [field]: undefined }));
        setFeedback(null);
    }

    function editField(field: Field) {
        setEditing(field);
        setFeedback(null);
        requestAnimationFrame(() => {
            const input = field === "username" ? usernameRef.current : emailRef.current;
            input?.focus();
            input?.select();
        });
    }

    async function changePhoto(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!IMAGE_TYPES.includes(file.type) || file.size > 2 * 1024 * 1024) {
            setFeedback({ kind: "error", text: "Choose a PNG, JPEG or WebP photo under 2 MB." });
            return;
        }
        setReadingPhoto(true);
        setFeedback(null);
        try {
            const avatar = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Invalid image"));
                reader.onerror = () => reject(new Error("Unable to read image"));
                reader.readAsDataURL(file);
            });
            const image = new window.Image();
            image.src = avatar;
            await image.decode();
            setDraft((current) => ({ ...(current ?? savedProfile), avatar }));
        } catch {
            setFeedback({ kind: "error", text: "This photo could not be opened. Please choose another image." });
        } finally {
            setReadingPhoto(false);
        }
    }

    function saveChanges(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (readingPhoto) return;
        const next = { ...profile, username: profile.username.trim(), email: profile.email.trim() };
        const nextErrors: Partial<Record<Field, string>> = {};
        if (next.username.length < 2) nextErrors.username = "Enter a username with at least 2 characters.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) nextErrors.email = "Enter a valid email address.";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            const field = nextErrors.username ? "username" : "email";
            editField(field);
            return;
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            window.dispatchEvent(new Event(STORAGE_EVENT));
            setDraft(null);
            setEditing(null);
            setFeedback({ kind: "success", text: "Profile changes saved on this device." });
        } catch {
            setFeedback({ kind: "error", text: "Changes could not be saved on this device. Try a smaller photo or check browser storage settings." });
        }
    }

    return (
        <main className="relative isolate flex min-h-0 flex-1 overflow-hidden text-[#0F172A]">
            <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" inert>
                <MapComponent onRightClick={() => undefined} />
            </div>
            <div className="absolute inset-0 z-10 bg-[#17251A]/20 backdrop-blur-[3px]" aria-hidden="true" />
            <section aria-labelledby="profile-title" className="relative z-20 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-3 pb-24 sm:px-6 sm:py-8 lg:px-10">
                <div className="mx-auto my-auto w-full max-w-[1040px] shrink-0 rounded-lg bg-white px-4 py-4 shadow-xl sm:px-10 sm:py-7 lg:px-14 lg:py-8">
                    <header className="relative max-sm:grid max-sm:grid-cols-[44px_minmax(0,1fr)_44px] max-sm:items-center">
                        <Link href="/map" aria-label="Back to map" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526E4E] max-sm:justify-center sm:mb-5 lg:absolute lg:top-0 lg:left-0 lg:mb-0 lg:text-base">
                            <ArrowLeft aria-hidden="true" className="size-5" />
                            <span className="hidden sm:inline">back</span>
                        </Link>
                        <h1 id="profile-title" className="text-center text-[22px] font-bold tracking-tight max-sm:leading-tight sm:text-4xl lg:px-40 lg:text-[32px] lg:leading-tight">Profile Settings</h1>
                        <div className="mx-auto mt-2 h-px w-32 bg-[#DCDCE2] max-sm:col-span-3 sm:mt-5 sm:w-64" />
                    </header>
                    <form noValidate onSubmit={saveChanges} aria-busy={readingPhoto} className="mx-auto mt-3 flex w-full max-w-[470px] flex-col items-center sm:mt-6">
                        <div className="relative">
                            <div className="flex size-[72px] items-center justify-center overflow-hidden rounded-full bg-[#E0ECDD] sm:size-40 xl:size-48">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="Profile photo preview" className="size-full object-cover" />
                                ) : <User aria-hidden="true" className="size-10 text-[#526E4E] sm:size-24 xl:size-28" strokeWidth={1.25} />}
                            </div>
                            <input ref={photoRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Choose profile photo" tabIndex={-1} className="hidden" onChange={changePhoto} disabled={readingPhoto} />
                            <button type="button" aria-label="Change profile photo" title="Choose a PNG, JPEG or WebP photo under 2 MB" disabled={readingPhoto} onClick={() => photoRef.current?.click()} className="absolute -right-3 -bottom-1 flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526E4E] disabled:opacity-60 sm:right-0 sm:bottom-1">
                                <span className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#425C40] text-white transition-colors hover:bg-[#31472F] sm:size-11">
                                    {readingPhoto ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none sm:size-5" /> : <Pencil aria-hidden="true" className="size-4 sm:size-5" strokeWidth={1.5} />}
                                </span>
                            </button>
                        </div>

                        <div className="mt-4 w-full space-y-3 sm:mt-8 sm:space-y-6">
                            <div className="space-y-1 sm:space-y-2">
                                <label htmlFor="profile-username" className="block text-sm font-medium sm:text-lg">Username</label>
                                <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white sm:h-14">
                                    <InputGroupAddon className="pl-3"><User aria-hidden="true" className="size-5 text-[#92999E]" /></InputGroupAddon>
                                    <InputGroupInput ref={usernameRef} id="profile-username" name="username" autoComplete="username" required maxLength={80} readOnly={editing !== "username"} value={profile.username} onChange={(event) => updateField("username", event.target.value)} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? "username-error" : undefined} className="h-full text-base read-only:text-[#8A9BAF] md:text-base" />
                                    <InputGroupAddon align="inline-end"><InputGroupButton size="icon-sm" aria-label="Edit username" aria-pressed={editing === "username"} onClick={() => editField("username")} className="size-10 text-[#858B89]"><Pencil aria-hidden="true" className="size-5" /></InputGroupButton></InputGroupAddon>
                                </InputGroup>
                                {errors.username && <p id="username-error" role="alert" className="text-sm text-[#AE3C32]">{errors.username}</p>}
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                                <label htmlFor="profile-email" className="block text-sm font-medium sm:text-lg">Email</label>
                                <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white sm:h-14">
                                    <InputGroupAddon className="pl-3"><Mail aria-hidden="true" className="size-5 text-[#92999E]" /></InputGroupAddon>
                                    <InputGroupInput ref={emailRef} id="profile-email" name="email" type="email" autoComplete="email" required maxLength={254} readOnly={editing !== "email"} value={profile.email} onChange={(event) => updateField("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className="h-full text-base read-only:text-[#8A9BAF] md:text-base" />
                                    <InputGroupAddon align="inline-end"><InputGroupButton size="icon-sm" aria-label="Edit email" aria-pressed={editing === "email"} onClick={() => editField("email")} className="size-10 text-[#858B89]"><Pencil aria-hidden="true" className="size-5" /></InputGroupButton></InputGroupAddon>
                                </InputGroup>
                                {errors.email && <p id="email-error" role="alert" className="text-sm text-[#AE3C32]">{errors.email}</p>}
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                                <label htmlFor="profile-password" className="block text-sm font-medium sm:text-lg">Password</label>
                                <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white sm:h-14">
                                    <InputGroupAddon className="pl-3"><Lock aria-hidden="true" className="size-5 text-[#92999E]" /></InputGroupAddon>
                                    <InputGroupInput id="profile-password" type="password" autoComplete="off" readOnly value="" placeholder="••••••••••••" className="h-full text-base placeholder:text-[#8A9BAF] md:text-base" />
                                    <InputGroupAddon align="inline-end"><InputGroupButton size="icon-sm" aria-label="Change password" onClick={() => setFeedback({ kind: "info", text: "Password changes are not available until account services are connected." })} className="size-10 text-[#858B89]"><Pencil aria-hidden="true" className="size-5" /></InputGroupButton></InputGroupAddon>
                                </InputGroup>
                            </div>
                        </div>

                        <div className="mt-4 flex w-full max-w-[344px] flex-col gap-2 sm:mt-7 sm:gap-6">
                            <Button type="submit" disabled={!hasChanges || readingPhoto} className="h-11 w-full rounded-md bg-[#B5756C] text-sm text-[#171C18] hover:bg-[#A8655C] disabled:opacity-65">Save Changes</Button>
                            <Button type="button" onClick={() => router.replace("/login")} className="h-11 w-full rounded-md bg-[#93A58F] text-sm text-[#171C18] hover:bg-[#81977C]">Logout</Button>
                        </div>
                        <p className="mt-3 text-center text-xs text-[#7A817D] sm:mt-4">Profile changes are saved on this device.</p>
                        <div className="w-full text-center text-sm sm:mt-2 sm:min-h-5" role={feedback?.kind === "error" ? "alert" : "status"} aria-live="polite">
                            {feedback && <p className={`max-sm:mt-2 ${feedback.kind === "error" ? "text-[#AE3C32]" : feedback.kind === "success" ? "text-[#425C40]" : "text-[#6F6F7C]"}`}>{feedback.text}</p>}
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
