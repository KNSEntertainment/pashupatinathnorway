"use client";

import EventFinancialDashboard from "@/components/admin/EventFinancialDashboard";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

export default function EventFinancialDashboardPage() {
  return (
    <DashboardPageLayout
      title="Event Financials"
      description="Financial overview and reporting for events"
      icon="Target"
    >
      <EventFinancialDashboard />
    </DashboardPageLayout>
  );
}
