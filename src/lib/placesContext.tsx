"use client";

import { createContext, useContext, useState } from "react";

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export const PlacesProvider = ({ children }: { children: React.ReactNode }) => {
  const [places, setPlaces] = useState<FoursquarePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearPlaces = () => {
    setPlaces([]);
    setIsLoading(false);
  };

  return (
    <PlacesContext.Provider
      value={{
        places,
        setPlaces,
        isLoading,
        setIsLoading,
        clearPlaces,
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
};

export const usePlacesContext = () => {
  const context = useContext(PlacesContext);

  if (!context) {
    throw new Error("usePlacesContext must be used within a PlacesProvider");
  }

  return context;
};
