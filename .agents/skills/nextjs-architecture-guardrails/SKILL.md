---
name: nextjs-architecture-guardrails
description: High-level decision-making rules for Next.js 16 + Supabase. Prevents over-engineering and wrong patterns.
user-invocable: false
---

# Next.js Architecture Guardrails

Apply these rules before writing code.

## 1. Default to Next.js Patterns

- Prefer Server Components over client logic
- Prefer Server Actions over API routes (when possible)
- Use Route Handlers only for external APIs or clear boundaries
- Do NOT introduce Express/Fastify inside Next.js

---

## 2. Runtime Awareness (critical)

Always ask:

- Does this run on server, client, or edge?
- Am I leaking secrets to the client?
- Am I relying on in-memory state?

Rules:

- No secrets in client components
- No Node APIs in edge runtime
- No global mutable state

---

## 3. Supabase as Security Layer

- Trust RLS (Row Level Security) over manual checks
- Do not duplicate authorization logic in API routes
- Never expose service role keys
- Validate inputs, but let DB enforce access

---

## 4. Keep Architecture Simple

- Avoid controller/service/repository layers by default
- Keep logic close to usage (colocation)
- Extract only when reused or complex
- Don’t abstract prematurely

---

## 5. Data Fetching Strategy

- Fetch in Server Components whenever possible
- Avoid client-side fetching unless necessary
- Prevent waterfalls (use parallel fetching / Suspense)

---

## 6. Validation & Errors

- Validate at boundaries (routes, actions, external data)
- Fail fast with clear errors
- Never expose internal errors to client

---

## 7. Anti-Patterns (hard rules)

❌ Don’t:

- Move logic to client unnecessarily
- Recreate backend architecture inside Next.js
- Bypass Supabase RLS
- Over-engineer structure early

✅ Do:

- Lean into Next.js design
- Let database handle security
- Optimize for simplicity first

---

## Golden Rule

The best solution is usually:
→ fewer layers  
→ more server-side logic  
→ less custom infrastructure
