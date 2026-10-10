import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4">
      <h1 className="text-3xl font-bold">Animal Spotting Collection</h1>
      <div className="flex gap-2">
        <Button>Primary Button</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
    </main>
  );
}
