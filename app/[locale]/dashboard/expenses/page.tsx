"use client";

import ExpenseManagement from "@/components/admin/ExpenseManagement";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

export default function ExpensesPage() {
  return (
    <DashboardPageLayout
      title="Expense Management"
      description="Manage and track all expenses and expenditures"
      icon="TrendingDown"
    >
      <ExpenseManagement />
    </DashboardPageLayout>
  );
}
