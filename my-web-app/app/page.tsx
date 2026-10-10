import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 ">
      <div className="flex flex-col items-center justify-center gap-20">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-[64px] font-light text-center leading-[120px] tracking-[24px] text-[#0F172A]">
            ANIMAL <br />
            SPOTTING <br />
            COLLECTION
          </h1>
          <p className="text-sm font-light text-center text-[#0F172A]">
            "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."
          </p>
        </div>


        <div className="flex flex-col gap-4">
          <Separator className="!w-32 mx-auto" />
          <div className="flex flex-row gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="font-bold text-foreground">Login</Link>
            <span>or</span>
            <Link href="/register" className="font-bold text-foreground">Register</Link>
          </div>
        </div>
      </div>

    </main>
  );
}