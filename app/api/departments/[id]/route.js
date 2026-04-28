import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Department from "@/models/Department.Model";

export async function PUT(req, { params }) {
	try {
		await connectDB();
		const { id } = params;

		const { name, subdepartments, order, isActive } = await req.json();

		const updateData = {
			name,
			subdepartments: subdepartments || [],
			order: order || 0,
			isActive: isActive !== undefined ? isActive : true,
			updatedAt: Date.now(),
		};

		const updatedDepartment = await Department.findByIdAndUpdate(id, updateData, { new: true });

		if (!updatedDepartment) {
			return NextResponse.json({ error: "Department not found." }, { status: 404 });
		}

		return NextResponse.json({ success: true, department: updatedDepartment });
	} catch (error) {
		console.error("Error updating department:", error);
		return NextResponse.json({ error: "Failed to update department." }, { status: 500 });
	}
}

export async function DELETE(req, { params }) {
	try {
		await connectDB();
		const { id } = params;

		const deletedDepartment = await Department.findByIdAndDelete(id);

		if (!deletedDepartment) {
			return NextResponse.json({ error: "Department not found." }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "Department deleted successfully." });
	} catch (error) {
		console.error("Error deleting department:", error);
		return NextResponse.json({ error: "Failed to delete department." }, { status: 500 });
	}
}
