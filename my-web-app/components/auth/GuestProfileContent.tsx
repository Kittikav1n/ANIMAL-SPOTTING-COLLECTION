import Link from "next/link";
import { User } from "lucide-react";

export default function GuestProfileContent() {
    return (
        <div className="mx-auto mt-4 flex w-full max-w-[400px] flex-col items-center">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-[#E0ECDD]">
                <User
                    aria-hidden="true"
                    className="size-14 text-[#526E4E]"
                    strokeWidth={1.25}
                />
            </div>
            <h2 className="mt-5 text-center text-base font-semibold">
                Welcome to your collection
            </h2>

            <p className="mt-2 text-center text-[13px] leading-relaxed text-[#7A817D]">
                Log in to add animal spots
                <br />
                and manage your profile.
            </p>

            <div className="mt-6 flex w-full max-w-[230px] flex-col gap-2">
                <Link
                    href="/login"
                    className="flex h-11 items-center justify-center rounded-md bg-[#93A58F] text-[13px] text-[#171C18] hover:bg-[#81977C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526E4E]"
                >
                    Login
                </Link>

                <Link href="/register" className="flex h-11 items-center justify-center rounded-md bg-[#B5756C] text-[13px] text-[#171C18] hover:bg-[#A8655C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526E4E]">
                    Register
                </Link>
            </div>
        </div>
    );
}
