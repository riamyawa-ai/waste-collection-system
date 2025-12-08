# Day 1: Project Setup & Foundation

**Date**: Day 1 of 10  
**Focus**: Infrastructure setup, project initialization, and base UI components

---

## 📋 Objectives

- Initialize Next.js 14 project with TypeScript
- Configure Supabase project and connection
- Set up Tailwind CSS and shadcn/ui component library
- Create base layout components and design system
- Establish eco-friendly green/white color theme
- Set up development environment and tooling

---

## 🛠️ Tasks

### 1.1 Project Initialization (2 hours)

#### Setup Tasks:

- [ ] Create Next.js 14 project with App Router
  ```bash
  npx create-next-app@latest waste-collection-system --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  ```
- [ ] Initialize Git repository
- [ ] Create `.env.local` file for environment variables
- [ ] Configure ESLint and Prettier for code consistency
- [ ] Set up folder structure:
  ```
  src/
  ├── app/
  │   ├── (auth)/
  │   ├── (client)/
  │   ├── (staff)/
  │   ├── (admin)/
  │   ├── (collector)/
  │   └── api/
  ├── components/
  │   ├── ui/
  │   ├── forms/
  │   ├── layouts/
  │   ├── maps/
  │   └── shared/
  ├── lib/
  │   ├── supabase/
  │   ├── mapbox/
  │   ├── utils/
  │   └── validators/
  ├── hooks/
  ├── types/
  ├── constants/
  └── styles/
  ```

### 1.2 Supabase Configuration (1.5 hours)

#### Setup Tasks:

- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Note down project URL and anon key
- [ ] Install Supabase client:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  ```
- [ ] Create Supabase client utilities:
  - `src/lib/supabase/client.ts` - Browser client
  - `src/lib/supabase/server.ts` - Server component client
  - `src/lib/supabase/middleware.ts` - Middleware client
- [ ] Configure environment variables:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
  ```

### 1.3 Tailwind CSS & shadcn/ui Setup (2 hours)

#### Setup Tasks:

- [ ] Verify Tailwind CSS configuration
- [ ] Install and initialize shadcn/ui:
  ```bash
  npx shadcn-ui@latest init
  ```
- [ ] Configure `components.json` for shadcn/ui
- [ ] Install essential shadcn/ui components:
  ```bash
  npx shadcn-ui@latest add button card input label form toast dialog dropdown-menu avatar badge table tabs calendar select textarea checkbox separator sheet scroll-area progress skeleton alert
  ```
- [ ] Create custom eco-friendly color palette in `tailwind.config.ts`

### 1.4 Eco-Friendly Design System Foundation (2.5 hours)

#### Color Theme - Green & White (Waste/Eco Theme):

##### Primary Color Palette:

```javascript
// tailwind.config.ts
const colors = {
  // Primary Green Shades (Main Theme)
  primary: {
    50: "#f0fdf4", // Lightest green background
    100: "#dcfce7", // Light green hover states
    200: "#bbf7d0", // Subtle green accents
    300: "#86efac", // Light interactive elements
    400: "#4ade80", // Medium green
    500: "#22c55e", // Primary action color
    600: "#16a34a", // Primary button color
    700: "#15803d", // Hover states
    800: "#166534", // Dark accents
    900: "#14532d", // Darkest green
    950: "#052e16", // Near black green
  },

  // White/Neutral Shades (Clean, Fresh Feel)
  neutral: {
    50: "#fafafa", // Background
    100: "#f5f5f5", // Card backgrounds
    200: "#e5e5e5", // Borders
    300: "#d4d4d4", // Disabled states
    400: "#a3a3a3", // Placeholder text
    500: "#737373", // Secondary text
    600: "#525252", // Body text
    700: "#404040", // Headings
    800: "#262626", // Dark text
    900: "#171717", // Darkest text
  },

  // Status Colors (Consistent across system)
  status: {
    completed: "#22c55e", // Green - Completed
    scheduled: "#3b82f6", // Blue - Scheduled/Confirmed
    pending: "#eab308", // Yellow - Pending
    inProgress: "#f97316", // Orange - In Progress
    cancelled: "#ef4444", // Red - Cancelled/Rejected
  },

  // Priority Colors
  priority: {
    low: "#22c55e", // Green
    medium: "#eab308", // Yellow
    urgent: "#ef4444", // Red
  },

  // Accent Colors (Eco-themed)
  accent: {
    leaf: "#84cc16", // Lime green (fresh)
    earth: "#78716c", // Stone (earth tones)
    water: "#06b6d4", // Cyan (clean water)
    sky: "#0ea5e9", // Sky blue
  },
};
```

