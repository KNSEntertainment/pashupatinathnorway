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
		const events = await Event.find(query).sort({ eventdate: -1 });
		
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
