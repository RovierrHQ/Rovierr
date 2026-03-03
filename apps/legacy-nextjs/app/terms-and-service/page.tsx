import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service · Rovierr',
  description: 'The terms that govern your use of Rovierr.'
}

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <h1 className="font-bold text-3xl">Terms of Service</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>
      </header>

      <nav aria-label="Table of contents" className="mb-10">
        <ul className="list-inside list-disc space-y-1 text-sm">
          <li>
            <a
              className="underline-offset-4 hover:underline"
              href="#acceptance"
            >
              Acceptance of terms
            </a>
          </li>
          <li>
            <a className="underline-offset-4 hover:underline" href="#accounts">
              Accounts & security
            </a>
          </li>
          <li>
            <a
              className="underline-offset-4 hover:underline"
              href="#acceptable-use"
            >
              Acceptable use
            </a>
          </li>
          <li>
            <a
              className="underline-offset-4 hover:underline"
              href="#intellectual-property"
            >
              Intellectual property
            </a>
          </li>
          <li>
            <a className="underline-offset-4 hover:underline" href="#payments">
              Payments & subscriptions
            </a>
          </li>
          <li>
            <a
              className="underline-offset-4 hover:underline"
              href="#termination"
            >
              Termination
            </a>
          </li>
          <li>
            <a
              className="underline-offset-4 hover:underline"
              href="#disclaimers"
            >
              Disclaimers
            </a>
          </li>
          <li>
            <a
              className="underline-offset-4 hover:underline"
              href="#limitation"
            >
              Limitation of liability
            </a>
          </li>
          <li>
            <a className="underline-offset-4 hover:underline" href="#indemnity">
              Indemnification
            </a>
          </li>
          <li>
            <a
              className="underline-offset-4 hover:underline"
              href="#governing-law"
            >
              Governing law
            </a>
          </li>
          <li>
            <a className="underline-offset-4 hover:underline" href="#changes">
              Changes to terms
            </a>
          </li>
          <li>
            <a className="underline-offset-4 hover:underline" href="#contact">
              Contact
            </a>
          </li>
        </ul>
      </nav>

      <section className="space-y-3" id="acceptance">
        <h2 className="font-semibold text-xl">Acceptance of terms</h2>
        <p>
          By accessing or using Rovierr, you agree to be bound by these Terms of
          Service and our Privacy Policy. If you do not agree, do not use the
          service.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="accounts">
        <h2 className="font-semibold text-xl">Accounts & security</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Provide accurate account information and keep it up to date</li>
          <li>You are responsible for maintaining account security</li>
          <li>Notify us of any unauthorized access</li>
        </ul>
      </section>

      <section className="space-y-3 pt-8" id="acceptable-use">
        <h2 className="font-semibold text-xl">Acceptable use</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>No illegal, harmful, or abusive activity</li>
          <li>No attempts to disrupt or compromise our infrastructure</li>
          <li>Respect intellectual property and privacy rights</li>
        </ul>
      </section>

      <section className="space-y-3 pt-8" id="intellectual-property">
        <h2 className="font-semibold text-xl">Intellectual property</h2>
        <p>
          The service and its original content, features, and functionality are
          owned by Rovierr and protected by applicable laws. You retain rights
          to content you upload, subject to licenses necessary for operation of
          the service.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="payments">
        <h2 className="font-semibold text-xl">Payments & subscriptions</h2>
        <p>
          Paid features may be offered on a subscription basis. Billing
          intervals, pricing, and cancellation terms will be disclosed during
          checkout or within your account settings.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="termination">
        <h2 className="font-semibold text-xl">Termination</h2>
        <p>
          We may suspend or terminate access for violations of these Terms or to
          protect the service and its users. You may stop using the service at
          any time.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="disclaimers">
        <h2 className="font-semibold text-xl">Disclaimers</h2>
        <p>
          The service is provided “as is” without warranties of any kind, to the
          fullest extent permitted by law.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="limitation">
        <h2 className="font-semibold text-xl">Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Rovierr will not be liable for
          indirect, incidental, special, consequential, or punitive damages, or
          any loss of profits or revenues.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="indemnity">
        <h2 className="font-semibold text-xl">Indemnification</h2>
        <p>
          You agree to indemnify and hold Rovierr harmless from claims arising
          out of your use of the service or violation of these Terms.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="governing-law">
        <h2 className="font-semibold text-xl">Governing law</h2>
        <p>
          These Terms are governed by the laws of your local jurisdiction unless
          otherwise required by applicable law.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="changes">
        <h2 className="font-semibold text-xl">Changes to terms</h2>
        <p>
          We may update these Terms from time to time. We will revise the “Last
          updated” date and, when appropriate, provide additional notice.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="contact">
        <h2 className="font-semibold text-xl">Contact</h2>
        <p>
          Questions? Contact us at{' '}
          <span className="font-medium">support@rovierr.com</span>.
        </p>
      </section>
    </main>
  )
}
