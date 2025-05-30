import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, DollarSign, Clock, Building } from "lucide-react";

interface PlaceCardProps {
  place: FoursquarePlace;
}

const renderPrice = (priceTier?: number): string => {
  if (priceTier === undefined || priceTier < 1 || priceTier > 4) {
    return "N/A";
  }

  return "$".repeat(priceTier);
};

export default function PlaceCard({ place }: PlaceCardProps) {
  let categoryList = "Category not available";

  if (place.categories && place.categories.length > 0) {
    const categoryNames = place.categories
      .map((cat) => cat.name)
      .filter((name) => !!name);

    if (categoryNames.length > 0) {
      categoryList = categoryNames.join(", ");
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{place.name}</CardTitle>

        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <Building size={16} className="mr-2 flex-shrink-0" />
          {categoryList}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-3">
        <div className="flex items-start text-sm">
          <MapPin
            size={16}
            className="mr-2 mt-0.5 flex-shrink-0 text-gray-600"
          />
          <span>
            {place.location.formatted_address || "Address not available"}
          </span>
        </div>

        {place.rating !== undefined && (
          <div className="flex items-center text-sm">
            <Star size={16} className="mr-2 flex-shrink-0 text-yellow-500" />
            <span>Rating: {place.rating.toFixed(1)}/10</span>
          </div>
        )}

        {place.price !== undefined && (
          <div className="flex items-center text-sm">
            <DollarSign
              size={16}
              className="mr-2 flex-shrink-0 text-green-600"
            />
            <span>Price: {renderPrice(place.price)}</span>
          </div>
        )}

        {place.hours?.display && (
          <div className="flex items-start text-sm">
            <Clock
              size={16}
              className="mr-2 mt-0.5 flex-shrink-0 text-blue-600"
            />
            <span>{place.hours.display}</span>
          </div>
        )}

        {place.description && (
          <p className="text-sm text-muted-foreground pt-2 italic truncate">
            "
            {place.description.length > 100
              ? `${place.description.substring(0, 97)}...`
              : place.description}
            "
          </p>
        )}
      </CardContent>
      {place.hours?.open_now !== undefined && (
        <CardFooter>
          <Badge
            variant={place.hours.open_now ? "default" : "outline"}
            className={
              place.hours.open_now
                ? "bg-green-600 text-white"
                : "border-red-500 text-red-500"
            }
          >
            {place.hours.open_now ? "Open Now" : "Closed"}
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
}
