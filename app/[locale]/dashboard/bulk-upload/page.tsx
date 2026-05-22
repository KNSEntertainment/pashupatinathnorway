import BulkMembershipUpload from '@/components/BulkMembershipUpload';
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

export default function BulkUploadPage() {
  return (
    <DashboardPageLayout
      title="Bulk Membership Management"
      description="Upload multiple membership applications at once"
      icon="Upload"
    >
      <BulkMembershipUpload />
    </DashboardPageLayout>
  );
}
