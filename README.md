# Place Finder App

This application is a place finder that uses a Large Language Model (LLM) to understand free-form user queries. It converts these queries into structured JSON commands, calls the Foursquare Places API to fetch place data, and displays the results.

## Features

- Natural Language Query: Users can type what they're looking for in plain English.
- LLM-Powered Parsing: Uses the Gemini API to convert natural language into a structured Foursquare API query.
- Foursquare Integration: Fetches real-time place data from the Foursquare Places API.
- Dynamic Results Display: Shows relevant place details like name, address, rating, price, and hours.

## Technical Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Package Manager**: pnpm
- **AI**: Google Gemini API (for natural language processing)
- **Data Source**: Foursquare Places API
- **Rate Limiting**: Upstash Redis
- **UI**: React, ShadCN UI, React Hook Form (for functional simplicity)
- **Styling**: Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [pnpm](https://pnpm.io/installation)

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/nielleeeee/food-finder.git
    cd food-finder
    ```

2.  **Install dependencies:**
    Using pnpm, install the project dependencies:

    ```bash
    pnpm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of your project. This file will store your API keys.

    Add the following environment variables to your `.env.local` file:

    ```env
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    FOURSQUARE_API_KEY="YOUR_FOURSQUARE_API_KEY"
    UPSTASH_REDIS_REST_URL="your_upstash_redis_rest_url"
    UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_rest_token"
    ```

    See the "Environment Variables" section below for more details on obtaining these keys.

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    The application should now be running on [http://localhost:3000](http://localhost:3000).

## Assumptions

- **API Access & Quotas**: It is assumed that valid API keys are provided for Google Gemini, Foursquare Places, and Upstash Redis. Usage is subject to the respective services' free tier limits, quotas, and pricing models.
- **Geocoding of Locations**: The `near` parameter extracted by the LLM is guided by prompts to be a recognizable location. However, Foursquare's ability to geocode the resulting string is the final determinant for search accuracy.
- **Basic UI Focus**: The user interface is intentionally kept simple to prioritize backend functionality and API integrations as per the project's focus.

## Limitations

- **LLM Adherence for Optional Data**: While the Gemini API is guided by a system prompt and a response schema to ensure structured JSON output, its interpretation of complex natural language for optional parameters (e.g., `price` for non-business places, or nuanced `rating` conditions) can sometimes vary. The strict schema helps maintain data consistency in the output format, but the LLM might occasionally omit an optional field it could have derived from a highly ambiguous query, or not perfectly interpret every subtlety for such fields.
- **General Place Search vs. Specific Parameters**: Although the application can search for general places, some parameters like `price` (Foursquare's 1-4 tier) are more directly applicable to businesses like restaurants and shops. The effectiveness of such parameters for other place types (e.g., "cheap park") depends on how the Foursquare API handles them for those categories.
- **Rate Limiting Scope**: The current rate limiter is IP-based. This is effective for basic abuse prevention but can be less precise for users behind NATs or could be bypassed by determined users with access to multiple IP addresses.
- **Complex Query Interpretation**: For extremely complex, highly nuanced, or deeply nested natural language queries, the LLM might occasionally miss subtle details, potentially leading to search parameters that don't fully capture the user's precise intent.
- **No Conversational Memory**: Each search query is treated as an independent transaction. The application does not currently support multi-turn conversations or remember context from previous searches.
- **Data Source Dependency**: The accuracy, completeness, and real-time availability of place information are entirely dependent on the Foursquare Places API.
- **API Costs**: Beyond any free tiers, sustained usage of Google Gemini API, Foursquare API, and Upstash Redis can incur costs.
