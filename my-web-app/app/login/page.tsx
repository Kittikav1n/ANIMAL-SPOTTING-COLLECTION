"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import registerMap from "../register/register-map.webp";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupButton,
} from "@/components/ui/input-group";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("Sign in is not available yet. Please try again later.");
    }

    return (
        <main className="flex min-h-svh items-center justify-center bg-[#F5F5F7] px-0 py-0 text-[#17251A] sm:px-6 sm:py-8 lg:px-10 lg:py-12">
            <div className="grid w-full max-w-[1280px] overflow-hidden bg-white shadow-[0_20px_70px_rgba(23,37,26,.11)] sm:rounded-[24px] lg:h-[820px] lg:grid-cols-[53%_47%]">
                <div
                    role="img"
                    aria-label="Illustrated KMUTT spotting map with goose, cat, squirrel, and turtle icons"
                    className="aspect-[4/5] bg-[#E9ECE5] bg-cover bg-center bg-no-repeat lg:aspect-auto lg:min-h-[760px]"
                    style={{ backgroundImage: `url(${registerMap.src})` }}
                />

                <section aria-labelledby="login-title" className="flex min-h-[780px] items-center justify-center px-6 py-12 sm:px-10 lg:px-10 lg:py-16">
                    <div className="w-full max-w-[410px]">
                        <header className="mb-12 text-center">
                            <h1 id="login-title" className="text-[38px] font-semibold leading-[1.05] tracking-tight text-[#17251A]">
                                ANIMAL<br />SPOTTING<br />COLLECTION
                            </h1>
                            <p className="mt-3 text-sm text-[#6F6F7C]">Welcome back to your collection.</p>
                        </header>

                        <form onSubmit={handleSubmit} onChange={() => setMessage("")}>
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="username" className="text-xs font-medium">Username or Email</label>
                                    <InputGroup className="h-10 rounded-md border-[#CBD5E1] bg-white">
                                        <InputGroupAddon><Mail className="text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput
                                            id="username"
                                            name="username"
                                            type="text"
                                            placeholder="Username or email"
                                            autoComplete="username"
                                            required
                                            className="text-xs placeholder:text-[#A7B4C5]"
                                        />
                                    </InputGroup>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="password" className="text-xs font-medium">Password</label>
                                    <InputGroup className="h-10 rounded-md border-[#CBD5E1] bg-white">
                                        <InputGroupAddon><Lock className="text-[#92999E]" /></InputGroupAddon>
                                        <InputGroupInput
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            required
                                            className="text-xs placeholder:text-[#A7B4C5]"
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

                            <Button type="submit" className="mt-9 h-10 w-full rounded-md bg-[#526E4E] text-sm text-white hover:bg-[#42573F]">
                                Sign In
                            </Button>
                            <p role="status" className="mt-3 text-center text-xs text-[#AE3C32]">{message}</p>
                        </form>

                        <p className="mt-9 text-center text-xs text-[#7D8BA1]">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="font-semibold text-[#B83D2E] hover:underline">Create Account</Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
