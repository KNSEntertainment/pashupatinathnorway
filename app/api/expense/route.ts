import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense.Model";
import mongoose from "mongoose";

export async function GET(request: Request) {
	try {
		await connectDB();
		const { searchParams } = new URL(request.url);
		const filter = searchParams.get('filter');
		const eventId = searchParams.get('eventId');
		
		const query: Record<string, unknown> = {};
		
		if (eventId) {
			query.eventId = new mongoose.Types.ObjectId(eventId);
		}
		
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
		
		const expenses = await Expense.find(query)
			.populate('eventId', 'eventname eventdate')
			.populate('budgetId', 'name')
			.populate('createdBy', 'name email')
			.sort({ date: -1 });
			
		return NextResponse.json(expenses, { status: 200 });
	} catch (error) {
		console.error("Error fetching expenses:", error);
		return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		await connectDB();
		const body = await request.json();
		
		console.log("Expense creation request body:", body);
		
		// Validate required fields
		if (!body.title || !body.amount || !body.expenseCategory || !body.date) {
			console.error("Missing required fields:", { title: !!body.title, amount: !!body.amount, expenseCategory: !!body.expenseCategory, date: !!body.date });
			return NextResponse.json({ error: "Missing required fields: title, amount, expenseCategory, date" }, { status: 400 });
		}
		
		// Convert eventId to ObjectId if present
		if (body.eventId && typeof body.eventId === 'string') {
			try {
				body.eventId = new mongoose.Types.ObjectId(body.eventId);
			} catch {
				console.error("Invalid eventId ObjectId:", body.eventId);
				return NextResponse.json({ error: "Invalid eventId format" }, { status: 400 });
			}
		}
		
		// Convert budgetId string to ObjectId if present
		if (body.budgetId && typeof body.budgetId === 'string') {
			try {
				body.budgetId = new mongoose.Types.ObjectId(body.budgetId);
			} catch {
				console.error("Invalid budgetId ObjectId:", body.budgetId);
				return NextResponse.json({ error: "Invalid budgetId format" }, { status: 400 });
			}
		}
		
		// Convert createdBy to ObjectId if present
		if (body.createdBy && typeof body.createdBy === 'string') {
			try {
				body.createdBy = new mongoose.Types.ObjectId(body.createdBy);
			} catch {
				console.error("Invalid createdBy ObjectId:", body.createdBy);
				return NextResponse.json({ error: "Invalid createdBy format" }, { status: 400 });
			}
		}
		
		// Convert string date to Date object
		if (body.date && typeof body.date === 'string') {
			body.date = new Date(body.date);
		}
		
		console.log("Processed expense data:", body);
		
		const expense = await Expense.create(body);
		const populatedExpense = await Expense.findById(expense._id)
			.populate('eventId', 'eventname eventdate')
			.populate('budgetId', 'name')
			.populate('createdBy', 'name email');
			
		return NextResponse.json(populatedExpense, { status: 201 });
	} catch (error) {
		console.error("Error creating expense:", error);
		if (error instanceof Error && error.name === 'ValidationError') {
			const validationError = error as unknown as {
				errors: Record<string, { message: string }>;
			};
			console.error("Validation errors:", Object.values(validationError.errors).map(err => err.message));
			return NextResponse.json({ error: "Validation failed: " + Object.values(validationError.errors).map(err => err.message).join(", ") }, { status: 400 });
		}
		return NextResponse.json({ error: "Failed to create expense: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	try {
		await connectDB();
		const body = await request.json();
		const { id, ...updateData } = body;
		
		if (!id) {
			return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
		}
		
		// Convert eventId to ObjectId if present
		if (updateData.eventId && typeof updateData.eventId === 'string') {
			try {
				updateData.eventId = new mongoose.Types.ObjectId(updateData.eventId);
			} catch {
				console.error("Invalid eventId ObjectId:", updateData.eventId);
				return NextResponse.json({ error: "Invalid eventId format" }, { status: 400 });
			}
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
		
		// Convert createdBy to ObjectId if present
		if (updateData.createdBy && typeof updateData.createdBy === 'string') {
			try {
				updateData.createdBy = new mongoose.Types.ObjectId(updateData.createdBy);
			} catch {
				console.error("Invalid createdBy ObjectId:", updateData.createdBy);
				return NextResponse.json({ error: "Invalid createdBy format" }, { status: 400 });
			}
		}
		
		const expense = await Expense.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		).populate('eventId', 'eventname eventdate')
		 .populate('budgetId', 'name')
		 .populate('createdBy', 'name email');
		
		if (!expense) {
			return NextResponse.json({ error: "Expense not found" }, { status: 404 });
		}
		
		return NextResponse.json(expense, { status: 200 });
	} catch (error) {
		console.error("Error updating expense:", error);
		return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		await connectDB();
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');
		
		if (!id) {
			return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
		}
		
		const expense = await Expense.findByIdAndDelete(id);
		
		if (!expense) {
			return NextResponse.json({ error: "Expense not found" }, { status: 404 });
		}
		
		return NextResponse.json({ message: "Expense deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting expense:", error);
		return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
	}
}
