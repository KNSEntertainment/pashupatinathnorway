"use client";

import UpcomingBirthdays from "@/components/UpcomingBirthdays";

export default function TestBirthdaysPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Test Birthdays Component</h1>
			<p className="text-gray-600 mb-8">
				This is a test page to verify the UpcomingBirthdays component works without authentication.
			</p>
			
			<UpcomingBirthdays />
		</div>
	);
}
