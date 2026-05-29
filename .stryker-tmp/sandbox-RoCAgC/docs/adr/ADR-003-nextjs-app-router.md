# ADR-003: Use Next.js App Router

## Status

Accepted

## Context

We needed to select a React framework and routing approach for the frontend. Next.js 14 offers two routing paradigms: the legacy Pages Router and the newer App Router.

Key requirements:
- Server-side rendering for SEO and performance
- Static generation for course content pages
- Internationalization support
- Modern React patterns (Server Components, Suspense)
- File-based routing
- API routes for backend proxy (optional)

## Decision

We chose Next.js 14 with the App Router instead of the Pages Router or alternative frameworks like Remix or Vite+React Router.

## Rationale

**React Server Components:**
- App Router: Native support for Server Components by default
- Pages Router: Client-side only, requires manual data fetching
- Server Components reduce JavaScript bundle size and improve initial page load for course content

**Data Fetching:**
- App Router: async/await directly in components, automatic request deduplication
- Pages Router: getServerSideProps/getStaticProps with separate functions
- Collocating data fetching with components improves code readability

**Layouts & Templates:**
- App Router: Nested layouts with automatic state preservation
- Pages Router: Manual layout composition with _app.tsx
- Shared navigation and authentication state persist across route changes

**Loading & Error States:**
- App Router: loading.tsx and error.tsx conventions with Suspense boundaries
- Pages Router: Manual loading state management
- Declarative loading states improve UX consistency

**Streaming & Suspense:**
- App Router: Built-in streaming SSR with React Suspense
- Pages Router: No streaming support
- Progressive page rendering improves perceived performance

**Route Handlers:**
- App Router: route.ts files with standard Request/Response APIs
- Pages Router: API routes with Node.js-specific req/res
- Web standard APIs are more portable and future-proof

**Internationalization:**
- App Router: Middleware-based i18n with next-intl
- Pages Router: Similar support but less integrated
- App Router's middleware approach is cleaner for locale detection

**Future-Proofing:**
- App Router is the recommended approach for all new Next.js projects
- Vercel is investing heavily in App Router features
- Pages Router is in maintenance mode

## Consequences

**Positive:**
- Smaller JavaScript bundles through Server Components
- Better performance with streaming SSR and automatic code splitting
- Cleaner code with collocated data fetching
- Improved SEO with server-rendered content by default
- Modern React patterns align with ecosystem direction
- Built-in support for parallel routes and intercepting routes

**Negative:**
- Learning curve for developers familiar with Pages Router
- Some third-party libraries don't yet support Server Components
- Client-side state management requires 'use client' directive
- Debugging can be more complex with server/client boundary
- Smaller community knowledge base compared to Pages Router

**Neutral:**
- Requires Next.js 13.4+ (we're using 14.2.0)
- File structure differs from Pages Router (app/ vs pages/)
- Some patterns require rethinking (e.g., context providers need client components)

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js 14 Release Notes](https://nextjs.org/blog/next-14)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
