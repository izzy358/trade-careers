import { PostJobWizard } from '@/components/PostJobWizard';

export default function PostJobPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Post a Job</h1>
        <p className="text-text-secondary">
          Create a listing in three steps: add role details, set contact info, then review and publish.
        </p>
      </div>

      <PostJobWizard />
    </div>
  );
}
