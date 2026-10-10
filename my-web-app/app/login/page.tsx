"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupButton,
} from "@/components/ui/input-group";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";



export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="w-full max-w-sm flex flex-col gap-14">
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-5xl font-light text-center tracking-wide leading-tight">
                        ANIMAL SPOTTING COLLECTION
                    </h1>
                    <p className="text-muted-foreground text-center text-xs">
                        "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."
                    </p>
                </div>

                <div className="w-full max-w-sm flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="username" className="text-sm font-bold">USERNAME OR EMAIL</label>
                        <InputGroup className="border-2 border-[#CBD5E1]">
                            <InputGroupAddon>
                                <Mail />
                            </InputGroupAddon>
                            <InputGroupInput id="username" type="text" placeholder="USERNAME OR EMAIL" autoComplete="username" />
                        </InputGroup>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-sm font-bold">PASSWORD</label>
                        <InputGroup className="border-2 border-[#CBD5E1]">
                            <InputGroupAddon>
                                <Lock />
                            </InputGroupAddon>
                            <InputGroupInput
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="PASSWORD"
                                autoComplete="current-password"
                            />
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <Eye /> : <EyeOff />}
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                </div>

                <Button className="w-full bg-[#526E4E]/63 hover:bg-[#526E4E]/75 text-foreground">LOGIN</Button>

                <div className="flex flex-col gap-2">
                    <Separator className="!w-24 mx-auto" />
                    <p className="text-sm text-center text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="font-bold text-foreground">Sign up</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}


