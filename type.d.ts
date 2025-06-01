interface ParsedResponse {
  query: string;
  near: string;
  price: string;
  open_now: boolean;
  rating?: number;
}

interface FoursquareIcon {
  prefix: string;
  suffix: string;
}

interface FoursquareCategory {
  id: number;
  name: string;
  short_name?: string;
  plural_name?: string;
  icon?: FoursquareIcon;
}

interface FoursquareRegularHoursItem {
  close: string;
  day: number;
  open: string;
}

interface FoursquareHours {
  display?: string;
  is_local_holiday?: boolean;
  open_now?: boolean;
  regular?: FoursquareRegularHoursItem[];
}

interface FoursquareLocation {
  address?: string;
  census_block?: string;
  country?: string;
  cross_street?: string;
  dma?: string;
  formatted_address: string;
  locality?: string;
  postcode?: string;
  region?: string;
}

interface FoursquareStats {
  total_photos?: number;
  total_ratings?: number;
  total_tips?: number;
}

interface FoursquarePhoto {
  id?: string;
  created_at?: string;
  prefix?: string;
  suffix?: string;
  width?: number;
  height?: number;
}

interface FoursquareGeocodesMain {
  latitude?: number;
  longitude?: number;
}

interface FoursquareGeocodes {
  main?: FoursquareGeocodesMain;
  roof?: FoursquareGeocodesMain;
}

interface FoursquarePlace {
  fsq_id: string;
  name: string;
  categories?: FoursquareCategory[];
  hours?: FoursquareHours;
  location: FoursquareLocation;
  price?: number;
  rating?: number;
  stats?: FoursquareStats;
  description?: string;
  tel?: string;
  website?: string;
  photos?: FoursquarePhoto[];
  geocodes?: FoursquareGeocodes;
}

interface FoursquareAPIResponse {
  results: FoursquarePlace[];
}

interface PlacesContextType {
  places: FoursquarePlace[];
  setPlaces: Dispatch<SetStateAction<FoursquarePlace[]>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  clearPlaces: () => void;
}

interface PlacesSearchResults {
  results: FoursquarePlace[];
  total: number;
}

interface RateLimitErrorResponse {
    message?: string;
    limit?: number;
    remaining?: number;
    reset: string;
}