##### CSS Custom Properties (globals.css):

```css
@layer base {
  :root {
    /* Primary Theme Colors */
    --color-primary: 142 71% 45%;
    --color-primary-foreground: 0 0% 100%;

    /* Background Colors */
    --background: 0 0% 100%;
    --foreground: 0 0% 10%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 10%;

    /* Accent Colors */
    --accent: 142 71% 95%;
    --accent-foreground: 142 71% 25%;

    /* Status Colors */
    --status-completed: 142 71% 45%;
    --status-scheduled: 217 91% 60%;
    --status-pending: 48 96% 53%;
    --status-in-progress: 25 95% 53%;
    --status-cancelled: 0 84% 60%;

    /* Borders & Muted */
    --border: 0 0% 90%;
    --muted: 142 30% 96%;
    --muted-foreground: 0 0% 45%;

    /* Eco Gradient */
    --gradient-eco: linear-gradient(
      135deg,
      #22c55e 0%,
      #16a34a 50%,
      #15803d 100%
    );
    --gradient-fresh: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  }

  .dark {
    --background: 142 20% 8%;
    --foreground: 0 0% 95%;
    --card: 142 15% 12%;
    --card-foreground: 0 0% 95%;
    --primary: 142 71% 45%;
    --primary-foreground: 0 0% 100%;
    --accent: 142 30% 20%;
    --accent-foreground: 142 71% 80%;
    --border: 142 15% 20%;
    --muted: 142 15% 15%;
    --muted-foreground: 0 0% 60%;
  }
}
```

#### Status Color Classes:

