import { NextResponse } from "next/server";
import { sendBirthdayWishEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const { name, email, age } = await req.json();

        if (!name || !email) {
            return NextResponse.json(
                { error: "Name and email are required" },
                { status: 400 }
            );
        }

        await sendBirthdayWishEmail({ name, email, age });

        return NextResponse.json({
            success: true,
            message: "Birthday wish email sent successfully"
        });

    } catch (error) {
        console.error("Error sending birthday wish email:", error);
        return NextResponse.json(
            { error: "Failed to send birthday wish email" },
            { status: 500 }
        );
    }
}
