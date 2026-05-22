import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Budget from "@/models/Budget.Model";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET(request: Request) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();
		const { searchParams } = new URL(request.url);
		const eventId = searchParams.get('eventId');
		
		let query = {};
		if (eventId) {
			try {
				query = { eventId: new mongoose.Types.ObjectId(eventId) };
			} catch {
				console.error("Invalid eventId format:", eventId);
				return NextResponse.json({ error: "Invalid eventId format" }, { status: 400 });
			}
		}
		
		const budgets = await Budget.find(query)
			.populate('eventId', 'eventname eventdate')
			.sort({ createdAt: -1 });
			
					
		return NextResponse.json(budgets, { status: 200 });
	} catch (error) {
		console.error("Error fetching budgets:", error);
		return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();
		const body = await request.json();
		
		console.log("Budget creation request body:", body);
		
		// Validate required fields
		if (!body.name || !body.category || !body.allocatedAmount || !body.startDate || !body.endDate) {
			console.error("Missing required fields:", { name: !!body.name, category: !!body.category, allocatedAmount: !!body.allocatedAmount, startDate: !!body.startDate, endDate: !!body.endDate });
			return NextResponse.json({ error: "Missing required fields: name, category, allocatedAmount, startDate, endDate" }, { status: 400 });
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
		
		// Convert createdBy to ObjectId if present
		if (body.createdBy && typeof body.createdBy === 'string') {
			try {
				body.createdBy = new mongoose.Types.ObjectId(body.createdBy);
			} catch {
				console.error("Invalid createdBy ObjectId:", body.createdBy);
				return NextResponse.json({ error: "Invalid createdBy format" }, { status: 400 });
			}
		}
		
		// For backward compatibility, ensure totalAmount is set
		if (!body.totalAmount && body.allocatedAmount) {
			body.totalAmount = body.allocatedAmount;
		} else if (body.totalAmount && !body.allocatedAmount) {
			body.allocatedAmount = body.totalAmount;
		}
		
		// Convert string dates to Date objects
		if (body.startDate && typeof body.startDate === 'string') {
			body.startDate = new Date(body.startDate);
		}
		if (body.endDate && typeof body.endDate === 'string') {
			body.endDate = new Date(body.endDate);
		}
		
		// Calculate remaining amount
		if (body.allocatedAmount && body.spentAmount !== undefined) {
			body.remainingAmount = body.allocatedAmount - body.spentAmount;
		}
		
		console.log("Processed budget data:", body);
		
		const budget = await Budget.create(body);
		const populatedBudget = await Budget.findById(budget._id)
			.populate('eventId', 'eventname eventdate')
			.populate('createdBy', 'name email');
			
		return NextResponse.json(populatedBudget, { status: 201 });
	} catch (error) {
		console.error("Error creating budget:", error);
		if (error instanceof Error && error.name === 'ValidationError') {
			const validationError = error as unknown as {
				errors: Record<string, { message: string }>;
			};
			console.error("Validation errors:", Object.values(validationError.errors).map(err => err.message));
			return NextResponse.json({ error: "Validation failed: " + Object.values(validationError.errors).map(err => err.message).join(", ") }, { status: 400 });
		}
		return NextResponse.json({ error: "Failed to create budget: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();
		const body = await request.json();
		const { id, ...updateData } = body;
		
		if (!id) {
			return NextResponse.json({ error: "Budget ID is required" }, { status: 400 });
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
		
		// Convert createdBy to ObjectId if present
		if (updateData.createdBy && typeof updateData.createdBy === 'string') {
			try {
				updateData.createdBy = new mongoose.Types.ObjectId(updateData.createdBy);
			} catch {
				console.error("Invalid createdBy ObjectId:", updateData.createdBy);
				return NextResponse.json({ error: "Invalid createdBy format" }, { status: 400 });
			}
		}
		
		// Calculate remaining amount if allocatedAmount or spentAmount is being updated
		if (updateData.allocatedAmount !== undefined || updateData.spentAmount !== undefined) {
			const budget = await Budget.findById(id);
			if (!budget) {
				return NextResponse.json({ error: "Budget not found" }, { status: 404 });
			}
			
			const allocatedAmount = updateData.allocatedAmount !== undefined ? updateData.allocatedAmount : budget.allocatedAmount;
			const spentAmount = updateData.spentAmount !== undefined ? updateData.spentAmount : budget.spentAmount;
			updateData.remainingAmount = allocatedAmount - spentAmount;
		}
		
		const updatedBudget = await Budget.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		).populate('eventId', 'eventname eventdate')
		 .populate('createdBy', 'name email');
		
		if (!updatedBudget) {
			return NextResponse.json({ error: "Budget not found" }, { status: 404 });
		}
		
		return NextResponse.json(updatedBudget, { status: 200 });
	} catch (error) {
		console.error("Error updating budget:", error);
		return NextResponse.json({ error: "Failed to update budget" }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');
		
		if (!id) {
			return NextResponse.json({ error: "Budget ID is required" }, { status: 400 });
		}
		
		const budget = await Budget.findByIdAndDelete(id);
		
		if (!budget) {
			return NextResponse.json({ error: "Budget not found" }, { status: 404 });
		}
		
		return NextResponse.json({ message: "Budget deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting budget:", error);
		return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 });
	}
}
