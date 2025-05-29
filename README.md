# Restaurant Finder

This application is a restaurant finder that uses a Large Language Model (LLM) to understand free-form user queries. It converts these queries into structured JSON commands, calls the Foursquare Places API to fetch restaurant data, and displays the results.

## Features

- Natural Language Query: Users can type what they're looking for in plain English.
- LLM-Powered Parsing: Uses the Gemini API to convert natural language into a structured Foursquare API query.
- Foursquare Integration: Fetches real-time restaurant data from the Foursquare Places API.
- Dynamic Results Display: Shows relevant restaurant details like name, address, rating, price, and hours.

## Technical Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Package Manager**: pnpm
- **AI**: Google Gemini API (for natural language processing)
- **Data Source**: Foursquare Places API
- **UI**: React, ShadCN UI, React Hook Form (for functional simplicity)
- **Styling**: Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [pnpm](https://pnpm.io/installation)

## Setup Instructions

1.  **Clone the repository (if applicable):**

    ```bash
    git clone <your-repository-url>
    cd <repository-name>
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
    ```

    See the "Environment Variables" section below for more details on obtaining these keys.

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    The application should now be running on [http://localhost:3000](http://localhost:3000).
