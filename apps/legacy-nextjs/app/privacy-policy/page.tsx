import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy · Rovierr',
  description:
    'Learn how Rovierr collects, uses, and protects your personal information.'
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <h1 className="font-bold text-3xl">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>
      </header>

      <nav aria-label="Table of contents" className="mb-10">
        <ul className="list-inside list-disc space-y-1 text-sm">
          <li>
            <a className="underline-offset-4 hover:underline" href="#overview">
              Overview
            </a>
          </li>
          <li>
            <a
              className="underline-offset-4 hover:underline"
              href="#data-we-collect"
            >
              Data we collect
            </a>
          </li>
          <li>
            <a
              className="underline-offset-4 hover:underline"
              href="#how-we-use-data"
            >
              How we use data
            </a>
          </li>
          <li>
            <a
              className="underline-offset-4 hover:underline"
              href="#legal-bases"
            >
              Legal bases (GDPR)
            </a>
          </li>
          <li>
            <a className="underline-offset-4 hover:underline" href="#retention">
              Data retention
            </a>
          </li>
          <li>
            <a className="underline-offset-4 hover:underline" href="#security">
              Security
            </a>
          </li>
          <li>
            <a className="underline-offset-4 hover:underline" href="#transfers">
              International transfers
            </a>
          </li>
          <li>
            <a
              className="underline-offset-4 hover:underline"
              href="#your-rights"
            >
              Your rights
            </a>
          </li>
          <li>
            <a className="underline-offset-4 hover:underline" href="#children">
              Children’s privacy
            </a>
          </li>
          <li>
            <a className="underline-offset-4 hover:underline" href="#changes">
              Changes to this policy
            </a>
          </li>
          <li>
            <a className="underline-offset-4 hover:underline" href="#contact">
              Contact
            </a>
          </li>
        </ul>
      </nav>

      <section className="space-y-4" id="overview">
        <h2 className="font-semibold text-xl">Overview</h2>
        <p>
          Rovierr ("we", "us") is committed to protecting your privacy. This
          Privacy Policy explains what information we collect, how we use it,
          and the choices you have.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="data-we-collect">
        <h2 className="font-semibold text-xl">Data we collect</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <span className="font-medium">Account data</span>: name, email,
            authentication identifiers.
          </li>
          <li>
            <span className="font-medium">Usage data</span>: app interactions,
            device information, approximate location, and diagnostics.
          </li>
          <li>
            <span className="font-medium">Content</span>: data you submit or
            upload when using the service.
          </li>
          <li>
            <span className="font-medium">Cookies</span>: small files used to
            keep you signed in and remember preferences.
          </li>
        </ul>
      </section>

      <section className="space-y-3 pt-8" id="how-we-use-data">
        <h2 className="font-semibold text-xl">How we use data</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Provide, maintain, and improve the service</li>
          <li>Secure accounts, prevent abuse, and troubleshoot issues</li>
          <li>
            Communicate updates, security alerts, and administrative messages
          </li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section className="space-y-3 pt-8" id="legal-bases">
        <h2 className="font-semibold text-xl">Legal bases (GDPR)</h2>
        <p>
          We process personal data under these bases: performance of a contract,
          legitimate interests, compliance with legal obligations, and consent
          where required.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="retention">
        <h2 className="font-semibold text-xl">Data retention</h2>
        <p>
          We retain data only as long as needed for the purposes described or as
          required by law. We may anonymize or aggregate data for analytics.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="security">
        <h2 className="font-semibold text-xl">Security</h2>
        <p>
          We use appropriate technical and organizational measures to protect
          your information. No method of transmission is 100% secure.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="transfers">
        <h2 className="font-semibold text-xl">International transfers</h2>
        <p>
          Your information may be processed outside your country. Where
          required, we use appropriate safeguards such as standard contractual
          clauses.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="your-rights">
        <h2 className="font-semibold text-xl">Your rights</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Access, correct, or delete your data</li>
          <li>Object to or restrict certain processing</li>
          <li>Data portability</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
      </section>

      <section className="space-y-3 pt-8" id="children">
        <h2 className="font-semibold text-xl">Children’s privacy</h2>
        <p>
          Our services are not directed to children under 13 (or other age as
          required by local law). We do not knowingly collect such data.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="changes">
        <h2 className="font-semibold text-xl">Changes to this policy</h2>
        <p>
          We may update this policy from time to time. We will revise the “Last
          updated” date and, when appropriate, provide additional notice.
        </p>
      </section>

      <section className="space-y-3 pt-8" id="contact">
        <h2 className="font-semibold text-xl">Contact</h2>
        <p>
          Questions or requests? Contact us at{' '}
          <span className="font-medium">support@rovierr.com</span>.
        </p>
      </section>
    </main>
  )
}
