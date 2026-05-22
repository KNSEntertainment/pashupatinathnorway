import GenerateTaxDocument from "@/components/GenerateTaxDocument";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";

export default function TaxDocumentPage() {
    return (
        <DashboardPageLayout
            title="Tax Document"
            description="Generate and manage tax documents"
            icon="FileText"
        >
            <GenerateTaxDocument />
        </DashboardPageLayout>
    );
}