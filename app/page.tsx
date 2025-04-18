import Image from "next/image"; 
import WellGrid from "@/components/WellGrid";

export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-navy-900 mb-6 text-center">WellSync AI Dashboard</h1>
      <WellGrid />
    </main>
  );
} 