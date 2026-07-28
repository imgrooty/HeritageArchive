# Cultural Heritage Archive — Next.js Frontend App

This is the premium, responsive frontend application for the Cultural Heritage Archive Platform. It is built with **Next.js (App Router)**, **React 19**, and styled using **Tailwind CSS v4**'s advanced utility system.

---

## 1. Project Directory Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root Layout (with SEO meta configs)
│   │   ├── globals.css         # Tailwind v4 import & custom CSS theme variables
│   │   ├── page.tsx            # Landing Page / Dashboard template
│   │   ├── auth/
│   │   │   ├── login/          # Login Form page
│   │   │   └── register/       # Registration Form page (includes dev role tips)
│   │   ├── discover/           # Map Discovery & search panel page
│   │   ├── contribute/         # Contribution form & visual map picker page
│   │   ├── heritage/
│   │   │   └── [id]/           # Heritage details, language selectors & file uploader
│   │   └── moderation/         # Moderation queue comparing submissions page
│   ├── components/             # Reusable UI widgets
│   ├── lib/
│   │   └── api.ts              # API fetch client helper (JWT storage & file uploads)
├── package.json                # Project dependencies and script declarations
└── tsconfig.json               # TypeScript compiler rules
```

---

## 2. Key Pages & Design Features

* **Visual Aesthetics**: Engineered with a dark theme layout incorporating glassmorphic card panels, customizable colors, and smooth hover translations.
* **Map Discovery**: An interactive coordinates map panel displaying pins matching coordinate queries. Tapping a pin opens detail summaries.
* **Multilingual Fallbacks**: Selectors that query language translations (English, Nepali, Maithili, Bhojpuri). If a translation is unavailable, the user is notified and the page falls back to display the original submission, preventing data loss.
* **Coordinate Map Picker**: A custom-drawn map selector on the contribution form. Tapping anywhere on the canvas automatically maps coordinates to latitude/longitude numbers in Nepal.
* **Image Uploader**: Directly attaches images to a site detail page using interactive drop zones, restricted to creators and moderation teams.

---

## 3. Local Setup & Development

### Prerequisite
* Node.js 18.0 or newer.
* Running backend instance (defaulting to `http://localhost:8000`).

### Setup Instructions

1. **Install Node Packages**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env.local` inside `/frontend` if you want to override the default API endpoint:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

4. **Compile Production Build**
   Run the TypeScript compiler and Turbopack compiler check:
   ```bash
   npm run build
   ```

5. **Start Production Server**
   ```bash
   npm run start
   ```

---

## 4. Local Testing Tip
When creating new accounts on `/auth/register`, you can append special keywords to your username (like `"moderator"`, `"verifier"`, or `"contributor"`) to automatically test the moderation queues and role restrictions.
