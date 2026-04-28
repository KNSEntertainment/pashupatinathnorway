import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Department from "@/models/Department.Model";

export async function POST(req) {
	try {
		await connectDB();

		const { name, subdepartments, order, isActive } = await req.json();

		if (!name) {
			return NextResponse.json({ error: "Department name is required." }, { status: 400 });
		}

		const newDepartment = await Department.create({
			name,
			subdepartments: subdepartments || [],
			order: order || 0,
			isActive: isActive !== undefined ? isActive : true,
		});

		return NextResponse.json({ success: true, department: newDepartment }, { status: 201 });
	} catch (error) {
		console.error("Error creating department:", error);
		return NextResponse.json({ error: "Failed to create department." }, { status: 500 });
	}
}
