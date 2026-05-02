import BulkMembershipUpload from '@/components/BulkMembershipUpload';

export default function BulkUploadPage() {
  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bulk Membership Management</h1>
        <p className="text-gray-600 mt-2">Upload multiple membership applications at once</p>
      </div>
      <BulkMembershipUpload />
    </div>
  );
}
