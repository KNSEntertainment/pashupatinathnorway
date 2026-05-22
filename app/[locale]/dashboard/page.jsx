"use client";
import { useSession } from "next-auth/react";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

export default function DashboardPage() {
	const { data: session } = useSession();

	// Only show analytics to admin users
	if (!session || session.user.role !== "admin") {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
					<p className="text-gray-600">This dashboard is only available to administrators.</p>
				</div>
			</div>
		);
	}

	return (
		<DashboardPageLayout
			title="Analytics Dashboard"
			description="Comprehensive overview of your organization's performance and metrics"
			icon="Activity"
		>
			<AnalyticsDashboard />
		</DashboardPageLayout>
	);
}
