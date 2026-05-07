import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Budget from "@/models/Budget.Model";

export async function GET() {
	try {
		await connectDB();
		const budgets = await Budget.find().sort({ createdAt: -1 });
		return NextResponse.json(budgets, { status: 200 });
	} catch (error) {
		console.error("Error fetching budgets:", error);
		return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		await connectDB();
		const body = await request.json();
		
		const budget = await Budget.create(body);
		return NextResponse.json(budget, { status: 201 });
	} catch (error) {
		console.error("Error creating budget:", error);
		return NextResponse.json({ error: "Failed to create budget" }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	try {
		await connectDB();
		const body = await request.json();
		const { id, ...updateData } = body;
		
		if (!id) {
			return NextResponse.json({ error: "Budget ID is required" }, { status: 400 });
		}
		
		const budget = await Budget.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		);
		
		if (!budget) {
			return NextResponse.json({ error: "Budget not found" }, { status: 404 });
		}
		
		return NextResponse.json(budget, { status: 200 });
	} catch (error) {
		console.error("Error updating budget:", error);
		return NextResponse.json({ error: "Failed to update budget" }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
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
