<div align="center">

# FyiCast

**Forecast clarity for modern operators.**  
Monthly and yearly financial planning built for small and medium-sized businesses.

[![MVP Status](https://img.shields.io/badge/MVP-100%25%20Complete-brightgreen)](./MVP-Month-6.md)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-black)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%2FExpress-green)](../fyicastfolder)
[![License](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)

</div>

---

## ✨ Overview

FyiCast is a complete financial forecasting platform that helps SMBs turn historical financial data into actionable insights. The platform includes:

- **📊 Forecast Wizard** - Step-by-step guided forecasting with multiple models
- **🔍 EDA Analysis** - Automated exploratory data analysis with insights
- **📈 Scenario Planning** - Base, Upside, and Downside scenarios
- **🤖 AI-Powered Insights** - Natural language queries powered by Groq AI
- **📁 Excel/CSV Import** - Import data from spreadsheets
- **🔗 Integrations** - Connect to Xero, QuickBooks Online
- **📑 Reports** - Export to Excel and PDF

---

## 🗺️ Application Map

| Area | Route | Description |
| ---- | ----- | ----------- |
| **Marketing** | `/` | Landing page with features overview |
| | `/pricing` | Pricing tiers and FAQ |
| **Authentication** | `/auth/login` | JWT-based authentication |
| | `/auth/register` | User registration with workspace creation |
| | `/auth/forgot-password` | Password reset flow |
| | `/auth/verify-email` | Email verification |
| **Workspace Shell** | `/app/*` | Authenticated workspace with sidebar navigation |
| **Dashboard** | `/app/dashboard` | KPI cards, charts, key metrics |
| **Forecast Wizard** ⭐ | `/app/forecast` | **NEW** - 6-step guided forecasting |
| **Historical Data** | `/app/data` | CSV/Excel import, data management |
| **Assumptions** | `/app/assumptions` | Driver-based assumptions |
| **Scenario Planning** | `/app/scenarios` | Create and compare scenarios |
| **Reports & Exports** | `/app/reports` | Excel/PDF export, templates |
| **Integrations** | `/app/integrations` | Xero, QuickBooks OAuth |
| **Workspace Settings** | `/app/settings` | Team management, security |

---

## 🧩 Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS v4
- **State Management:** Redux Toolkit + RTK Query
- **Charts:** Recharts
- **Fonts:** Geist Sans & Geist Mono

### Backend (fyicastfolder)
- **Runtime:** Node.js + Express
- **Database:** PostgreSQL
- **Auth:** JWT with HTTP-only cookies
- **AI:** Groq AI (free) / OpenAI / Anthropic
- **Integrations:** Xero, QuickBooks Online OAuth2
- **Caching:** Redis (optional)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Backend running on port 5100 (see [fyicastfolder README](../fyicastfolder/README.md))

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   # Create .env.local
   NEXT_PUBLIC_API_URL=http://localhost:5100/api/v1
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:3000

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Project Structure

```
fyicast/
├── app/
│   ├── (platform)/app/    # Authenticated workspace
│   │   ├── dashboard/     # Dashboard page
│   │   ├── forecast/      # Forecast Wizard
│   │   ├── data/          # Data management
│   │   ├── scenarios/     # Scenario planning
│   │   ├── reports/       # Export & reports
│   │   └── settings/      # Workspace settings
│   ├── auth/              # Authentication pages
│   ├── legal/             # Terms & Privacy
│   ├── pricing/           # Pricing page
│   ├── error.tsx          # Error boundary
│   ├── not-found.tsx      # 404 page
│   └── loading.tsx        # Loading state
├── components/
│   ├── forecast/          # Forecast Wizard steps
│   ├── ErrorBoundary.tsx  # Error boundary component
│   └── ...
├── lib/
│   ├── store/             # Redux store & API
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript definitions
└── public/
    └── robots.txt         # SEO
```

---

## 🔐 Security Features

- **HTTP-Only Cookies** - JWT tokens stored securely
- **CSRF Protection** - Via SameSite cookie policy
- **Security Headers** - X-Frame-Options, CSP, etc.
- **Input Validation** - RTK Query handles API errors gracefully
- **Error Boundaries** - Graceful error handling

---

## 🧪 Testing (Planned)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Lint
npm run lint
```

---

## 📊 MVP Status - 100% Complete

| Month | Features | Status |
|-------|----------|--------|
| Month 1 | Core platform, auth, workspace | ✅ 100% |
| Month 2 | Data import, basic forecasting, scenarios | ✅ 100% |
| Month 3 | PDF reports, integrations, COA mapping | ✅ 100% |
| Month 4 | Formula engine, comments, invitations | ✅ 100% |
| Month 5 | AI insights (Groq), variance analysis, EDA | ✅ 100% |
| Month 6 | Audit logs, groups, API keys, SSO, caching | ✅ 100% |

---

## 🚢 Production Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://api.fyicast.com/api/v1
NEXT_PUBLIC_SITE_URL=https://fyicast.com
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with clear messages
4. Submit a PR with description and screenshots

---

## 📄 License

Distributed under the MIT License.

---

<div align="center">

**Built with ❤️ for finance teams who deserve better than spreadsheets**

[Website](https://fyicast.com) · [Documentation](https://docs.fyicast.com) · [Support](mailto:support@fyicast.com)

</div>
