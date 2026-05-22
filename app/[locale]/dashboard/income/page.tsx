"use client";

import IncomeManagement from "@/components/admin/IncomeManagement";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

export default function IncomePage() {
  return (
    <DashboardPageLayout
      title="Income Management"
      description="Track and manage all income sources and transactions"
      icon="TrendingUp"
    >
      <IncomeManagement />
    </DashboardPageLayout>
  );
}
