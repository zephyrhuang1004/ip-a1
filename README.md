# SpendWise

A single-page expense tracking application that helps users log, categorize, and visualize their daily spending habits through interactive charts and filterable lists.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Next.js 16 (App Router) |
| Styling | Tailwind CSS 4, shadcn/ui (Radix UI primitives) |
| Routing | Next.js App Router (single-page with client-side tab navigation) |
| Data Visualization | Recharts (bar chart, pie chart, line chart) |
| Database | MongoDB Atlas (via `mongodb` driver) |
| Validation | Zod (shared schema for client + server) |
| Theming | next-themes (system / light / dark mode) |

## Features

- Full CRUD operations on expenses (create, read, update, delete)
- Category-based organization with 8 default categories and custom category support
- Filter expenses by category and month
- Analytics dashboard with category breakdown (bar / pie chart) and monthly trend (line / bar chart)
- Real-time stats overview: total spent, current month spending, top category
- Responsive mobile-first design
- Dark mode / light mode toggle
- Form validation with meaningful error messages
- Toast notifications for user feedback
- Delete confirmation dialog to prevent accidental removal
- Date picker for easy date selection
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
│   │       ├── categories/route.ts # GET custom categories
│   │       └── stats/route.ts      # GET aggregated stats (MongoDB aggregation)
│   ├── layout.tsx                  # Root layout with theme provider
│   ├── page.tsx                    # Entry point — renders <ExpenseApp />
│   └── globals.css                 # Tailwind config + custom CSS variables
├── components/
│   ├── expense-app.tsx             # Main app shell (state management, dialogs)
│   ├── header.tsx                  # App header with logo + theme toggle
│   ├── stats-overview.tsx          # Summary cards (total, this month, top category)
│   ├── expense-toolbar.tsx         # Filters + Add Expense button
│   ├── expense-list.tsx            # Scrollable expense list
│   ├── expense-item.tsx            # Individual expense card
│   ├── expense-dialog.tsx          # Add / Edit expense form dialog
│   ├── confirm-dialog.tsx          # Delete confirmation dialog
│   ├── category-dialog.tsx         # Manage custom categories dialog
│   ├── category-chart.tsx          # Bar / Pie chart (by category)
│   ├── monthly-trend-chart.tsx     # Line / Bar chart (monthly trend)
│   ├── empty-state.tsx             # Empty state illustration
│   ├── theme-provider.tsx          # next-themes wrapper
│   └── ui/                         # shadcn/ui primitives (button, card, dialog, etc.)
├── hooks/
│   ├── use-expenses.ts             # Expense CRUD hook with fetch + caching
│   ├── use-stats.ts                # Stats fetching hook
│   └── use-debounce.ts             # Debounce utility hook
├── lib/
│   ├── db.ts                       # MongoDB client singleton
│   ├── types.ts                    # TypeScript interfaces (Expense, Stats, etc.)
│   ├── schemas.ts                  # Zod validation schemas
│   ├── constants.ts                # Category definitions, currency formatting
│   └── utils.ts                    # Tailwind merge utility
└── public/                         # Static assets
```

## Challenges Overcome

Building a seamless single-page experience with Next.js App Router required careful separation between server-side API routes and client-side state management -- all CRUD operations go through REST endpoints while the UI remains a single React component tree that never triggers a full page reload. Implementing the MongoDB aggregation pipeline for real-time statistics (category breakdown and monthly trends) was another challenge, as it required running four parallel aggregation queries efficiently while keeping the API response fast. Handling dark mode across the entire app, including the Recharts charts which don't natively support CSS variables, involved mapping custom CSS color tokens to chart components. Finally, managing form state for both "add" and "edit" flows through a single dialog component while keeping Zod validation consistent between client and server required thoughtful schema sharing across the stack.
