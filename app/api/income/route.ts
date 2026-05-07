import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Income from "@/models/Income.Model";
import mongoose from "mongoose";

export async function GET(request: Request) {
	try {
		await connectDB();
		const { searchParams } = new URL(request.url);
		const filter = searchParams.get('filter');
		
		const query: Record<string, unknown> = {};
		
		if (filter && filter !== 'all') {
			const now = new Date();
			switch (filter) {
				case '1week':
					query.date = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
					break;
				case '1month':
					query.date = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
					break;
				case '3months':
					query.date = { $gte: new Date(now.getFullYear(), now.getMonth() - 3, 1) };
					break;
				case '6months':
					query.date = { $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) };
					break;
				case '1year':
					query.date = { $gte: new Date(now.getFullYear(), 0, 1) };
					break;
			}
		}
		
		const income = await Income.find(query).populate('budgetId', 'name').sort({ date: -1 });
		return NextResponse.json(income, { status: 200 });
	} catch (error) {
		console.error("Error fetching income:", error);
		return NextResponse.json({ error: "Failed to fetch income" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		await connectDB();
		const body = await request.json();
		
		// Convert budgetId string to ObjectId if present
		if (body.budgetId && typeof body.budgetId === 'string') {
			try {
				body.budgetId = new mongoose.Types.ObjectId(body.budgetId);
			} catch {
				console.error("Invalid budgetId ObjectId:", body.budgetId);
				return NextResponse.json({ error: "Invalid budgetId format" }, { status: 400 });
			}
		}
		
		const income = await Income.create(body);
		return NextResponse.json(income, { status: 201 });
	} catch (error) {
		console.error("Error creating income:", error);
		return NextResponse.json({ error: "Failed to create income" }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	try {
		await connectDB();
		const body = await request.json();
		const { id, ...updateData } = body;
		
		if (!id) {
			return NextResponse.json({ error: "Income ID is required" }, { status: 400 });
		}
		
		// Convert budgetId string to ObjectId if present
		if (updateData.budgetId && typeof updateData.budgetId === 'string') {
			try {
				updateData.budgetId = new mongoose.Types.ObjectId(updateData.budgetId);
			} catch {
				console.error("Invalid budgetId ObjectId:", updateData.budgetId);
				return NextResponse.json({ error: "Invalid budgetId format" }, { status: 400 });
			}
		}
		
		const income = await Income.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		);
		
		if (!income) {
			return NextResponse.json({ error: "Income not found" }, { status: 404 });
		}
		
		return NextResponse.json(income, { status: 200 });
	} catch (error) {
		console.error("Error updating income:", error);
		return NextResponse.json({ error: "Failed to update income" }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		await connectDB();
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');
		
		if (!id) {
			return NextResponse.json({ error: "Income ID is required" }, { status: 400 });
		}
		
		const income = await Income.findByIdAndDelete(id);
		
		if (!income) {
			return NextResponse.json({ error: "Income not found" }, { status: 404 });
		}
		
		return NextResponse.json({ message: "Income deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting income:", error);
		return NextResponse.json({ error: "Failed to delete income" }, { status: 500 });
	}
}
