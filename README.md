# SpendWise

A single-page expense tracking application that helps users log, categorize, and visualize their daily spending habits through interactive charts and filterable lists.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Next.js 16 (App Router) |
| Styling | Tailwind CSS 4, shadcn/ui (Radix UI primitives) |
| Routing | Next.js App Router (single-page with client-side tab navigation) |
| Data Visualization | Recharts (area chart, bar chart, pie chart, stacked bar) |
| Database | MongoDB Atlas (via `mongodb` driver, auto-seeding) |
| Validation | Zod (shared schema for client + server) |
| Theming | next-themes (system / light / dark mode) |

## Features

- Full CRUD operations on expenses (create, read, update, delete)
- Full CRUD on categories (create with custom color, rename with color change, delete)
- Category-based organization with 8 default categories and custom category support
- All categories stored in MongoDB as single source of truth (auto-seeded on first use)
- Custom category creation with color picker (12 color options)
- Category rename updates label only (slug stays stable, no orphan references)
- Filter expenses by category and month
- Expense list grouped by date sections
- Click expense to view detail dialog (with edit/delete actions)
- Analytics dashboard with period filtering and three chart cards:
  - Daily Spending — stacked bar chart (last 30 days by category, custom rounded corners)
  - By Category — horizontal bar chart with labels / donut chart with center total and legend
  - Monthly Trend — area chart with gradient fill, average reference line, and value labels
- Period selector (This Month / Last 3 Months / Last 6 Months / Last 12 Months / All Time) synced across Category and Monthly Trend charts
- Pill-style toggle to switch between chart types (bar/pie, area/bar)
- Stats overview: current month total, weekly average, top category (always shows current month, independent of period filter)
- Responsive chart labels: hidden on mobile to prevent overlap, full labels on desktop
- Category filter dropdown with colored icons per category and hover tint
- Desktop date picker (shadcn Calendar + Popover), native input on mobile
- Responsive mobile-first design
- Dark mode / light mode toggle
- Form validation with meaningful error messages
- Duplicate category detection with inline warning
- Toast notifications for user feedback
- Delete confirmation dialog to prevent accidental removal
- Skeleton loading states during data fetch
- Graceful error handling with retry on API failure
- Accessible UI (Lighthouse Accessibility score: 100)

## Folder Structure

```
ip-a1/
├── app/
│   ├── api/
│   │   └── expenses/
│   │       ├── route.ts            # GET (list + filter) / POST (create)
│   │       ├── [id]/route.ts       # PUT (update) / DELETE (remove)
│   │       ├── categories/route.ts # GET/POST/PATCH categories (auto-seed)
│   │       └── stats/route.ts      # GET aggregated stats (?from=&to= date filtering)
│   ├── layout.tsx                  # Root layout with theme provider
│   ├── page.tsx                    # Entry point — renders <ExpenseApp />
│   └── globals.css                 # Tailwind config + CSS variables
├── components/
│   ├── expense-app.tsx             # Main app shell (state management, dialogs)
│   ├── header.tsx                  # App header with logo + theme toggle
│   ├── stats-overview.tsx          # Summary cards (this month, weekly avg, top category)
│   ├── expense-toolbar.tsx         # Filters + Categories + Add Expense
│   ├── expense-list.tsx            # Expense list grouped by date
│   ├── expense-item.tsx            # Individual expense card
│   ├── expense-dialog.tsx          # Add / Edit expense form dialog
│   ├── expense-detail-dialog.tsx   # Expense detail view dialog
│   ├── confirm-dialog.tsx          # Delete confirmation dialog
│   ├── category-dialog.tsx         # Manage categories (rename / delete / add with color picker)
│   ├── chart-toggle.tsx            # Pill-style chart type toggle
│   ├── period-selector.tsx         # Period filter dropdown (1M/3M/6M/12M/All)
│   ├── daily-chart.tsx             # Stacked bar chart (daily spending by category)
│   ├── category-chart.tsx          # Bar / Donut chart (by category, period-filtered)
│   ├── monthly-trend-chart.tsx     # Area / Bar chart (monthly trend, period-filtered)
│   ├── empty-state.tsx             # Empty state illustration
│   ├── theme-provider.tsx          # next-themes wrapper
│   └── ui/                         # shadcn/ui primitives (button, card, dialog, etc.)
├── hooks/
│   ├── use-expenses.ts             # Expense CRUD hook with fetch + caching
│   ├── use-categories.ts           # Categories hook (fetch, lookup helpers)
│   ├── use-stats.ts                # Stats fetching hook (supports date range filtering)
│   ├── use-media-query.ts          # Responsive media query hook
│   └── use-debounce.ts             # Debounce utility hook
├── lib/
│   ├── db.ts                       # MongoDB client singleton
│   ├── types.ts                    # TypeScript interfaces (Expense, Category, Stats, AnalyticsPeriod)
│   ├── schemas.ts                  # Zod validation schemas
│   ├── constants.ts                # Seed categories, color palette, currency formatting
│   ├── category-icon-map.ts        # Icon string → React component mapping
│   └── utils.ts                    # Tailwind merge utility
├── scripts/
│   └── seed.ts                     # Seed script (~360 records, May 2025 – Apr 2026)
├── db-export.json                  # Database export (expenses + categories)
└── public/                         # Static assets
```

## Challenges Overcome

Building a seamless single-page experience with Next.js App Router required careful separation between server-side API routes and client-side state management — all CRUD operations go through REST endpoints while the UI remains a single React component tree that never triggers a full page reload. The category system initially used hardcoded defaults in code, which caused a "ghost category" bug when renaming — solving this required migrating to a fully database-driven architecture where all categories (including defaults) live in MongoDB with auto-seeding, and rename operations update only the label while keeping the slug stable. Implementing the analytics dashboard with three distinct chart types (stacked bar, donut, area) and interactive chart-type toggles required building custom recharts shapes for proper stacked bar rounded corners, as recharts applies radius per Bar component rather than per cell. Finally, achieving Lighthouse scores of 100 across Accessibility, Best Practices, and SEO while working around Tailwind v4's CSS layer priority issues (which broke shadcn's destructive variant styling) required debugging at the CSS specificity level and patching component internals.
