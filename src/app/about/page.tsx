import { buildMetadata } from '@/utils/seo';

export const metadata = buildMetadata({
  title: 'About Trade Careers | Automotive Restyling Job Board & Installer Directory',
  description:
    'Learn how Trade Careers connects PPF, vinyl wrap, tint, ceramic coating, paint correction, and detailing professionals with hiring shops.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="rounded-2xl border border-border bg-surface p-8 md:p-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">About</p>
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Built for the Automotive Restyling Industry</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          Trade Careers is a job board and installer directory built specifically for the automotive
          restyling industry: PPF, vinyl wrap, window tint, ceramic coating, paint correction, and
          detailing.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
            M
          </div>
          <h2 className="mb-2 text-2xl font-semibold">Mission</h2>
          <p className="text-text-secondary">
            Connect skilled installers with shops that need them, and help shops find top talent fast.
          </p>
        </article>

        <article className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
            F
          </div>
          <h2 className="mb-2 text-2xl font-semibold">Founding Story</h2>
          <p className="text-text-secondary">
            Trade Careers was founded by professionals in the automotive restyling space who saw a
            clear gap: there was no dedicated hiring platform built for this industry.
          </p>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
            I
          </div>
          <h2 className="mb-2 text-2xl font-semibold">For Installers</h2>
          <ul className="space-y-2 text-text-secondary">
            <li>Find jobs in your trade and location.</li>
            <li>Build your profile and showcase your work.</li>
            <li>Get discovered by growing shops and established brands.</li>
          </ul>
        </article>

        <article className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
            S
          </div>
          <h2 className="mb-2 text-2xl font-semibold">For Shops</h2>
          <ul className="space-y-2 text-text-secondary">
            <li>Post jobs targeted to automotive restyling specialists.</li>
            <li>Browse installer profiles by specialty and location.</li>
            <li>Hire faster with a platform focused on your exact talent needs.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
