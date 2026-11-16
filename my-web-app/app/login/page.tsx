"use client";

import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import registerMap from "@/app/register/register-map.webp";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupButton,
} from "@/components/ui/input-group";

export default function Login() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const { setUser } = useAuth();


    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) return;
        setMessage("");

        const data = new FormData(event.currentTarget);
        const identifier = String(data.get("username") ?? "").trim();
        const password = String(data.get("password") ?? "");
        
        setIsSubmitting(true);

        try {
            const response = await axiosInstance.post(
                "/api/auth/login",
                { identifier, password },
                { withCredentials: true },
            );
            const result = response.data;
            if (result.success !== true) {
                setMessage(
                    typeof result.message === "string"
                        ? result.message
                        : "Unable to log in. Please try again.",
                );
                return;
            }
            setUser(result.data);
            router.replace("/map");
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                setMessage(
                    typeof error.response.data?.message === "string"
                        ? error.response.data.message
                        : "Unable to log in. Please try again.",
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
                <div
                    role="img"
                    aria-label="Illustrated KMUTT spotting map with goose, cat, squirrel, and turtle icons"
                    className="hidden bg-[#E9ECE5] bg-cover bg-center bg-no-repeat lg:block"
                    style={{ backgroundImage: `url(${registerMap.src})` }}
                />

                <section aria-labelledby="login-title" className="relative flex min-h-svh items-center justify-center px-6 pt-14 pb-6 sm:min-h-0 sm:px-10 sm:pt-16 sm:pb-10 lg:pt-14 lg:pb-6">
                    <Link href="/profile" aria-label="Back to home" className="absolute top-2 left-4 inline-flex min-h-11 items-center gap-2 rounded-sm px-2 text-sm font-medium hover:bg-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526E4E] sm:top-3 sm:left-6">
                        <ArrowLeft aria-hidden="true" className="size-5" />
                        Back
                    </Link>
                    <div className="w-full max-w-[410px]">
                        <header className="mb-8 text-center lg:mb-12">
                            <h1 id="login-title" className="text-[32px] font-semibold leading-[1.05] tracking-tight text-[#17251A] sm:text-[38px]">
                                ANIMAL<br />SPOTTING<br />COLLECTION
                            </h1>
                            <p className="mt-3 text-sm text-[#6F6F7C]">Welcome back to your collection.</p>
                        </header>

                        <form onSubmit={handleSubmit} onChange={() => setMessage("")}>
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="username" className="text-xs font-medium">Username or Email</label>
                                    <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white lg:h-10">
                                        <InputGroupAddon><Mail className="text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput
                                            id="username"
                                            name="username"
                                            type="text"
                                            placeholder="Username or email"
                                            autoComplete="username"
                                            required
                                            className="text-base placeholder:text-[#A7B4C5] lg:text-xs"
                                        />
                                    </InputGroup>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="password" className="text-xs font-medium">Password</label>
                                    <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white lg:h-10">
                                        <InputGroupAddon><Lock className="text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            required
                                            className="text-base placeholder:text-[#A7B4C5] lg:text-xs"
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupButton
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                aria-pressed={showPassword}
                                                onClick={() => setShowPassword((value) => !value)}
                                            >
                                                {showPassword ? <EyeOff /> : <Eye />}
                                            </InputGroupButton>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="mt-7 h-11 w-full rounded-md bg-[#526E4E] text-sm text-white hover:bg-[#42573F] lg:mt-9 lg:h-10">
                                {isSubmitting ? "Signing in..." : "Sign In"}
                            </Button>
                            <p role="status" className="mt-3 text-center text-xs text-[#AE3C32]">{message}</p>
                        </form>

                        <p className="mt-7 text-center text-xs text-[#7D8BA1] lg:mt-9">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="font-semibold text-[#B83D2E] hover:underline">Create Account</Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}