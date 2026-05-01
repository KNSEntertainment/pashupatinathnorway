"use client";

import { useActiveMenu } from "@/context/ActiveMenuContext";
import { useEffect } from "react";
import UpcomingBirthdays from "@/components/UpcomingBirthdays";

export default function BirthdaysPage() {
	const { setActiveMenu } = useActiveMenu();

	useEffect(() => {
		setActiveMenu("birthdays");
	}, [setActiveMenu]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Upcoming Birthdays</h1>
				<p className="text-gray-600 mt-2">
					View and manage upcoming birthdays of approved members for the next 7 days.
				</p>
			</div>
			
			<UpcomingBirthdays />
		</div>
	);
}
