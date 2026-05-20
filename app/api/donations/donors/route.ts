import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

export async function GET(request: Request) {
	try {
		await connectDB();
		
		// Parse query parameters for pagination
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const sortBy = searchParams.get('sortBy') || 'amount';
		const sortOrder = searchParams.get('sortOrder') || 'desc';
		const filter = searchParams.get('filter'); // all, named, anonymous
		const search = searchParams.get('search');
		
		// Calculate skip for pagination
		const skip = (page - 1) * limit;
		
		// Build filter query
		const query: { paymentStatus: string; isAnonymous?: boolean; donorName?: { $regex: string; $options: string } } = { paymentStatus: "completed" };
		
		// Add filter for anonymous/named
		if (filter === 'anonymous') {
			query.isAnonymous = true;
		} else if (filter === 'named') {
			query.isAnonymous = false;
		}
		
		// Add search filter
		if (search) {
			query.donorName = { $regex: search, $options: 'i' };
		}
		
		// Build sort object
		const sort: { [key: string]: 1 | -1 } = {};
		sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
		
		// Get total count for pagination
		const totalCount = await Donation.countDocuments(query);
		
		// Fetch paginated donations
		const donations = await Donation.find(query)
			.select("donorName donorEmail donorPhone address amount message isAnonymous paymentStatus createdAt")
			.sort(sort)
			.skip(skip)
			.limit(limit)
			.lean();
		
		// Format the donor data
		const donorList = donations.map(donation => ({
			name: donation.isAnonymous ? "Anonymous Donor" : donation.donorName,
			amount: donation.amount,
			isAnonymous: donation.isAnonymous,
			date: donation.createdAt,
			email: donation.donorEmail,
			phone: donation.donorPhone,
			address: donation.address,
			message: donation.message,
			paymentStatus: donation.paymentStatus
		}));
		
		// Calculate pagination info
		const totalPages = Math.ceil(totalCount / limit);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;
		
		return NextResponse.json({
			donors: donorList,
			pagination: {
				page,
				limit,
				total: totalCount,
				pages: totalPages,
				hasNextPage,
				hasPrevPage
			}
		}, { status: 200 });
	} catch (error) {
		console.error("Error fetching donor list:", error);
		return NextResponse.json({ error: "Failed to fetch donor list" }, { status: 500 });
	}
}