- [ ] Create status utility classes:
  - `.status-completed` - Green (#22c55e) for completed items
  - `.status-scheduled` - Blue (#3b82f6) for scheduled/confirmed items
  - `.status-pending` - Yellow (#eab308) for pending items
  - `.status-in-progress` - Orange (#f97316) for in-progress items
  - `.status-cancelled` - Red (#ef4444) for cancelled/rejected items

#### Create Base Styles:

- [ ] Update `src/styles/globals.css`:
  - CSS custom properties for colors, spacing, typography
  - Animation utilities (fade-in, slide-up, pulse-green)
  - Status color classes with hover states
  - Eco-themed gradients and shadows
- [ ] Create typography scale configuration
- [ ] Define spacing and sizing conventions
- [ ] Set up responsive breakpoints
- [ ] Add eco-themed box shadows:
  ```css
  --shadow-eco: 0 4px 14px 0 rgba(34, 197, 94, 0.15);
  --shadow-eco-lg: 0 10px 40px -10px rgba(34, 197, 94, 0.25);
  ```

#### Create Base Components:

- [ ] `src/components/ui/status-badge.tsx` - Color-coded status indicators
  - Completed (green), Scheduled (blue), Pending (yellow), In Progress (orange), Cancelled (red)
- [ ] `src/components/ui/priority-badge.tsx` - Priority level indicators
  - Low (green), Medium (yellow), Urgent (red)
- [ ] `src/components/ui/stat-card.tsx` - Dashboard summary cards with eco-styling
- [ ] `src/components/ui/page-header.tsx` - Consistent page headers
- [ ] `src/components/ui/data-table.tsx` - Reusable table component
- [ ] `src/components/ui/loading-spinner.tsx` - Green-themed loading states
- [ ] `src/components/ui/empty-state.tsx` - Empty data placeholders with eco illustrations
- [ ] `src/components/ui/eco-card.tsx` - Cards with subtle green gradient borders

### 1.5 Layout Components (1.5 hours)

#### Create Layout Structure:

- [ ] `src/components/layouts/RootLayout.tsx` - App-wide layout with eco background
- [ ] `src/components/layouts/AuthLayout.tsx` - Auth pages layout (white centered card on light green bg)
- [ ] `src/components/layouts/DashboardLayout.tsx` - Protected pages layout
- [ ] `src/components/layouts/Sidebar.tsx` - Navigation sidebar with green active states
- [ ] `src/components/layouts/Header.tsx` - Top navigation header with white bg + green accents
- [ ] `src/components/layouts/MobileNav.tsx` - Mobile navigation
- [ ] `src/components/layouts/Footer.tsx` - Footer with eco theme

### 1.6 Landing Page Structure (1 hour)

#### Create Public Pages:

- [ ] `src/app/page.tsx` - Landing page with eco-friendly design
- [ ] `src/app/layout.tsx` - Root layout with metadata
- [ ] Create landing page sections:
  - Hero section with eco gradient background
  - "Register" and "Login" CTA buttons (green primary)
  - Features overview with green icons
  - How it works section with illustrations
  - Environmental impact section
  - Footer with contact info and social links

#### Landing Page Design Elements:

- [ ] Circular logo with green leaves/recycling theme
- [ ] Hero background: Subtle green gradient or eco pattern
- [ ] Feature cards: White cards with green icon accents
- [ ] CTA buttons: Primary green (#16a34a) with white text

### 1.7 Constants & Types Setup (0.5 hours)

#### Create Constants:

- [ ] `src/constants/barangays.ts` - List of 36 Panabo City barangays:
  ```typescript
  export const PANABO_BARANGAYS = [
    "A.O. Floirendo",
    "Buenavista",
    "Cagaycay",
    "Cagangohan",
    "Datu Abdul Dadia",
    "Gredu (Poblacion)",
    "J.P. Laurel (Poblacion)",
    "Kasilak",
    "Katipunan",
    "Katualan",
    "Kauswagan",
    "Kiotoy",
    "Little Panay (Poblacion)",
    "Lower Panaga (Roxas)",
    "Mabunao",
    "Malativas",
    "Manay",
    "Nanyo",
    "New Malaga (Dalisay)",
    "New Malitbog",
    "New Pandan (Poblacion)",
    "New Visayas",
    "Quezon",
    "Salvacion",
    "San Francisco (Poblacion)",
    "San Nicolas (Poblacion)",
    "San Roque",
    "San Vicente",
    "Santa Cruz",
    "Santo Niño (Poblacion)",
    "Southern Davao",
    "Tagpore",
    "Tibungol",
    "Upper Licanan",
    "Waterfall",
  ] as const;
  ```
- [ ] `src/constants/status.ts` - Status enums and colors mapping
- [ ] `src/constants/roles.ts` - User role definitions

---

## 📁 Files to Create

| File                         | Description                   |
| ---------------------------- | ----------------------------- |
| `src/lib/supabase/client.ts` | Browser Supabase client       |
| `src/lib/supabase/server.ts` | Server Supabase client        |
| `src/lib/utils/cn.ts`        | Class name utility function   |
| `src/types/index.ts`         | TypeScript type definitions   |
| `src/constants/barangays.ts` | Panabo City barangays list    |
| `src/constants/status.ts`    | Status enums and colors       |
| `src/constants/roles.ts`     | User role definitions         |
| `src/components/layouts/*`   | Layout components             |
| `src/components/ui/*`        | Base UI components            |
| `.env.local`                 | Environment variables         |
| `tailwind.config.ts`         | Tailwind with eco color theme |

---

## ✅ Acceptance Criteria

- [ ] Next.js app runs without errors (`npm run dev`)
- [ ] Supabase connection established successfully
- [ ] All shadcn/ui components render correctly
- [ ] Eco-friendly green/white color theme applied throughout
- [ ] Status colors display correctly (green, blue, yellow, orange, red)
- [ ] Landing page displays with proper eco-themed styling
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Dark mode toggle functional with green theme preserved
- [ ] ESLint passes with no errors

---

## 🎨 Design Guidelines

### Logo & Branding:

- Primary logo: Circular with leaf/recycling motif
- Color: Primary green (#16a34a) on white background
- Alt: White logo on green background for dark sections

### Typography:

- Font Family: Inter or Outfit (Google Fonts)
- Headings: Bold, dark neutral (#171717)
- Body: Regular, neutral-600 (#525252)
- Links: Primary green with underline on hover

### Buttons:

- Primary: Green background (#16a34a), white text
- Secondary: White background, green border, green text
- Destructive: Red background (#ef4444), white text
- Ghost: Transparent, green text on hover

### Cards:

- Background: White (#ffffff)
- Border: Light neutral (#e5e5e5)
- Shadow: Subtle eco shadow
- Hover: Slight lift with green shadow accent

---

## 📝 Notes

- Keep the codebase clean and well-documented from the start
- Use TypeScript strictly - no `any` types where avoidable
- Follow Next.js 14 App Router conventions
- Commit changes frequently with descriptive messages
- Document any design decisions in code comments
- Maintain consistent eco-friendly aesthetic across all components

---

## ⏱️ Estimated Time: 11 hours

| Task                   | Duration  |
| ---------------------- | --------- |
| Project Initialization | 2 hours   |
| Supabase Configuration | 1.5 hours |
| Tailwind & shadcn/ui   | 2 hours   |
| Eco Design System      | 2.5 hours |
| Layout Components      | 1.5 hours |
| Landing Page           | 1 hour    |
| Constants & Types      | 0.5 hours |
