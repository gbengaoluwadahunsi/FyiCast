import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-[min(1240px,calc(100%-var(--page-inline-gap)))] flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          ← Back to the homepage
        </Link>
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Legal
          </p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Terms of Service
          </h1>
          <p className="max-w-2xl text-sm text-slate-300">
            These Terms govern your use of FyiCast. By creating an account or
            using the product, you agree to the conditions below. This document
            is an outline—update it with input from legal counsel before
            production use.
          </p>
        </header>

        <section className="grid gap-8">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              1. Account & Workspace
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              You must provide accurate information when creating a workspace.
              You are responsible for maintaining the confidentiality of your
              credentials and safeguarding financial data shared within the
              platform. If you suspect unauthorized access, notify us
              immediately.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              2. Acceptable Use
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              You agree not to misuse FyiCast, attempt to breach security, or
              access data belonging to other customers. Automated scraping,
              reverse engineering, and reselling the service without written
              consent is prohibited.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              3. Forecasts & Assumptions
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Forecast models rely on the data and assumptions you provide. We
              do not guarantee the accuracy of projections or business outcomes.
              Use FyiCast as decision support alongside professional financial
              advice.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              4. Data Ownership & Access
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              You retain ownership of the financial information uploaded to your
              workspace. We may access aggregated usage analytics to improve the
              product, but we will never sell customer data to third parties.
              Integrations you connect are governed by their own terms.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              5. Payment & Plans
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Paid subscriptions renew automatically unless cancelled. Fees are
              non-refundable except where required by law. If payment fails after
              repeated attempts, we may suspend access until the balance is
              settled.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              6. Service Availability
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              We strive for high availability, but planned maintenance or
              unforeseen outages may occur. We are not liable for losses caused
              by downtime, though we will communicate promptly and work to
              restore service.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              7. Termination
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              You may cancel at any time. We reserve the right to suspend or
              terminate accounts that violate these Terms. Upon termination, we
              will provide a reasonable opportunity to export your data.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              8. Changes to These Terms
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              We may update these Terms periodically. Material changes will be
              communicated via email or in-app notification. Continued use of
              FyiCast after changes take effect constitutes acceptance.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              9. Contact
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Questions? Reach out to{" "}
              <a
                href="mailto:legal@fyicast.com"
                className="font-semibold text-cyan-200 hover:text-cyan-100"
              >
                legal@fyicast.com
              </a>
              . Always consult with your legal team before adopting these terms.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}





