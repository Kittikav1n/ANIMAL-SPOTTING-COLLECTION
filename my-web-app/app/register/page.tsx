"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import registerMap from "./register-map.webp";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
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
            className="hidden bg-[#E9ECE5] bg-cover bg-center bg-no-repeat lg:block lg:min-h-[760px]"
            style={{ backgroundImage: `url(${registerMap.src})` }}
        />
    );
}

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [avatar, setAvatar] = useState<string>();
    const [message, setMessage] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if (data.get("password") !== data.get("confirmPassword")) {
            setMessage("Passwords do not match.");
            return;
        }
        setMessage("Account registration is not available yet. Please try again later.");
    }

    return (
        <main className="flex min-h-svh items-center justify-center bg-[#F5F5F7] px-0 py-0 text-[#17251A] sm:px-6 sm:py-8 lg:px-10 lg:py-12">
            <div className="grid w-full max-w-[1280px] overflow-hidden bg-white shadow-[0_20px_70px_rgba(23,37,26,.11)] sm:rounded-[24px] lg:h-[820px] lg:grid-cols-[53%_47%]">
                <MapPanel />

            <section aria-labelledby="register-title" className="relative flex min-h-svh items-center justify-center px-6 pt-14 pb-6 sm:min-h-0 sm:px-10 sm:pt-16 sm:pb-10 lg:min-h-[780px] lg:py-14">
                <Link href="/" aria-label="Back to home" className="absolute top-2 left-4 inline-flex min-h-11 items-center gap-2 rounded-sm px-2 text-sm font-medium hover:bg-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526E4E] sm:top-3 sm:left-6">
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

                    <div className="relative mt-5 mb-5 lg:mt-8 lg:mb-8">
                        <div className="flex size-[72px] items-center justify-center overflow-hidden rounded-full bg-[#E0ECDD] lg:size-[92px]">
                            {avatar ? (
                                <img src={avatar} alt="Selected profile photo" className="size-full object-cover" />
                            ) : (
                                <User aria-hidden="true" className="size-11 text-[#789570] lg:size-14" strokeWidth={1.25} />
                            )}
                        </div>
                        <label className="absolute right-0 bottom-1 flex size-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#526E4E] text-white focus-within:ring-2 focus-within:ring-[#526E4E] focus-within:ring-offset-2">
                            <Pencil aria-hidden="true" className="size-3" />
                            <span className="sr-only">Choose profile photo</span>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="sr-only"
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;
                                    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
                                        setMessage("Choose a PNG, JPEG or WebP image under 5 MB.");
                                        return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        setAvatar(reader.result as string);
                                        setMessage("");
                                    };
                                    reader.readAsDataURL(file);
                                }}
                            />
                        </label>
                    </div>

                    <form className="w-full" onSubmit={handleSubmit} onChange={() => setMessage("")}>
                        <div className="flex flex-col gap-4 lg:gap-5">
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

                        <Button type="submit" className="mt-6 flex h-11 w-full rounded-md bg-[#526E4E] text-sm text-white hover:bg-[#42573F] lg:mt-8 lg:h-10">
                            Create Account
                        </Button>
                        <p role="status" className="mt-3 text-center text-xs text-[#AE3C32]">{message}</p>
                    </form>

                    <p className="mt-6 text-center text-xs text-[#7D8BA1] lg:mt-8">
                        Have an account?{" "}
                        <Link href="/login" className="font-semibold text-[#B83D2E] hover:underline">Sign In</Link>
                    </p>
                </div>
            </section>
            </div>
        </main>
    );
}
