"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import axios, { isAxiosError } from "axios";
import axiosInstance from "@/utils/axiosInstance";
import GuestProfileContent from "@/components/auth/GuestProfileContent";
import { useAuth } from "@/context/AuthContext";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, User, Mail, Lock, Pencil, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChangePassword from "./changPassword";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupButton,
} from "@/components/ui/input-group";

type Profile = { username: string; email: string; avatar: string };
type Field = "username" | "email";
type Feedback = { kind: "success" | "error" | "info"; text: string } | null;

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
    const { user } = useAuth();
    return <ProfileContent key={user?.userID ?? "guest"} />;
}

function ProfileContent() {
    const { user, isLoading, setUser, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [view, setView] = useState<"profile" | "password">("profile");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const authStatus = isLoading ? "checking" : user ? "member" : "guest";
    const isPasswordView = authStatus === "member" && view === "password";
    const savedProfile: Profile = user
        ? { username: user.username, email: user.email, avatar: user.profileImage ?? "" }
        : DEFAULT_PROFILE;
    const [draft, setDraft] = useState<Profile | null>(null);
    const [editing, setEditing] = useState<Field | null>(null);
    const [feedback, setFeedback] = useState<Feedback>(null);
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
    const [readingPhoto, setReadingPhoto] = useState(false);
    const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const photoRef = useRef<HTMLInputElement>(null);
    const profile = draft ?? savedProfile;
    const hasChanges = profile.username !== savedProfile.username || profile.email !== savedProfile.email || profile.avatar !== savedProfile.avatar;

    async function handleLogout() {
        if (isLoggingOut || isSaving || readingPhoto || isChangingPassword) return;

        setIsLoggingOut(true);
        setFeedback(null);

        try {
            await logout();

            setDraft(null);
            setPendingPhoto(null);
            setEditing(null);
            setErrors({});
        } catch {
            setFeedback({
                kind: "error",
                text: "Unable to log out. Please try again.",
            });
        } finally {
            setIsLoggingOut(false);
        }
    }

    function openPasswordForm() {
        if (isChangingPassword || isSaving || isLoggingOut || readingPhoto) return;
        setFeedback(null);
        setView("password");
        requestAnimationFrame(() => document.getElementById("profile-title")?.focus());
    }

    function closePasswordForm() {
        if (isChangingPassword) return;
        setView("profile");
        requestAnimationFrame(() => document.getElementById("edit-profile-password")?.focus());
    }

    function passwordSaved() {
        setView("profile");
        setFeedback({ kind: "success", text: "Password changed successfully." });
        requestAnimationFrame(() => document.getElementById("edit-profile-password")?.focus());
    }

    function updateField(field: Field, value: string) {
        if (isSaving || isLoggingOut) return;
        setDraft({ ...profile, [field]: value });
        setErrors((current) => ({ ...current, [field]: undefined }));
        setFeedback(null);
    }

    function editField(field: Field) {
        if (isSaving || isLoggingOut) return;
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
        if (!file || isSaving || isLoggingOut || readingPhoto) return;
        if (!IMAGE_TYPES.includes(file.type) || file.size === 0 || file.size > 2 * 1024 * 1024) {
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
            setPendingPhoto(file);
        } catch {
            setFeedback({ kind: "error", text: "This photo could not be opened. Please choose another image." });
        } finally {
            setReadingPhoto(false);
        }
    }

    async function saveChanges(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!user || readingPhoto || isSaving || isLoggingOut || isChangingPassword || !hasChanges) return;
        const ownerID = user.userID;
        const next = { ...profile, username: profile.username.trim(), email: profile.email.trim().toLowerCase() };
        const nextErrors: Partial<Record<Field, string>> = {};
        if (next.username.length < 1 || next.username.length > 50) nextErrors.username = "Enter a username with 1–50 characters.";
        if (next.email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) nextErrors.email = "Enter a valid email address under 101 characters.";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            const field = nextErrors.username ? "username" : "email";
            editField(field);
            return;
        }
        setIsSaving(true);
        setFeedback(null);
        try {
            let profileImage = savedProfile.avatar || null;

            if (pendingPhoto) {
                const presignResponse = await axiosInstance.post(
                    "/api/auth/profile-photo-url",
                    {
                        fileType: pendingPhoto.type,
                        fileSize: pendingPhoto.size,
                    },
                    { withCredentials: true },
                );

                const { uploadUrl, publicUrl } = presignResponse.data.data ?? {};
                if (presignResponse.data.success !== true || typeof uploadUrl !== "string" || typeof publicUrl !== "string" || publicUrl.length > 255) {
                    throw new Error("Invalid upload response");
                }


                await axios.put(uploadUrl, pendingPhoto, {
                    headers: { "Content-Type": pendingPhoto.type },
                    withCredentials: false,
                });

                profileImage = publicUrl;
            }

            const response = await axiosInstance.patch(
                "/api/auth/me",
                { username: next.username, email: next.email, profileImage },
                { withCredentials: true },
            );
            const result = response.data;
            if (result.success !== true || result.data?.userID !== ownerID) {
                throw new Error("Invalid profile response");
            }

            setUser((current) => current?.userID === ownerID ? result.data : current);
            setDraft(null);
            setPendingPhoto(null);
            setEditing(null);
            setFeedback({ kind: "success", text: "Profile changes saved." });
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401) {
                setDraft(null);
                setPendingPhoto(null);
                setUser((current) => current?.userID === ownerID ? null : current);
            } else {
                setFeedback({
                    kind: "error",
                    text: isAxiosError(error) && typeof error.response?.data?.message === "string"
                        ? error.response.data.message
                        : "Profile changes could not be saved. Please try again.",
                });
            }
        } finally {
            setIsSaving(false);
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
                        {isPasswordView ? (
                            <button type="button" onClick={closePasswordForm} disabled={isChangingPassword} aria-label="Back to Profile Settings" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526E4E] disabled:opacity-60 max-sm:justify-center sm:mb-5 lg:absolute lg:top-0 lg:left-0 lg:mb-0 lg:text-base">
                                <ArrowLeft aria-hidden="true" className="size-5" />
                                <span className="hidden sm:inline">back</span>
                            </button>
                        ) : (
                            <Link href="/map" aria-label="Back to map" className={`inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526E4E] ${authStatus === "guest" ? "justify-center sm:justify-start" : "max-sm:justify-center sm:mb-5 lg:absolute lg:top-0 lg:left-0 lg:mb-0 lg:text-base"}`}>
                                <ArrowLeft aria-hidden="true" className="size-5" />
                                <span className="hidden sm:inline">back</span>
                            </Link>
                        )}
                        <h1 id="profile-title" tabIndex={-1} className={`text-center font-bold tracking-tight leading-tight outline-none ${authStatus === "guest" ? "text-xl" : "text-[22px] sm:text-4xl lg:px-40 lg:text-[24px]"}`}>
                            {isPasswordView ? "Change Password" : authStatus === "member" ? "Profile Settings" : "Profile"}
                        </h1>
                        <div className={`mx-auto h-px bg-[#DCDCE2] ${authStatus === "guest" ? "col-span-3 mt-3 w-52 max-w-full" : "mt-2 w-32 max-sm:col-span-3 sm:mt-5 sm:w-52 lg:mt-3"}`} />
                    </header>
                    {authStatus === "checking" && (
                        <p role="status" className="mt-6 text-center text-sm text-[#7A817D]">
                            Checking your account...
                        </p>
                    )}
                    {authStatus === "guest" && <GuestProfileContent />}
                    {isPasswordView && (
                        <ChangePassword avatar={profile.avatar} onBack={closePasswordForm} onSuccess={passwordSaved} onBusyChange={setIsChangingPassword} />
                    )}
                    {authStatus === "member" && !isPasswordView && (
                        <form noValidate onSubmit={saveChanges} aria-busy={readingPhoto || isLoggingOut || isSaving} className="mx-auto mt-3 flex w-full max-w-[470px] flex-col items-center sm:mt-6 lg:mt-4">
                            <div className="relative">
                                <div className="flex size-[72px] items-center justify-center overflow-hidden rounded-full bg-[#E0ECDD] sm:size-40 lg:size-24">
                                    {profile.avatar ? (
                                        <img src={profile.avatar} alt="Profile photo preview" className="size-full object-cover" />
                                    ) : <User aria-hidden="true" className="size-10 text-[#526E4E] sm:size-24 lg:size-14" strokeWidth={1.25} />}
                                </div>
                                <input ref={photoRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Choose profile photo" tabIndex={-1} className="hidden" onChange={changePhoto} disabled={readingPhoto || isSaving || isLoggingOut} />
                                <button type="button" aria-label="Change profile photo" title="Choose a PNG, JPEG or WebP photo under 2 MB" disabled={readingPhoto || isSaving || isLoggingOut} onClick={() => photoRef.current?.click()} className="absolute -right-3 -bottom-1 flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526E4E] disabled:opacity-60 sm:right-0 sm:bottom-1">
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
                                        <InputGroupInput ref={usernameRef} id="profile-username" name="username" autoComplete="username" required maxLength={50} readOnly={editing !== "username" || isSaving || isLoggingOut} value={profile.username} onChange={(event) => updateField("username", event.target.value)} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? "username-error" : undefined} className="h-full text-base read-only:text-[#8A9BAF] md:text-base" />
                                        <InputGroupAddon align="inline-end"><InputGroupButton size="icon-sm" aria-label="Edit username" aria-pressed={editing === "username"} onClick={() => editField("username")} className="size-10 text-[#858B89]"><Pencil aria-hidden="true" className="size-5" /></InputGroupButton></InputGroupAddon>
                                    </InputGroup>
                                    {errors.username && <p id="username-error" role="alert" className="text-sm text-[#AE3C32]">{errors.username}</p>}
                                </div>
                                <div className="space-y-1 sm:space-y-2 lg:space-y-1">
                                    <label htmlFor="profile-email" className="block text-sm font-medium sm:text-lg lg:text-sm">Email</label>
                                    <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white sm:h-14 lg:h-11">
                                        <InputGroupAddon className="pl-3"><Mail aria-hidden="true" className="size-5 text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput ref={emailRef} id="profile-email" name="email" type="email" autoComplete="email" required maxLength={100} readOnly={editing !== "email" || isSaving || isLoggingOut} value={profile.email} onChange={(event) => updateField("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className="h-full text-base read-only:text-[#8A9BAF] md:text-base" />
                                        <InputGroupAddon align="inline-end"><InputGroupButton size="icon-sm" aria-label="Edit email" aria-pressed={editing === "email"} onClick={() => editField("email")} className="size-10 text-[#858B89]"><Pencil aria-hidden="true" className="size-5" /></InputGroupButton></InputGroupAddon>
                                    </InputGroup>
                                    {errors.email && <p id="email-error" role="alert" className="text-sm text-[#AE3C32]">{errors.email}</p>}
                                </div>
                                <div className="space-y-1 sm:space-y-2 lg:space-y-1">
                                    <label htmlFor="profile-password" className="block text-sm font-medium sm:text-lg lg:text-sm">Password</label>
                                    <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white sm:h-14 lg:h-11">
                                        <InputGroupAddon className="pl-3"><Lock aria-hidden="true" className="size-5 text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput id="profile-password" type="password" autoComplete="off" readOnly value="" placeholder="••••••••••••" className="h-full text-base placeholder:text-[#8A9BAF] md:text-base" />
                                        <InputGroupAddon align="inline-end"><InputGroupButton id="edit-profile-password" size="icon-sm" aria-label="Change password" onClick={openPasswordForm} disabled={isSaving || isLoggingOut || readingPhoto || isChangingPassword} className="size-10 text-[#858B89]"><Pencil aria-hidden="true" className="size-5" /></InputGroupButton></InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </div>

                            <div className="mt-4 flex w-full max-w-[344px] flex-col gap-2 sm:mt-7 sm:gap-6 lg:mt-4 lg:gap-2">
                                <Button type="submit" disabled={!hasChanges || readingPhoto || isLoggingOut || isSaving} className="h-11 w-full rounded-md bg-[#93A58F] text-sm text-[#171C18] hover:bg-[#81977C] disabled:opacity-65">{isSaving ? "Saving..." : "Save Changes"}</Button>
                                <Button type="button" onClick={handleLogout} disabled={isLoggingOut || readingPhoto || isSaving} className="h-11 w-full rounded-md bg-[#B5756C] text-sm text-[#171C18] hover:bg-[#A8655C]">{isLoggingOut ? "Logging out..." : "Logout"}</Button>
                            </div>
                            <p className="mt-3 text-center text-xs text-[#7A817D] sm:mt-4 lg:mt-3">Profile changes are saved to your account.</p>
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
