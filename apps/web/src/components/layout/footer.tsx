import { Link } from '@tanstack/react-router'
import Logo from '@web/components/icons/logo'
import { Github, Linkedin, Twitter } from 'lucide-react'

type FooterProps = {
  className?: string
}

const footerLinks = {
  product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Roadmap', href: '/roadmap' }
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' }
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'License', href: '/license' }
  ],
  social: [
    {
      label: 'Twitter',
      href: 'https://twitter.com/rovierr',
      icon: Twitter
    },
    {
      label: 'GitHub',
      href: 'https://github.com/rovierr',
      icon: Github
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/company/rovierr',
      icon: Linkedin
    }
  ]
}

export default function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={`border-neutral-200 border-t bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link className="flex items-center gap-2 font-bold" to="/">
              <div className="flex size-6 items-center justify-center rounded-md border bg-sidebar-primary text-white">
                <Logo />
              </div>
              <span className="text-lg">Rovierr</span>
            </Link>
            <p className="text-neutral-600 text-sm dark:text-neutral-400">
              Global Student Ecosystem. Unifying essential tools for students
              worldwide.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-neutral-900 text-sm dark:text-neutral-100">
              Product
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-neutral-600 text-sm transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    to={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-neutral-900 text-sm dark:text-neutral-100">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-neutral-600 text-sm transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    to={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-neutral-900 text-sm dark:text-neutral-100">
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-neutral-600 text-sm transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    to={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-neutral-200 border-t pt-8 md:flex-row dark:border-neutral-800">
          <p className="text-neutral-600 text-sm dark:text-neutral-400">
            © {currentYear} Rovierr. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {footerLinks.social.map((social) => {
              const Icon = social.icon
              return (
                <Link
                  aria-label={social.label}
                  className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  key={social.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  to={social.href}
                >
                  <Icon className="size-5" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
