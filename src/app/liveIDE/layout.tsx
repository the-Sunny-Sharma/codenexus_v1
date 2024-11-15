import React from "react";
import Header from "@/components/client/Header";
import { Toaster } from "@/components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
        <Toaster />
      </main>
    </div>
  );
}
