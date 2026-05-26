import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";

// OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};
	
	return NextResponse.json({}, { headers });
}

export async function GET() {
	try {
		await connectDB();
		const query = {};
		
		// Try to populate festivalId, but handle gracefully if schema doesn't support it yet
		let events;
		try {
			events = await Event.find(query).populate('festivalId', 'title').sort({ eventdate: -1 });
		} catch (populateError) {
			console.log("Populate failed, manually fetching festival data:", populateError.message);
			
			// Fetch events without populate
			const eventsWithoutFestival = await Event.find(query).sort({ eventdate: -1 });
			
			// Manually fetch festival data for events that have festivalId
			const festivalIds = [...new Set(eventsWithoutFestival
				.filter(event => event.festivalId)
				.map(event => event.festivalId))];
			
			let festivals = [];
			if (festivalIds.length > 0) {
				try {
					festivals = await Festival.find({ _id: { $in: festivalIds } }).lean();
				} catch (festivalError) {
					console.log("Failed to fetch festivals:", festivalError.message);
				}
			}
			
			// Manually attach festival data
			events = eventsWithoutFestival.map(event => {
				const eventObj = event.toObject ? event.toObject() : event;
				if (event.festivalId) {
					const festival = festivals.find(f => f._id.toString() === event.festivalId.toString());
					eventObj.festival = festival ? { title: festival.title } : null;
				}
				return eventObj;
			});
		}
		
		// Add CORS headers
		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};
		
		return NextResponse.json({ success: true, events }, { 
			status: 200,
			headers 
		});
	} catch (error) {
		console.error("Error fetching events:", error);
		
		// Add CORS headers to error response
		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};
		
		return NextResponse.json({ success: false, error: error.message }, { 
			status: 500,
			headers 
		});
	}
}
