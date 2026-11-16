"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { isAxiosError } from "axios";
import axiosInstance from "@/utils/axiosInstance";
import GuestProfileContent from "@/components/auth/GuestProfileContent";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
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


const MapComponent = dynamic(
    () => import("@/components/MapComponent"),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full bg-[#E9ECE5]" />),
    }
);

export default function ProfilePage() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [authStatus, setAuthStatus] = useState<
        "checking" | "guest" | "member" | "error"
    >("checking");

    const [sessionCheck, setSessionCheck] = useState(0);
    const [savedProfile, setSavedProfile] =
    useState<Profile>(DEFAULT_PROFILE);

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
                    setAuthStatus("member");
                }
            } catch (error) {
                if (!controller.signal.aborted) {
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

    async function handleLogout() {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        setFeedback(null);

        try {
            const response = await axiosInstance.post(
                "/api/auth/logout",
                undefined,
                { withCredentials: true },
            );

            const result = response.data;

            if (result.success !== true) {
                throw new Error("Invalid logout response");
            }

            setDraft(null);
            setEditing(null);
            setErrors({});
            setAuthStatus("guest");
        } catch {
            setFeedback({
                kind: "error",
                text: "Unable to log out. Please try again.",
            });
        } finally {
            setIsLoggingOut(false);
        }
    }

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
                <div className={`mx-auto my-auto w-full shrink-0 rounded-lg bg-white shadow-xl ${authStatus === "guest" ? "max-w-[560px] px-4 py-5 sm:px-10 lg:px-14" : "max-w-[720px] px-4 py-4 sm:px-10 sm:py-7 lg:flex lg:min-h-[620px] lg:flex-col lg:justify-start lg:px-14 lg:py-5"}`}>
                    <header className={`relative ${authStatus === "guest" ? "grid grid-cols-[44px_minmax(0,1fr)_44px] items-center sm:grid-cols-[80px_minmax(0,1fr)_80px]" : "max-sm:grid max-sm:grid-cols-[44px_minmax(0,1fr)_44px] max-sm:items-center"}`}>
                        <Link href="/map" aria-label="Back to map" className={`inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526E4E] ${authStatus === "guest" ? "justify-center sm:justify-start" : "max-sm:justify-center sm:mb-5 lg:absolute lg:top-0 lg:left-0 lg:mb-0 lg:text-base"}`}>
                            <ArrowLeft aria-hidden="true" className="size-5" />
                            <span className="hidden sm:inline">back</span>
                        </Link>
                        <h1 id="profile-title" className={`text-center font-bold tracking-tight leading-tight ${authStatus === "guest" ? "text-xl" : "text-[22px] sm:text-4xl lg:px-40 lg:text-[24px]"}`}>
                            {authStatus === "member" ? "Profile Settings" : "Profile"}
                        </h1>
                        <div className={`mx-auto h-px bg-[#DCDCE2] ${authStatus === "guest" ? "col-span-3 mt-3 w-52 max-w-full" : "mt-2 w-32 max-sm:col-span-3 sm:mt-5 sm:w-52 lg:mt-3"}`} />
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
                    {authStatus === "member" && (
                        <form noValidate onSubmit={saveChanges} aria-busy={readingPhoto || isLoggingOut} className="mx-auto mt-3 flex w-full max-w-[470px] flex-col items-center sm:mt-6 lg:mt-4">
                            <div className="relative">
                                <div className="flex size-[72px] items-center justify-center overflow-hidden rounded-full bg-[#E0ECDD] sm:size-40 lg:size-24">
                                    {profile.avatar ? (
                                        <img src={profile.avatar} alt="Profile photo preview" className="size-full object-cover" />
                                    ) : <User aria-hidden="true" className="size-10 text-[#526E4E] sm:size-24 lg:size-14" strokeWidth={1.25} />}
                                </div>
                                <input ref={photoRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Choose profile photo" tabIndex={-1} className="hidden" onChange={changePhoto} disabled={readingPhoto} />
                                <button type="button" aria-label="Change profile photo" title="Choose a PNG, JPEG or WebP photo under 2 MB" disabled={readingPhoto} onClick={() => photoRef.current?.click()} className="absolute -right-3 -bottom-1 flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526E4E] disabled:opacity-60 sm:right-0 sm:bottom-1">
                                    <span className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#425C40] text-white transition-colors hover:bg-[#31472F] sm:size-11">
                                        {readingPhoto ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none sm:size-5" /> : <Pencil aria-hidden="true" className="size-4 sm:size-5" strokeWidth={1.5} />}
                                    </span>
                                </button>
                            </div>

                            <div className="mt-4 w-full space-y-3 sm:mt-8 sm:space-y-6 lg:mt-4 lg:space-y-3">
                                <div className="space-y-1 sm:space-y-2 lg:space-y-1">
                                    <label htmlFor="profile-username" className="block text-sm font-medium sm:text-lg lg:text-sm">Username</label>
                                    <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white sm:h-14 lg:h-11">
                                        <InputGroupAddon className="pl-3"><User aria-hidden="true" className="size-5 text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput ref={usernameRef} id="profile-username" name="username" autoComplete="username" required maxLength={80} readOnly={editing !== "username"} value={profile.username} onChange={(event) => updateField("username", event.target.value)} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? "username-error" : undefined} className="h-full text-base read-only:text-[#8A9BAF] md:text-base" />
                                        <InputGroupAddon align="inline-end"><InputGroupButton size="icon-sm" aria-label="Edit username" aria-pressed={editing === "username"} onClick={() => editField("username")} className="size-10 text-[#858B89]"><Pencil aria-hidden="true" className="size-5" /></InputGroupButton></InputGroupAddon>
                                    </InputGroup>
                                    {errors.username && <p id="username-error" role="alert" className="text-sm text-[#AE3C32]">{errors.username}</p>}
                                </div>
                                <div className="space-y-1 sm:space-y-2 lg:space-y-1">
                                    <label htmlFor="profile-email" className="block text-sm font-medium sm:text-lg lg:text-sm">Email</label>
                                    <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white sm:h-14 lg:h-11">
                                        <InputGroupAddon className="pl-3"><Mail aria-hidden="true" className="size-5 text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput ref={emailRef} id="profile-email" name="email" type="email" autoComplete="email" required maxLength={254} readOnly={editing !== "email"} value={profile.email} onChange={(event) => updateField("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className="h-full text-base read-only:text-[#8A9BAF] md:text-base" />
                                        <InputGroupAddon align="inline-end"><InputGroupButton size="icon-sm" aria-label="Edit email" aria-pressed={editing === "email"} onClick={() => editField("email")} className="size-10 text-[#858B89]"><Pencil aria-hidden="true" className="size-5" /></InputGroupButton></InputGroupAddon>
                                    </InputGroup>
                                    {errors.email && <p id="email-error" role="alert" className="text-sm text-[#AE3C32]">{errors.email}</p>}
                                </div>
                                <div className="space-y-1 sm:space-y-2 lg:space-y-1">
                                    <label htmlFor="profile-password" className="block text-sm font-medium sm:text-lg lg:text-sm">Password</label>
                                    <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white sm:h-14 lg:h-11">
                                        <InputGroupAddon className="pl-3"><Lock aria-hidden="true" className="size-5 text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput id="profile-password" type="password" autoComplete="off" readOnly value="" placeholder="••••••••••••" className="h-full text-base placeholder:text-[#8A9BAF] md:text-base" />
                                        <InputGroupAddon align="inline-end"><InputGroupButton size="icon-sm" aria-label="Change password" onClick={() => setFeedback({ kind: "info", text: "Password changes are not available until account services are connected." })} className="size-10 text-[#858B89]"><Pencil aria-hidden="true" className="size-5" /></InputGroupButton></InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </div>

                            <div className="mt-4 flex w-full max-w-[344px] flex-col gap-2 sm:mt-7 sm:gap-6 lg:mt-4 lg:gap-2">
                                <Button type="submit" disabled={!hasChanges || readingPhoto || isLoggingOut} className="h-11 w-full rounded-md bg-[#93A58F] text-sm text-[#171C18] hover:bg-[#81977C] disabled:opacity-65">Save Changes</Button>
                                <Button type="button" onClick={handleLogout} disabled={isLoggingOut || readingPhoto} className="h-11 w-full rounded-md bg-[#B5756C] text-sm text-[#171C18] hover:bg-[#A8655C]">{isLoggingOut ? "Logging out..." : "Logout"}</Button>
                            </div>
                            <p className="mt-3 text-center text-xs text-[#7A817D] sm:mt-4 lg:mt-3">Profile changes are saved on this device.</p>
                            <div className="w-full text-center text-sm sm:mt-2 sm:min-h-5" role={feedback?.kind === "error" ? "alert" : "status"} aria-live="polite">
                                {feedback && <p className={`max-sm:mt-2 ${feedback.kind === "error" ? "text-[#AE3C32]" : feedback.kind === "success" ? "text-[#425C40]" : "text-[#6F6F7C]"}`}>{feedback.text}</p>}
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
}
