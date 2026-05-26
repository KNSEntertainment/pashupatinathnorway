import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import Festivals from "@/models/Festivals.Model";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface FestivalEvent {
  _id: string;
  eventname: string;
  eventdescription?: string;
  eventdate: string;
  eventtime?: string;
  eventvenue?: string;
  eventposterUrl: string;
  memberPrice?: number;
  guestPrice?: number;
  allowGuestRegistration: boolean;
  registrationDeadline?: Date;
  maxAttendees?: number;
}

export interface FestivalWithEvents {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  features: string[];
  timing?: string;
  highlight?: boolean;
  order: number;
  isActive: boolean;
  upcomingEvents: FestivalEvent[];
  recentEvents: FestivalEvent[];
  relatedEvents: FestivalEvent[];
}

export async function getFestivalsWithEvents(locale: string = "en"): Promise<FestivalWithEvents[]> {
  try {
    await connectDB();

    // Get all active festivals
    const festivals = await Festivals.find({ 
      isActive: true, 
      isDeleted: false 
    }).sort({ order: 1, createdAt: 1 });

    // Get current date for categorization
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Process each festival
    const festivalsWithEvents = await Promise.all(
      festivals.map(async (festival: any) => {
        const festivalTitle = festival.title?.[locale as keyof typeof festival.title] || 
                            (festival.title as any)?.en || "";

        // Get events directly associated with this festival
        const events = await Event.find({ 
          festivalId: festival._id 
        }).sort({ eventdate: -1 });

        // Categorize events
        const upcomingEvents: FestivalEvent[] = [];
        const recentEvents: FestivalEvent[] = [];
        const relatedEvents: FestivalEvent[] = [];

        events.forEach((event: any) => {
          const eventDate = new Date(event.eventdate);
          
          const festivalEvent: FestivalEvent = {
            _id: (event._id as any).toString(),
            eventname: event.eventname,
            eventdescription: event.eventdescription,
            eventdate: event.eventdate,
            eventtime: event.eventtime,
            eventvenue: event.eventvenue,
            eventposterUrl: event.eventposterUrl,
            memberPrice: event.memberPrice,
            guestPrice: event.guestPrice,
            allowGuestRegistration: event.allowGuestRegistration,
            registrationDeadline: event.registrationDeadline,
            maxAttendees: event.maxAttendees,
          };

          // Categorize based on date
          if (eventDate >= now) {
            upcomingEvents.push(festivalEvent);
          } else if (eventDate >= thirtyDaysAgo) {
            recentEvents.push(festivalEvent);
          }
          
          // All events are related
          relatedEvents.push(festivalEvent);
        });

        return {
          _id: (festival._id as any).toString(),
          title: festivalTitle,
          description: festival.description?.[locale as keyof typeof festival.description] || 
                    (festival.description as any)?.en || "",
          features: festival.features?.[locale as keyof typeof festival.features] || 
                   (festival.features as any)?.en || [],
          timing: festival.timing?.[locale as keyof typeof festival.timing] || 
                 (festival.timing as any)?.en || "",
          imageUrl: festival.imageUrl,
          highlight: festival.highlight,
          order: festival.order,
          isActive: festival.isActive,
          upcomingEvents,
          recentEvents,
          relatedEvents,
        };
      })
    );

    return festivalsWithEvents;
  } catch (error) {
    console.error("Error fetching festivals with events:", error);
    return [];
  }
}
