import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
	// Connect to the database
	await connectDB();

	try {
		const data = await req.json();
		console.log(data);

		const { fullName, email, userName, password, role } = data;
		if (!fullName || !email || !userName || !password) {
			return NextResponse.json({ error: "All fields are required." }, { status: 400 });
		}

		const allowedRoles = ["admin"];
		const userRole = allowedRoles.includes(role) ? role : "admin";

		// Check if the email already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return NextResponse.json({ error: "Email already in use." }, { status: 400 });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create a new user
		const newUser = new User({
			fullName,
			email,
			userName,
			password: hashedPassword,
			role: userRole,
		});

		// Save the user to the database
		await newUser.save();

		return NextResponse.json({ success: true, message: "User registered successfully!" });
	} catch (error) {
		console.error("Error registering user:", error);
		return NextResponse.json({ error: "Failed to register user." }, { status: 500 });
	}
}
