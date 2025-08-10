# Technology Stack

## Framework & Runtime
- **Next.js 15** with App Router (latest)
- **React 19** with TypeScript
- **Node.js** runtime

## Database & Backend
- **Supabase** for database, authentication, and storage
- **Supabase SSR** for cookie-based auth across the full Next.js stack
- **Google Gemini API** for AI transcription and content processing

## Styling & UI
- **Tailwind CSS** for styling with CSS variables
- **shadcn/ui** components (New York style)
- **Radix UI** primitives for accessible components
- **Lucide React** for icons
- **Framer Motion** for animations
- **next-themes** for dark/light mode

## Development Tools
- **TypeScript** with strict mode
- **ESLint** with Next.js config
- **PostCSS** and **Autoprefixer**

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run dev:debug    # Start with Node.js inspector
npm run type-check   # TypeScript type checking
npm run lint         # Run ESLint
```

### Build & Deploy
```bash
npm run build        # Production build
npm run start        # Start production server
```

### Database & Deployment
```bash
npm run migrate      # Apply Supabase migrations
npm run deploy:edge  # Deploy edge functions
```

## Environment Setup
- Copy `.env.example` to `.env.local`
- Configure Supabase URL and keys
- Set up Gemini API key for AI features
- Optional: Configure rate limiting and file size limits