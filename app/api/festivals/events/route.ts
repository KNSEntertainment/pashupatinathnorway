import { NextRequest, NextResponse } from "next/server";
import { getFestivalsWithEvents } from "@/lib/data/festival-events-direct";

/**
 * GET /api/festivals/events
 * Query parameters:
 * - locale: Language locale (default: "en")
 * - type: Filter by "upcoming", "recent", or "related" (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "en";
    const type = searchParams.get("type"); // "upcoming", "recent", "related"

    // Get all festivals with their events using direct relationships
    const festivalsWithEvents = await getFestivalsWithEvents(locale);
    
    if (type && ["upcoming", "recent", "related"].includes(type)) {
      // Return only the specified event type for all festivals
      const filtered = festivalsWithEvents.map(festival => ({
        _id: festival._id,
        title: festival.title,
        description: festival.description,
        imageUrl: festival.imageUrl,
        features: festival.features,
        timing: festival.timing,
        highlight: festival.highlight,
        order: festival.order,
        isActive: festival.isActive,
        events: festival[`${type}Events` as keyof typeof festival] || []
      }));
      return NextResponse.json(filtered);
    }
    
    return NextResponse.json(festivalsWithEvents);
  } catch (error) {
    console.error("Error fetching festival events:", error);
    return NextResponse.json(
      { error: "Failed to fetch festival events" },
      { status: 500 }
    );
  }
}
