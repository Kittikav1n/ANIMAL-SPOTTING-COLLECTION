"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { isAxiosError } from "axios";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import registerMap from "./register-map.webp";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupButton,
} from "@/components/ui/input-group";

function MapPanel() {
    return (
        <div
            role="img"
            aria-label="Illustrated KMUTT spotting map with goose, cat, squirrel, and turtle icons"
            className="hidden bg-[#E9ECE5] bg-cover bg-center bg-no-repeat lg:block"
            style={{ backgroundImage: `url(${registerMap.src})` }}
        />
    );
}

export default function Register() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [avatar, setAvatar] = useState<string>();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [readingPhoto, setReadingPhoto] = useState(false);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    async function changePhoto(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || isSubmitting || readingPhoto) return;
        setIsSuccess(false);
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size === 0 || file.size > 2 * 1024 * 1024) {
            setMessage("Choose a PNG, JPEG or WebP image under 2 MB.");
            return;
        }

        setReadingPhoto(true);
        setMessage("");
        try {
            const preview = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Invalid image"));
                reader.onerror = () => reject(new Error("Unable to read image"));
                reader.readAsDataURL(file);
            });
            const image = new window.Image();
            image.src = preview;
            await image.decode();
            setAvatar(preview);
            setAvatarFile(file);
        } catch {
            setMessage("This photo could not be opened. Please choose another image.");
        } finally {
            setReadingPhoto(false);
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting || readingPhoto) return;

        setMessage("");
        setIsSuccess(false);

        const data = new FormData(event.currentTarget);
        const username = String(data.get("username") ?? "").trim();
        const email = String(data.get("email") ?? "").trim();
        const password = String(data.get("password") ?? "");
        const confirmPassword = String(data.get("confirmPassword") ?? "");

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        if ([...password].length < 10 || [...password].length > 128) {
            setMessage("Password must be 10–128 characters.");
            return;
        }

        setIsSubmitting(true);

        try {
            let payload: FormData | { username: string; email: string; password: string } = { username, email, password };
            if (avatarFile) {
                payload = new FormData();
                payload.append("username", username);
                payload.append("email", email);
                payload.append("password", password);
                payload.append("profileImage", avatarFile);
            }

            const response = await axiosInstance.post(
                "/api/auth/register",
                payload,
                // ให้เบราว์เซอร์กำหนด multipart boundary แทน Content-Type JSON ของ instance
                avatarFile ? { headers: { "Content-Type": undefined } } : undefined,
            );

            const result = response.data;

            if (result.success !== true) {
                setMessage(
                    typeof result.message === "string"
                        ? result.message
                        : "Registration failed. Please try again.",
                );
                return;
            }

            setIsSuccess(true);
            router.push("/login");
            setMessage("Registration successful. You can now sign in.");
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                setMessage(
                    typeof error.response.data?.message === "string"
                        ? error.response.data.message
                        : "Registration failed. Please try again.",
                );
            } else {
                setMessage("Cannot connect to the server. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-svh items-center justify-center bg-[#F5F5F7] px-0 py-0 text-[#17251A] sm:px-6 sm:py-8 lg:px-10 lg:py-12">
            <div className="grid w-full max-w-[1280px] overflow-hidden bg-white shadow-[0_20px_70px_rgba(23,37,26,.11)] sm:rounded-[24px] lg:min-h-[620px] lg:grid-cols-[53%_47%]">
                <MapPanel />

                <section aria-labelledby="register-title" className="relative flex min-h-svh items-center justify-center px-6 pt-14 pb-6 sm:min-h-0 sm:px-10 sm:pt-16 sm:pb-10 lg:pt-14 lg:pb-6">
                    <Link href="/profile" aria-label="Back to home" className="absolute top-2 left-4 inline-flex min-h-11 items-center gap-2 rounded-sm px-2 text-sm font-medium hover:bg-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526E4E] sm:top-3 sm:left-6">
                        <ArrowLeft aria-hidden="true" className="size-5" />
                        Back
                    </Link>
                    <div className="flex w-full max-w-[410px] flex-col items-center">
                        <header className="text-center">
                            <p className="text-[10px] font-medium tracking-[0.28em] text-[#526E4E] sm:text-[11px]">
                                ANIMAL SPOTTING COLLECTION
                            </p>
                            <h1 id="register-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Create Account
                            </h1>
                        </header>

                        <div className="relative my-5 lg:my-2">
                            <div className="flex size-[72px] items-center justify-center overflow-hidden rounded-full bg-[#E0ECDD] lg:size-16">
                                {avatar ? (
                                    <img src={avatar} alt="Selected profile photo" className="size-full object-cover" />
                                ) : (
                                    <User aria-hidden="true" className="size-11 text-[#789570]" strokeWidth={1.25} />
                                )}
                            </div>
                            <label className="absolute right-0 bottom-1 flex size-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#526E4E] text-white focus-within:ring-2 focus-within:ring-[#526E4E] focus-within:ring-offset-2">
                                <Pencil aria-hidden="true" className="size-3" />
                                <span className="sr-only">Choose profile photo</span>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="sr-only"
                                    onChange={changePhoto}
                                    disabled={isSubmitting || readingPhoto}
                                />
                            </label>
                        </div>

                        <form className="w-full" onSubmit={handleSubmit} onChange={() => { setMessage(""); setIsSuccess(false); }} aria-busy={isSubmitting || readingPhoto}>
                            <fieldset disabled={isSubmitting || readingPhoto} className="min-w-0 border-0 p-0">
                            <div className="flex flex-col gap-4 lg:gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="username" className="text-xs font-medium">Username</label>
                                    <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white lg:h-10">
                                        <InputGroupAddon><User className="text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput id="username" name="username" placeholder="FirstName LastName" autoComplete="username" required className="text-base placeholder:text-[#A7B4C5] lg:text-xs" />
                                    </InputGroup>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="email" className="text-xs font-medium">Email</label>
                                    <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white lg:h-10">
                                        <InputGroupAddon><Mail className="text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput id="email" name="email" type="email" placeholder="name@example.com" autoComplete="email" required className="text-base placeholder:text-[#A7B4C5] lg:text-xs" />
                                    </InputGroup>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="password" className="text-xs font-medium">Password</label>
                                    <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white lg:h-10">
                                        <InputGroupAddon><Lock className="text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••••••" autoComplete="new-password" required className="text-base placeholder:text-[#A7B4C5] lg:text-xs" />
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupButton aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>
                                                {showPassword ? <EyeOff /> : <Eye />}
                                            </InputGroupButton>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="confirm-password" className="text-xs font-medium">Confirm Password</label>
                                    <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white lg:h-10">
                                        <InputGroupAddon><Lock className="text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput id="confirm-password" name="confirmPassword" type={showConfirmation ? "text" : "password"} placeholder="••••••••••••" autoComplete="new-password" required className="text-base placeholder:text-[#A7B4C5] lg:text-xs" />
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupButton aria-label={showConfirmation ? "Hide confirmed password" : "Show confirmed password"} aria-pressed={showConfirmation} onClick={() => setShowConfirmation((value) => !value)}>
                                                {showConfirmation ? <EyeOff /> : <Eye />}
                                            </InputGroupButton>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </div>

                            <Button type="submit" disabled={isSubmitting || readingPhoto || isSuccess} className="mt-6 flex h-11 w-full rounded-md bg-[#526E4E] text-sm text-white hover:bg-[#42573F] lg:mt-4 lg:h-10">
                                {readingPhoto ? "Reading photo..." : isSubmitting ? "Creating account..." : "Create Account"}
                            </Button>
                            </fieldset>
                            <p role="status" className={`mt-3 text-center text-xs lg:mt-1 ${isSuccess ? "text-[#526E4E]" : "text-[#AE3C32]"}`}>
                                {message}
                            </p>
                        </form>

                        <p className="mt-6 text-center text-xs text-[#7D8BA1] lg:mt-4">
                            Have an account?{" "}
                            <Link href="/login" className="font-semibold text-[#B83D2E] hover:underline">Sign In</Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}