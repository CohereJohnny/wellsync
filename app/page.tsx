import Image from "next/image"; 
import WellGrid from "@/components/WellGrid";
import { Toolbar } from "@/components/toolbar";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <h1 className="text-3xl font-bold text-navy-900 p-8 text-center">WellSync AI Dashboard</h1>
      <Toolbar />
      <div className="flex-1 container mx-auto p-8">
        <WellGrid />
      </div>
    </main>
  );
} 