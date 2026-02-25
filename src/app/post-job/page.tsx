import type { Metadata } from 'next';
import { PostJobForm } from '@/components/PostJobForm';

export const metadata: Metadata = {
  title: 'Post a Job',
  description: 'Post automotive trade jobs for wrap, tint, PPF, detailing, and coating installers.',
};

export default function PostJobPage() {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-[#0d1117] p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Post a Job</h1>
        <p className="text-text-secondary">
          Publish your opening to skilled wrap, tint, PPF, coating, and detailing professionals.
        </p>
      </div>

      <PostJobForm />
    </div>
  );
}
