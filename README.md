# Rovierr

Rovierr is a modular platform designed for university students, providing essential tools and services in one ecosystem.
Our infrastructure is built for scalability, cost efficiency, and real-time performance.

---

## 🚀 Infrastructure Overview

- **Realtime Engine**: [Centrifugal](https://centrifugal.dev/)
- **Infrastructure as  Code (IaC)**: [OpenTofu](https://opentofu.org/)
- **Backend API**: [Cloudflare](https://www.cloudflare.com/en-gb/)
- **Frontend Hosting**: Vercel
- **Microservices**: Hosted on [Fly.io](https://fly.io/) for cost advantages and scale-to-zero when idle
  _Planned migration to AWS when traffic increases._

---

## 📜 License

This project is licensed under the **Creative Commons Attribution–NonCommercial–NoDerivatives 4.0 International License (CC BY-NC-ND 4.0)**.

This means:

- **Attribution required** (credit the project).
- **No commercial use** without explicit permission.
- **No modifications or derivatives** may be distributed.

Full license text: [LICENSE](LICENSE)

---

## 🤝 Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for:

- How to submit changes
- Our branch workflow
- License acknowledgement requirements

All contributors must explicitly agree that their submissions are licensed under **CC BY-NC-ND 4.0** with no additional restrictions.

---

## 🌿 Git Branching Guide

- **main** → Production (rovierr.com)
- **stage** → Staging environment (qa.rovierr.com)
- **dev** → Integration branch for all feature pull requests
- **feature_xyz** → Feature branches (e.g., `rejoanahmed8/rov-74-admin-capability-to-update-uni-info-crud`)

---

## 📦 Deployment Flow

1. **Local Development**: Fully containerized with Docker Compose (as much as possible).
2. **dev.rovierr.com**: Development testing before staging.
3. **Stage Promotion**: Weekly promotion from `dev` → `stage` (qa.rovierr.com).
4. **Production Release**: Weekly promotion from `stage` → `main` after one week of QA.

---

## Dependency management with syncpack
to update dependecies at first run check and confirm and then update
```shell
pnpm exec syncpack update --check --dependencies '**better-auth**'
pnpm exec syncpack update --dependencies '**better-auth**'
```

## 📚 Documentation

Full documentation is available at: [docs.rovierr.com](https://docs.rovierr.com) _(coming soon)_

---

## 📌 Open Source Policy

- **License**: CC BY-NC-ND 4.0
- **Code of Conduct**: See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **Contribution Process**: See [CONTRIBUTING.md](CONTRIBUTING.md)
