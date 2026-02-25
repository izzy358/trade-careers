import { buildMetadata } from '@/utils/seo';

export const metadata = buildMetadata({
  title: 'Terms of Service | Trade Careers Automotive Restyling Platform',
  description:
    'Read the Trade Careers Terms of Service covering account use, prohibited conduct, intellectual property, liability limits, and governing law.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-surface p-8 md:p-10">
      <h1 className="mb-2 text-4xl font-bold">Terms of Service</h1>
      <p className="mb-8 text-text-secondary">
        Effective date: February 25, 2026. These Terms govern your use of Trade Careers.
      </p>

      <div className="space-y-6 text-text-secondary">
        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Trade Careers, you agree to these Terms and our Privacy Policy. If
            you do not agree, do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">2. User Accounts</h2>
          <p>
            You are responsible for the accuracy of your account, profile, and job posting
            information. You are also responsible for maintaining the confidentiality of your account
            credentials and management links.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">3. Prohibited Conduct</h2>
          <p>
            You may not post false or misleading content, infringe on others&apos; rights, upload
            malicious code, scrape or abuse platform data, or use the service for unlawful conduct.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">4. Intellectual Property</h2>
          <p>
            Trade Careers and its branding, code, and platform content are owned by Trade Careers or its
            licensors. You retain ownership of content you submit, but grant us a license to host,
            display, and process it to operate the service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">5. Limitation of Liability</h2>
          <p>
            Trade Careers is provided on an &quot;as is&quot; basis. To the fullest extent permitted by
            law, Trade Careers is not liable for indirect, incidental, special, or consequential
            damages, including hiring outcomes or lost profits.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">6. Termination</h2>
          <p>
            We may suspend or terminate access if you violate these Terms, create security risk, or
            misuse the platform.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">7. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of California, without regard to
            conflict-of-law rules.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">8. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Material updates will be posted on this
            page with a revised effective date.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">9. Contact</h2>
          <p>
            For questions about these Terms, contact
            {' '}
            <a className="text-primary hover:underline" href="mailto:support@tradecareers.com">
              support@tradecareers.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
