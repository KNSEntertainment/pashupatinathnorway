"use client";

import GlobalFinancialDashboard from "@/components/admin/GlobalFinancialDashboard";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

export default function FinancialDashboardPage() {
  return (
    <DashboardPageLayout
      title="Financial Dashboard"
      description="Overview of financial metrics and performance"
      icon="DollarSign"
    >
      <GlobalFinancialDashboard />
    </DashboardPageLayout>
  );
}
