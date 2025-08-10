# Project Structure

## Root Configuration
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration with path aliases
- `tailwind.config.ts` - Tailwind CSS configuration with custom theme
- `components.json` - shadcn/ui configuration (New York style)
- `middleware.ts` - Supabase auth middleware for session management

## App Directory (App Router)
```
app/
├── layout.tsx          # Root layout with theme provider
├── page.tsx            # Home page with auth redirect logic
├── globals.css         # Global styles and CSS variables
├── auth/               # Authentication pages
├── protected/          # Protected app routes
└── landing/            # Public landing page
```

## Library Structure
```
lib/
├── types.ts            # TypeScript type definitions
├── utils.ts            # Utility functions (cn helper)
└── supabase/
    ├── server.ts       # Server-side Supabase client
    ├── client.ts       # Client-side Supabase client
    └── middleware.ts   # Auth middleware utilities
```

## Components Organization
```
components/
├── ui/                 # shadcn/ui components
├── auth-button.tsx     # Authentication UI components
└── [feature]/          # Feature-specific components
```

## Key Patterns

### Path Aliases
- `@/*` maps to root directory
- Use `@/components`, `@/lib`, `@/hooks` for imports

### Supabase Client Usage
- **Server Components**: Use `@/lib/supabase/server`
- **Client Components**: Use `@/lib/supabase/client`
- Always create new client instances (don't use globals)

### Authentication Flow
- Root page (`/`) redirects based on auth state
- Authenticated users → `/protected`
- Unauthenticated users → `/landing`
- Middleware handles session refresh across all routes

### Styling Conventions
- Use Tailwind CSS with CSS variables
- Follow shadcn/ui component patterns
- Utilize custom animations and theme colors
- Responsive design with mobile-first approach

### Type Safety
- Strict TypeScript configuration
- Comprehensive type definitions in `lib/types.ts`
- API response types with generic patterns