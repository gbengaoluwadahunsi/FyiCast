import Link from "next/link";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="max-w-2xl text-sm text-slate-300">
            We respect the confidentiality of financial information. This policy
            explains how FyiCast collects, uses, and protects your data. Tailor
            this draft with legal counsel for production deployment.
          </p>
        </header>

        <section className="grid gap-8">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              1. Information We Collect
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              We collect account details (name, email), workspace metadata
              (company, currency), and financial data you upload or integrate.
              Usage analytics (device, pages viewed) help improve the product,
              but are anonymized in aggregate.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              2. How We Use Data
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Data powers forecasting features, scenario analysis, and reporting.
              We also use contact information to send product updates, security
              notices, and billing communications. We never sell personal or
              financial data.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              3. Data Sharing
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Trusted processors (cloud hosting, analytics, email providers)
              assist us in delivering FyiCast. They are bound by confidentiality
              agreements and only access data necessary to perform their
              services.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              4. Security
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              We implement encryption in transit, role-based access, and audit
              logs. Despite best efforts, no tool is immune to risk. Notify us
              immediately if you suspect unauthorized access or vulnerabilities.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              5. Data Retention
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Financial records remain available while your subscription is
              active. After cancellation, we retain data for a limited period to
              support exports or legal compliance, then delete it safely.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              6. Your Rights
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Depending on your jurisdiction, you may request access, correction,
              or deletion of personal data. Contact our support team to exercise
              these rights. We will respond within a reasonable timeframe.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              7. Cookies & Tracking
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              FyiCast uses essential cookies for session management and optional
              analytics cookies to improve usability. You can control cookies
              through your browser settings.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              8. International Transfers
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Data may be processed in jurisdictions where our providers operate.
              We rely on contractual safeguards (such as Standard Contractual
              Clauses) to ensure appropriate protection.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              9. Updates to this Policy
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              We may amend this policy as FyiCast evolves or legal requirements
              change. Significant updates will be announced via email or in-app
              notifications.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">10. Contact</h2>
            <p className="mt-3 text-sm text-slate-300">
              Have privacy questions? Email{" "}
              <a
                href="mailto:privacy@fyicast.com"
                className="font-semibold text-cyan-200 hover:text-cyan-100"
              >
                privacy@fyicast.com
              </a>{" "}
              or reach out through the workspace support portal.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}





