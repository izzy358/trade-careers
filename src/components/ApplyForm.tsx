'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const applySchema = z.object({
  applicant_name: z.string().min(2, "Name is required"),
  applicant_email: z.string().email("Invalid email address"),
  phone: z.string().optional(), // TODO: Add US phone format validation
  message: z.string().min(50, "Message must be at least 50 characters").max(2000, "Message cannot exceed 2000 characters"),
  portfolio_link: z.string().url("Invalid URL").optional().or(z.literal('')), // Allow empty string for optional URL
  resume: z.any() // File object, handle validation separately
});

type ApplyFormInputs = z.infer<typeof applySchema>;

export function ApplyForm({ jobSlug }: { jobSlug: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ApplyFormInputs>({
    resolver: zodResolver(applySchema),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Resume must be a PDF.");
        event.target.value = ''; // Clear the input
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("Resume file size cannot exceed 5MB.");
        event.target.value = ''; // Clear the input
        return;
      }
    }
  };

  const onSubmit = async (data: ApplyFormInputs) => {
    setIsSubmitting(true);
    let resume_url = '';

    if (data.resume && data.resume[0]) {
      const resumeFile = data.resume[0];
      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('folder', 'resumes');

      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || 'Failed to upload resume');
        }
        const uploadResult = await uploadRes.json();
        resume_url = uploadResult.url;
      } catch (uploadError: any) {
        toast.error(`Resume upload failed: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const applicationRes = await fetch(`/api/jobs/${jobSlug}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicant_name: data.applicant_name,
          applicant_email: data.applicant_email,
          message: data.message,
          phone: data.phone,
          portfolio_link: data.portfolio_link,
          resume_url,
        }),
      });

      if (!applicationRes.ok) {
        const errorData = await applicationRes.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      toast.success("Application sent successfully!");
      setIsSubmitted(true);
      reset(); // Optionally reset the form
    } catch (apiError: any) {
      toast.error(`Application submission failed: ${apiError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center p-8 bg-surface rounded-xl border border-success text-success">
        <h3 className="text-2xl font-semibold mb-2">✅ Application Sent!</h3>
        <p className="text-text-secondary">Your application has been successfully sent. The company will reach out if interested.</p>
        <Link href="/jobs" className="mt-4 inline-block px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">
          Browse More Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface p-8 rounded-xl border border-border">
      <h2 className="text-2xl font-bold mb-6">Apply for this position</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="applicant_name" className="block text-sm font-medium text-text-secondary mb-2">Your Name *</label>
          <input
            type="text"
            id="applicant_name"
            {...register('applicant_name')}
            className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.applicant_name && <p className="text-error text-sm mt-1">{errors.applicant_name.message as string}</p>}
        </div>

        <div>
          <label htmlFor="applicant_email" className="block text-sm font-medium text-text-secondary mb-2">Your Email *</label>
          <input
            type="email"
            id="applicant_email"
            {...register('applicant_email')}
            className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.applicant_email && <p className="text-error text-sm mt-1">{errors.applicant_email.message as string}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-2">Phone (optional)</label>
          <input
            type="tel"
            id="phone"
            {...register('phone')}
            className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.phone && <p className="text-error text-sm mt-1">{errors.phone.message as string}</p>}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-2">Message *</label>
          <textarea
            id="message"
            rows={5}
            {...register('message')}
            placeholder="Tell them why you're a great fit..."
            className="w-full p-3 rounded-lg bg-border border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          ></textarea>
          {errors.message && <p className="text-error text-sm mt-1">{errors.message.message as string}</p>}
        </div>

        <div>
          <label htmlFor="portfolio_link" className="block text-sm font-medium text-text-secondary mb-2">Portfolio Link (Instagram, website, or Google Drive)</label>
          <input
            type="url"
            id="portfolio_link"
            {...register('portfolio_link')}
            className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.portfolio_link && <p className="text-error text-sm mt-1">{errors.portfolio_link.message as string}</p>}
        </div>

        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-text-secondary mb-2">Resume (optional - PDF only, max 5MB)</label>
          <input
            type="file"
            id="resume"
            accept=".pdf"
            {...register('resume')}
            onChange={handleFileChange}
            className="w-full text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-orange-700"
          />
          {errors.resume && <p className="text-error text-sm mt-1">{errors.resume.message as string}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>

      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
    </div>
  );
}
