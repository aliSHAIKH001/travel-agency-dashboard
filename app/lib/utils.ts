import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string): string => {
    return dayjs(dateString).format("MMMM DD, YYYY");
};

export function parseMarkdownToJson(markdownText: string): unknown | null {
    const regex = /```json\n([\s\S]+?)\n```/;
    const match = markdownText.match(regex);

    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return null;
        }
    }
    console.error("No valid JSON found in markdown text.");
    return null;
}

export function parseTripData(jsonString: string): Trip | null {
    try {
        const data: Trip = JSON.parse(jsonString);

        return data;
    } catch (error) {
        console.error("Failed to parse trip data:", error);
        return null;
    }
}

export function getFirstWord(input: string = ""): string {
    return input.trim().split(/\s+/)[0] || "";
}

export const calculateTrendPercentage = (
    countOfThisMonth: number,
    countOfLastMonth: number
): TrendResult => {
    if (countOfLastMonth === 0) {
        return countOfThisMonth === 0
            ? { trend: "no change", percentage: 0 }
            : { trend: "increment", percentage: 100 };
    }

    const change = countOfThisMonth - countOfLastMonth;
    const percentage = Math.abs((change / countOfLastMonth) * 100);

    if (change > 0) {
        return { trend: "increment", percentage };
    } else if (change < 0) {
        return { trend: "decrement", percentage };
    } else {
        return { trend: "no change", percentage: 0 };
    }
};

export const formatKey = (key: keyof TripFormData) => {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
};


interface Activity {
    time: string;
    description: string;
}

interface DayPlan {
    day: number;
    location: string;
    activities: Activity[];
}

interface Trip {
    name: string;
    description: string;
    estimatedPrice: string;      // e.g. "$1400" (not used for rating)
    duration: number;            // days
    budget: "Low" | "Mid-range" | "High-end" | "Luxury";
    travelStyle: string;         // e.g. "Relaxed"
    country: string;
    interests: string;
    groupType: string;           // e.g. "Couple"
    bestTimeToVisit?: string[];
    weatherInfo?: string[];
    location?: {
        city: string;
        coordinates: [number, number];
        openStreetMap: string;
    };
    itinerary: DayPlan[];
}


export function rateTrip(trip: Trip): string {
    const totalActivities = trip.itinerary.reduce(
        (sum, day) => sum + day.activities.length,
        0
    );
    const uniqueLocations = new Set(trip.itinerary.map((d) => d.location)).size;
    const actsPerDay = totalActivities / trip.duration;

    /* 1. Cost efficiency (category‑level, not exact price) */
    const budgetScoreMap: Record<Trip["budget"], number> = {
        Low: 1.0,
        "Mid-range": 0.85,
        "High-end": 0.60,
        Luxury: 0.40
    };
    const costScore = budgetScoreMap[trip.budget] ?? 0.5;

    /* 2. Itinerary richness */
    const richnessScore = Math.min(actsPerDay / 3, 1); // 3 acts/day ideal

    /* 3. Diversity of locations */
    const diversityScore = Math.min(uniqueLocations / 5, 1); // 5+ hits max

    /* 4. Seasonal comfort (any advice provided ⇒ assume researched) */
    const seasonScore = trip.bestTimeToVisit?.length ? 1 : 0;

    /* 5. Style & group fit */
    // relaxed pace bonus
    const relaxedPace =
        trip.travelStyle.toLowerCase() === "relaxed"
            ? actsPerDay <= 3
                ? 1
                : Math.max(0, 1 - (actsPerDay - 3) / 3)
            : 0.8; // default for other styles
    // romantic keyword bonus for couples
    const romanticRE = /dinner|cocktail|sunset|romantic|wine|beach|rooftop/i;
    const allDescriptions = trip.itinerary
        .flatMap((d) => d.activities)
        .map((a) => a.description)
        .join(" ");
    const hasRomantic = romanticRE.test(allDescriptions);
    const fitScore =
        0.7 * relaxedPace +
        0.3 * (trip.groupType.toLowerCase() === "couple" && hasRomantic ? 1 : 0);

    // --- weighted aggregate (weights sum to 1) ------------------------------
    const final =
        costScore * 0.10 +
        richnessScore * 0.28 +
        diversityScore * 0.27 +
        seasonScore * 0.20 +
        fitScore * 0.15;

    // --- scale to 0‒5 and format -------------------------------------------
    return (final * 5).toFixed(1);
}

