"use client";

import { useActiveMenu } from "@/context/ActiveMenuContext";
import { useEffect } from "react";
import UpcomingBirthdays from "@/components/UpcomingBirthdays";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

export default function BirthdaysPage() {
	const { setActiveMenu } = useActiveMenu();

	useEffect(() => {
		setActiveMenu("birthdays");
	}, [setActiveMenu]);

	return (
		<DashboardPageLayout
			title="Upcoming Birthdays"
			description="View and manage upcoming birthdays of approved members for the next 30 days"
			icon="Gift"
		>
			<UpcomingBirthdays />
		</DashboardPageLayout>
	);
}
