"use client";

import BudgetManagement from "@/components/admin/BudgetManagement";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

export default function BudgetPage() {
  return (
    <DashboardPageLayout
      title="Budget Management"
      description="Manage and track budget allocations and expenses"
      icon="PiggyBank"
    >
      <BudgetManagement />
    </DashboardPageLayout>
  );
}
