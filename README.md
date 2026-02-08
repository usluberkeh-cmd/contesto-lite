# 🚗 Radar Contest - Traffic Fine Contestation Platform

A modern Progressive Web Application (PWA) for contesting traffic fines in France. Built with Next.js, React, TypeScript, and Supabase.

---

## 📋 Project Overview

**Radar Contest** helps citizens easily submit and contest traffic fines by:
- Providing a simple fine submission interface (upload or scan)
- Automating the analysis with AI (coming in Phase 2)
- Generating automatic contestation letters (Phase 2)
- Streamlining workflow for lawyers handling contestations

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui (Radix UI)
- **Forms:** react-hook-form + Zod
- **Icons:** Lucide React

### Backend & Infrastructure
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel
- **Email:** SendGrid / Mailgun
- **OCR:** Google Vision API (Phase 2)
- **AI:** OpenAI GPT-4 / Fine-tuned LLM (Phase 2)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works for development)
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd radar-contest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Email Service (SendGrid/Mailgun)
   EMAIL_API_KEY=your_email_service_api_key
   EMAIL_FROM=noreply@radarcontest.com
   
   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # (Phase 2) OCR
   GOOGLE_VISION_API_KEY=your_google_vision_key
   
   # (Phase 2) AI
   OPENAI_API_KEY=your_openai_key
   ```

4. **Set up Supabase database**
   
   Run the SQL scripts in `supabase/migrations/` (to be created) or use the Supabase dashboard to create tables.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
radar-contest/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes (login, signup)
│   ├── (dashboard)/         # Protected user dashboard routes
│   ├── (public)/            # Public pages (about, blog, contact)
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/              # React components
│   ├── ui/                  # shadcn/ui base components
│   ├── forms/               # Form components
│   ├── layout/              # Layout components (Header, Footer)
│   └── shared/              # Shared/reusable components
├── lib/                     # Utility functions and configurations
│   ├── supabase/            # Supabase client and helpers
│   ├── utils.ts             # General utilities
│   └── validations/         # Zod validation schemas
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
├── public/                  # Static assets (images, icons)
├── PLANNING.md              # Detailed project architecture and planning
├── TASK.md                  # Task tracking and roadmap
└── README.md                # This file
```

---

## 📖 Documentation

- **[PLANNING.md](./PLANNING.md)** - Complete project architecture, database schema, coding standards, and technical decisions
- **[TASK.md](./TASK.md)** - Detailed task breakdown and progress tracking for all phases

---

## 🗺️ Roadmap

### ✅ Phase 0: Initial Setup (Current)
- [x] Initialize Next.js project
- [x] Install and configure Tailwind CSS
- [x] Set up shadcn/ui components
- [x] Create project documentation (PLANNING.md, TASK.md)
- [ ] Set up Supabase project
- [ ] Configure deployment on Vercel

### 🟡 Phase 1: MVP (22 weeks)

#### Étape 1 - Setup (4 weeks)
- Set up Supabase (database, auth, storage)
- Configure hosting and domain
- Create "Coming Soon" page for SEO

#### Étape 2 - Homepage & Presentation (4 weeks)
- Build professional landing page
- Add "About Us" and service explanation
- Create blog section with first article
- Add call-to-action sections

#### Étape 3 - User Accounts (4 weeks)
- Implement signup/login (email + password)
- Add magic link authentication
- Create user dashboard
- Build profile management

#### Étape 4 - Fine Submission Form (6 weeks)
- Create fine submission form
- Implement file upload (drag & drop)
- Add camera access for mobile scanning
- Build fine type dropdown and validation
- Send confirmation emails (user + lawyers)
- Create "My Fines" page to view submissions

#### Étape 5 - Lawyer Management (4 weeks)
- CSV export automation
- Google Drive integration for file sync
- Email notifications for lawyers
- Create lawyer documentation

### ⏳ Phase 2: Advanced Features (Future)
- Admin dashboard for lawyers
- OCR integration (Google Vision API)
- AI scoring for contestability
- Automatic contestation letter generation
- Real-time notifications

### ⏳ Phase 3: AI Enhancement (Future)
- Fine-tuned ML model for scoring
- GPT-4 integration for letter generation
- Historical data analysis
- Lawyer review and adjustment tools

### ⏳ Phase 4: Mobile App (Future)
- Native iOS app
- Native Android app
- Push notifications
- Offline mode

---

## 🎨 Design Guidelines

- **Mobile-first** responsive design
- **Accessibility** (WCAG 2.1 AA compliant)
- **Clean and professional** UI
- **Fast loading** times (target <2s)
- Uses **Geist** font (Vercel's font family)

---

## 🧪 Testing

### Manual Testing
Currently, the project relies on manual testing. Test all user flows before each release.

### Automated Testing (Phase 2)
- Unit tests: Jest + React Testing Library
- E2E tests: Playwright or Cypress
- API tests: Vitest

---

## 🚢 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to `main` branch

### Manual Deployment
```bash
npm run build
npm run start
```

---

## 🔒 Security

- **Authentication:** Supabase Auth with Row Level Security (RLS)
- **Data Encryption:** All data encrypted at rest
- **HTTPS:** Enforced in production
- **File Validation:** Only PDF, JPEG, PNG allowed (max 10MB)
- **GDPR Compliant:** Users can delete their data

---

## 💰 Estimated Costs (Monthly)

### Phase 1 (MVP)
- Vercel: €20-40
- Supabase: €25-50
- Email service: €15
- Domain: €1-2 (€10-15/year)
- **Total: ~€60-100/month**

### Phase 2 (with AI)
- Add AI server: €100-300
- OpenAI API: ~€0.03-0.06 per request
- **Total: ~€160-400/month**

---

## 🤝 Contributing

This is currently a solo development project. Contributions will be opened in the future.

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit using conventional commits: `git commit -m "feat: add new feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Create a Pull Request

### Commit Message Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## 📝 License

[To be determined]

---

## 📞 Contact

- **Developer:** Berkehan
- **Email:** berkanteizm@gmail.com
- **Project Status:** In Development (Phase 0 - Setup)

---

## 🙏 Acknowledgments

### Technologies & Tools
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Vercel](https://vercel.com/) - Hosting platform
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Lucide](https://lucide.dev/) - Icon library

### Inspiration & Research
- **Off The Record** - Traffic ticket contestation app
- **WinIt** - Parking and traffic ticket management
- **Mindee Traffic Ticket OCR** - OCR API for traffic tickets
- **Google Document AI** - Document processing technology
- **Azure Document Intelligence** - Microsoft's OCR solution

---

## 📊 Project Stats

- **Started:** October 2025
- **Current Phase:** Phase 0 (Setup)
- **Target Launch:** Q2 2026 (Phase 1 MVP)
- **Tech Stack:** Next.js + React + TypeScript + Supabase
- **Development Time:** 22 weeks (Phase 1)

---

## 🔗 Useful Links

- [Project Planning Document](./PLANNING.md)
- [Task Tracker](./TASK.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ in France 🇫🇷**
