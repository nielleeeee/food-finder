import {
  FOURESQUARE_API_BASE_URL,
  FOURSQUARE_API_SEARCH_PARAMS,
} from "@/lib/constant";

export const getFoursquarePlacesData = async (
  llmParams: ParsedResponse,
  apiKey: string
): Promise<PlacesSearchResults> => {
  const searchParams = new URLSearchParams();

  if (llmParams.query) searchParams.append("query", llmParams.query);
  if (llmParams.near) searchParams.append("near", llmParams.near);
  if (llmParams.price) searchParams.append("price", llmParams.price);
  if (llmParams.open_now === true) searchParams.append("open_now", "true");

  if (FOURSQUARE_API_SEARCH_PARAMS.fields)
    searchParams.append("fields", FOURSQUARE_API_SEARCH_PARAMS.fields);
  if (FOURSQUARE_API_SEARCH_PARAMS.sort)
    searchParams.append("sort", FOURSQUARE_API_SEARCH_PARAMS.sort);
  if (FOURSQUARE_API_SEARCH_PARAMS.limit)
    searchParams.append("limit", FOURSQUARE_API_SEARCH_PARAMS.limit);

  const dynamicUrl = `${FOURESQUARE_API_BASE_URL}?${searchParams.toString()}`;
  console.log("Dynamic Foursquare URL:", dynamicUrl);

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: apiKey,
    },
  };

  try {
    const foursquareHttpResponse = await fetch(dynamicUrl, options);

    if (!foursquareHttpResponse.ok) {
      let errorDetails = `Foursquare API request failed with status ${foursquareHttpResponse.status}`;

      const errorData = await foursquareHttpResponse.json();

      errorDetails = errorData.message || JSON.stringify(errorData);

      throw new Error("Foursquare API request failed: " + errorDetails);
    }

    const foursquareApiResponse =
      (await foursquareHttpResponse.json()) as FoursquareAPIResponse;

    if (
      !foursquareApiResponse ||
      !Array.isArray(foursquareApiResponse.results)
    ) {
      throw new Error(
        "Invalid data structure from Foursquare: 'results' array missing.: " +
          JSON.stringify(foursquareApiResponse)
      );
    }

    let finalResultsArray: FoursquarePlace[] = foursquareApiResponse.results;

    const userSpecifiedMinRating = llmParams.rating;

    if (typeof userSpecifiedMinRating === "number") {
      console.log(`Applying rating filter: >= ${userSpecifiedMinRating}`);

      finalResultsArray = finalResultsArray.filter(
        (placeItem: FoursquarePlace) => {
          if (typeof placeItem.rating === "number") {
            return placeItem.rating >= userSpecifiedMinRating;
          }
          return false;
        }
      );
    }

    return {
      results: finalResultsArray,
      total: finalResultsArray.length,
    };
  } catch (error) {
    console.error("Error in fetchAndFilterFoursquarePlaces:", error);

    throw new Error("Foursquare data processing failed");
  }
};
