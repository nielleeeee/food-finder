"use client";

import PlaceCard from "@/components/card/placeCard";
import { usePlacesContext } from "@/lib/placesContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function PlaceList() {
  const { places, isLoading } = usePlacesContext();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="ml-3 text-lg">Loading restaurants...</p>
      </div>
    );
  }

  if (!places || places.length === 0) {
    return;
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-semibold mb-1">Search Results</h2>

      <p className="text-muted-foreground mb-4">
        Showing {places.length} places.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place: FoursquarePlace) => (
          <PlaceCard key={place.fsq_id} place={place} />
        ))}
      </div>
    </div>
  );
}
