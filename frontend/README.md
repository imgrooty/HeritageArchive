# Cultural Heritage Archive - Next.js Web Application

Stunning, high-performance web platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## 1. Directory Blueprint

```text
frontend/
├── src/
│   ├── app/                      # Next.js App Router Page Routes
│   │   ├── layout.tsx            # Global Root Layout with Navigation & Footer
│   │   ├── page.tsx              # Interactive Discovery Homepage
│   │   ├── globals.css           # Custom Glassmorphism & Micro-animations
│   │   ├── discover/             # Interactive Spatial Heritage Map & Search
│   │   ├── heritage/[id]/        # Comprehensive Heritage Entity Detail View
│   │   ├── contribute/           # Community Heritage Contribution Form
│   │   ├── moderation/           # Verifier & Moderator Approval Workflow
│   │   ├── education/            # Cultural Knowledge Hub & Learning Modules
│   │   ├── users/[id]/           # Contributor Profile & Reputation Score
│   │   └── auth/                 # User Authentication Pages
│   │       ├── login/            # JWT User Login
│   │       └── register/         # Contributor Registration
│   │
│   ├── components/               # Modular UI Components
│   │   ├── InteractiveMap.tsx    # Leaflet/MapLibre Spatial Map component
│   │   ├── LanguageSelector.tsx  # Dynamic Multilingual Language Switcher
│   │   └── SmoothScroll.tsx      # Lenis Smooth Inertial Scrolling Engine
│   │
│   └── lib/                      # Infrastructure & API Utilities
│       └── api.ts                # Axios-like Typed API Client & Fetcher
│
├── public/                       # High-resolution media assets & PWA manifest
├── package.json                  # Next 16, React 19, GSAP & Lenis dependencies
├── next.config.ts                # Webpack & Next.js production settings
└── tsconfig.json                 # Strict TypeScript configuration
```

---

## 2. Key Features

- **Interactive Map Discovery**: Real-time geolocation pin cluster map for exploring heritage sites across Nepal.
- **Multilingual Support**: Switch seamlessly between **Nepali**, **Maithili**, **English**, and **Bhojpuri**.
- **Community Submissions**: Submit new heritage sites with images, stories, historical significance, and GPS coordinates.
- **Moderation Workflow**: Review queue for verifiers to approve content or request revisions.
- **Modern Design**: Ultra-sleek glassmorphism UI, smooth inertial scrolling, and vibrant HSL color accents.

---

## 3. Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the `frontend` root:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
