import ReportTypesManagement from "@/components/dashboard/ReportTypesManagement";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

export default function ReportTypesPage() {
  return (
    <DashboardPageLayout
      title="Report Types Management"
      description="Configure and manage report types and categories"
      icon="Settings"
    >
      <ReportTypesManagement />
    </DashboardPageLayout>
  );
}
