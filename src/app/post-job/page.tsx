import { PostJobForm } from '@/components/PostJobForm';
import { buildMetadata } from '@/utils/seo';

export const metadata = buildMetadata({
  title: 'Post Automotive Restyling Jobs | Hire Installers Fast | WrapCareers',
  description:
    'Post automotive restyling job openings for vinyl wrap, tint, PPF, ceramic coating, and detailing professionals.',
  path: '/post-job',
});

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
