"use client";

import { PlacesProvider } from "@/lib/placesContext";
import { Toaster } from "@/components/ui/sonner";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster />
      <PlacesProvider>{children}</PlacesProvider>
    </>
  );
}
