If Context7 MCP is available, agents should consult it before answering any question about external libraries, frameworks, or SDK APIs. Agents should not rely solely on pretrained knowledge and should perform a web search when up-to-date or authoritative information is required.

### 🔄 Project Awareness & Context

- **Always read `PLANNING.md`** and `ARCHITECTURE.md` under `/docs` folder at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md` and `ARCHITECTURE.md`.
- do not make any modifications into `TASK.md`
- Update `ARCHITECTURE.md` when there's a change on the repo.

### 📚 Documentation & Explainability

- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline `# Reason:` comment** explaining the why, not just the what.

### 🧱 Code Structure & Modularity

- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Use clear, consistent imports** (prefer relative imports within packages).

### 🧠 AI Behavior Rules

- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future.

🔧 MCP Usage Policy (Mandatory Tooling Protocol)
General Rule

When MCP tools are available, the agent must proactively use them instead of relying on assumptions or prior knowledge whenever authoritative documentation or runtime verification is possible.

The agent must never guess behavior that can be verified through an available MCP tool.

1️⃣ Context7 MCP — Documentation & API Authority

Mandatory Use When:
Answering questions about external libraries, frameworks, or SDK APIs
Generating code that depends on third-party packages
Explaining configuration options or version-specific behavior
Referencing breaking changes or newly introduced features

Policy:
Always consult Context7 MCP before responding to library/framework questions.
Validate API signatures, configuration schemas, and usage patterns.
Do not rely solely on training data for evolving ecosystems.

2️⃣ Playwright MCP — Browser Automation & UI Verification

Mandatory Use When:
Performing browser automation
Testing UI flows or end-to-end behavior
Navigating pages, clicking elements, filling forms
Capturing screenshots
Verifying DOM state or dynamic frontend behavior

Policy:

Use Playwright MCP to execute real interactions.
Do not simulate expected browser results if Playwright can verify them.
Validate selectors and rendered output when correctness matters.

3️⃣ Chrome DevTools MCP — Runtime & Frontend Debugging

Mandatory Use When:

Inspecting console logs or runtime errors
Debugging JavaScript execution
Analyzing network requests
Investigating performance bottlenecks
Inspecting live DOM structure

Policy:

Use Chrome DevTools MCP for runtime inspection.
Do not infer client-side behavior without verification.
Validate network calls and execution context when debugging.

4️⃣ Next.js DevTools MCP — Framework-Specific Inspection

Mandatory Use When:

Debugging routing (App Router or Pages Router)
Investigating SSR, SSG, ISR behavior
Diagnosing hydration errors
Analyzing Server vs Client Components
Inspecting middleware or runtime (Edge vs Node)
Reviewing build output or bundle behavior

Policy:

Do not assume rendering mode or router behavior.
Use Next.js DevTools MCP to verify component boundaries and lifecycle.
Validate data fetching strategies and runtime configuration.

5️⃣ Supabase MCP — Database, Auth & Realtime Authority
Mandatory Use When:

Writing or validating Supabase client code (@supabase/supabase-js)
Designing or debugging Row Level Security (RLS) policies
Creating or modifying database schema (tables, indexes, constraints)
Working with Supabase Auth (JWTs, sessions, OAuth, magi links)
Implementing Realtime subscriptions
Writing Edge Functions
Debugging Storage buckets or file permissions
Investigating PostgREST queries or RPC functions
Handling migrations or SQL execution
Verifying Supabase configuration (anon keys, service role, URL usage)

Policy:

Always consult Supabase MCP before responding to Supabase-related questions.
Validate API signatures against the correct Supabase JS version.
Verify SQL syntax and Postgres compatibility.
Confirm RLS policy logic and role behavior.
Validate Auth flows and session handling
Ensure correct usage of anon vs service role keys.
Verify Realtime channel configuration.
Confirm Storage bucket policies and access rules.
Validate Edge Function runtime constraints.

🚨 Enforcement Rule

If a task falls into any of the above categories and the corresponding MCP tool is available:
The agent must use the tool before answering.
The agent must not fabricate results.
The agent must prefer verified runtime or documentation data over prior knowledge.
If multiple tools are relevant, the agent should use them in combination.

# Contesto - AI Agent Instructions

> **Project Context**: French legal-tech SaaS platform for contesting traffic fines using AI-powered document analysis. Built with Next.js 15 + Express backend + Google Gemini AI.

---

## 🎯 Project Overview

**What is Contesto?**
Contesto helps French drivers contest traffic fines by analyzing uploaded documents with AI and connecting users with certified lawyers. The platform automates the legal review process, saving time and increasing success rates.

**Business Domain:**

- **Primary language**: French (all UI text, error messages, user-facing content)
- **Product**: Fine contestation workflow (submit → analyze → review → contest)
- **Fine types**: Speeding, parking, red lights, license violations
- **Status flow**: pending → analyzing → reviewed → submitted → resolved/rejected

**Architecture:**

- **Frontend**: Next.js 15 App Router + React 19 (main application)
- **Backend**: Separate Express 5 server for processing (in `processing-server/`)
- **Queue System**: BullMQ + Redis for background jobs
- **Database/Auth**: Supabase (PostgreSQL + Auth + Storage)
- **AI Provider**: Google Gemini SDK for OCR and structured extraction

---

## 🚀 Development Setup

### Frontend (Next.js App)

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Processing Server (Backend)

```bash
# Navigate to processing server
cd processing-server

# Install dependencies
npm install

# Run in development (watch mode with tsx)
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Prerequisites

- Node.js 18+ required
- Redis server for BullMQ
  - Local: `redis-server`
  - Docker: `docker run -d -p 6379:6379 redis`
- Supabase project with environment variables configured
- Google Gemini API key

### Environment Variables

Create `.env.local` in root for frontend:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Create `.env` in `processing-server/`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GEMINI_API_KEY=your_gemini_key
REDIS_URL=redis://localhost:6379
```

---

## 📝 TypeScript & Code Style

### Type Safety Rules

- **Strict mode enabled**: Follow all TypeScript strict checks
- **Prefer `interface` over `type`** for object shapes
- **Use `type` for unions and intersections**
- **Never use `var`** - use `const` by default, `let` when mutation needed
- **Avoid `any`** - use `unknown` if type is truly unknown
- **Use `as` sparingly** - only with explanatory comment explaining why it's safe

### Null Handling

```typescript
// ✅ DO: Prefer undefined over null
function getUser(): User | undefined {}

// ✅ DO: Use nullish coalescing
const value = data?.field ?? defaultValue;

// ❌ DON'T: Mix null and undefined
function getUser(): User | null | undefined {}
```

### Path Aliases

- Use `@/` for absolute imports from root
- Example: `import { Button } from '@/components/ui/button'`
- Never use relative imports crossing multiple directories: `../../../components`

### File Organization

- **Small, focused files**: Each file should have one clear purpose
- **Colocate related code**: Keep types, components, and utilities close
- **Named exports preferred**: `export function Component()` over `export default`

### Type Generation

```bash
# Generate TypeScript types from Supabase schema
npx supabase gen types typescript --project-id your_project_id > types/database.types.ts
```

---

## ⚛️ Next.js App Router Patterns

### Server vs Client Components

**Server Components (default):**

- No `"use client"` directive needed
- Can directly query database/APIs
- Cannot use hooks, event handlers, or browser APIs
- Reduces bundle size, better performance

**Client Components (add `"use client"`):**

- Required for: `useState`, `useEffect`, `onClick`, browser APIs
- Required for: real-time subscriptions, interactive features
- Keep client components small and leaf-level when possible

```typescript
// ✅ Server Component (default)
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: fines } = await supabase
    .from('fines')
    .select('*')
    .order('created_at', { ascending: false })

  return <DashboardClient fines={fines} />
}
```

```typescript
// ✅ Client Component
// app/dashboard/_components/dashboard-client.tsx
"use client";

import { useState } from "react";

export function DashboardClient({ fines }) {
  const [selected, setSelected] = useState(null);
  // Interactive logic here
}
```

### Data Fetching Patterns

**Server Components:**

```typescript
// Use server-side Supabase client
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data } = await supabase.from("table").select();
```

**Client Components:**

```typescript
// Use client-side Supabase client
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data } = await supabase.from("table").select();
```

**Real-time Subscriptions:**

```typescript
"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export function RealtimeComponent() {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("fines-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fines" },
        (payload) => {
          console.log("Change detected:", payload);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
```

### Server Actions

**Use for mutations (create, update, delete):**

```typescript
// app/dashboard/settings/profile/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ name: formData.get("name") })
    .eq("id", userId);

  if (error) throw error;

  revalidatePath("/dashboard/settings/profile");
  return { success: true };
}
```

**Call from Client Components:**

```typescript
'use client'

import { updateProfile } from './actions'

export function ProfileForm() {
  return (
    <form action={updateProfile}>
      <input name="name" />
      <button type="submit">Save</button>
    </form>
  )
}
```

### Route Handlers

Place API routes in `route.ts` files:

```typescript
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Handle webhook
  return NextResponse.json({ success: true });
}
```

---

## 🎨 shadcn/ui & Tailwind CSS v4

### Critical Rules

**🚨 NEVER edit `/components/ui/` files manually**

- These are shadcn/ui components managed by CLI
- Modifications will be overwritten on updates
- Customize through composition, not modification

### Adding/Updating Components

```bash
# Add a new component
npx shadcn@latest add button

# Update all components
npx shadcn@latest add --all --overwrite

# Update specific component
npx shadcn@latest add dialog --overwrite
```

### Customization Pattern

```typescript
// ❌ DON'T: Edit /components/ui/button.tsx directly

// ✅ DO: Wrap in custom component
// components/custom-button.tsx
import { Button } from '@/components/ui/button'

export function CustomButton({ children, ...props }) {
  return (
    <Button className="custom-styles" {...props}>
      {children}
    </Button>
  )
}
```

### Tailwind CSS v4 Usage

**Design Tokens (CSS Variables):**

```typescript
// ✅ Use semantic color tokens
<div className="bg-primary text-primary-foreground">
<div className="bg-secondary text-secondary-foreground">
<div className="bg-muted text-muted-foreground">
<div className="border border-border">

// ❌ DON'T: Hardcode colors
<div className="bg-blue-500 text-white">
```

**Conditional Classes with `cn()` utility:**

```typescript
import { cn } from '@/lib/utils'

<Button
  className={cn(
    "base-classes",
    isActive && "active-classes",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
/>
```

**Responsive Design (Mobile-First):**

```typescript
<div className="
  p-4           {/* mobile */}
  sm:p-6        {/* 640px+ */}
  md:p-8        {/* 768px+ */}
  lg:p-12       {/* 1024px+ */}
  xl:p-16       {/* 1280px+ */}
">
```

**Dark Mode Support:**

```typescript
// Automatically handled by next-themes
<div className="bg-white dark:bg-slate-950">
```

### Icons

- **Library**: Lucide React (already installed)
- **Import**: `import { IconName } from 'lucide-react'`
- **Sizing**: Use className for consistent sizing

```typescript
import { FileText, Calendar, CheckCircle } from 'lucide-react'

<CheckCircle className="w-5 h-5 text-primary" />
```

---

## 📋 Forms & Validation

### Standard Pattern: react-hook-form + zod

**Reference**: See `components/profile/profile-form.tsx` for complete example

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

// 1. Define schema (French error messages)
const formSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères')
})

type FormValues = z.infer<typeof formSchema>

// 2. Setup form
export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: ''
    }
  })

  // 3. Handle submission
  async function onSubmit(values: FormValues) {
    try {
      // Call server action or API
      await submitForm(values)
    } catch (error) {
      form.setError('root', { message: 'Une erreur est survenue' })
    }
  }

  // 4. Render with shadcn Form components
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Enregistrer
        </Button>
      </form>
    </Form>
  )
}
```

### Known Issues & Best Practices

**❌ Common Mistake:**

```typescript
// DON'T: Access form methods without destructuring
<FormField control={form.control} ... />
```

**✅ Correct Pattern:**

```typescript
// DO: Destructure form methods
const { control, handleSubmit, formState } = form
<FormField control={control} ... />
```

### Validation Rules

**Client-side (zod):**

- Immediate feedback for users
- French error messages
- Input format validation

**Server-side (Server Actions/API):**

```typescript
"use server";

export async function submitForm(data: unknown) {
  // Parse and validate again on server
  const validated = formSchema.parse(data);

  // Process validated data
}
```

---

## 🗄️ Supabase Integration

### Client Types

**Three different clients for different contexts:**

1. **Server Client** (`@/lib/supabase/server`)
   - Use in: Server Components, Server Actions, Route Handlers
   - Has access to cookies for auth
2. **Client Client** (`@/lib/supabase/client`)
   - Use in: Client Components (with `'use client'`)
   - Browser-side operations

3. **Middleware Client** (`@/lib/supabase/middleware`)
   - Use in: `middleware.ts` only
   - Route protection

### Authentication Patterns

**Check User Session:**

```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <div>Protected content for {user.email}</div>
}
```

**Client-side Auth State:**

```typescript
"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function AuthComponent() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
}
```

### Database Operations

**Type-safe queries:**

```typescript
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

const supabase = await createClient();

// Select with types
const { data, error } = await supabase
  .from("fines")
  .select("id, status, created_at, user_id")
  .eq("user_id", userId)
  .order("created_at", { ascending: false });

// Insert
const { error } = await supabase.from("fines").insert({
  user_id: userId,
  status: "pending",
  document_url: url,
});

// Update
const { error } = await supabase
  .from("fines")
  .update({ status: "analyzed" })
  .eq("id", fineId);
```

### Storage Operations

**Upload files:**

```typescript
const { data, error } = await supabase.storage
  .from("fine-documents")
  .upload(`${userId}/${fileName}`, file, {
    cacheControl: "3600",
    upsert: false,
  });
```

**Get signed URLs:**

```typescript
const { data } = await supabase.storage
  .from("fine-documents")
  .createSignedUrl(filePath, 3600); // 1 hour expiry

const signedUrl = data.signedUrl;
```

**Delete files:**

```typescript
const { error } = await supabase.storage
  .from("fine-documents")
  .remove([filePath]);
```

### Real-time Subscriptions

```typescript
"use client";

const channel = supabase
  .channel("fines-updates")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "fines",
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log("Fine updated:", payload.new);
      // Update UI state
    },
  )
  .subscribe();
```

### Security Best Practices

**🚨 Critical Security Rules:**

```typescript
// ❌ NEVER expose service_role key in frontend
// It bypasses Row Level Security (RLS)

// ✅ Use anon key in frontend
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key;

// ✅ Use service_role key ONLY in backend (processing-server)
SUPABASE_SERVICE_KEY = your_service_key;
```

**Row Level Security (RLS):**

- Always enable RLS on tables
- Define policies for SELECT, INSERT, UPDATE, DELETE
- Test policies thoroughly
- Don't rely on client-side checks alone

**Validation:**

- Validate auth on both client AND server
- Check user permissions in Server Actions
- Verify webhook signatures in processing server

---

## ⚙️ Processing Server (Express + BullMQ)

### Architecture Overview

The processing server is a **separate Node.js backend** in `processing-server/`:

**Key Files:**

- `index.ts` - Server entry point, starts Express
- `app.ts` - Express application configuration
- `worker.ts` - BullMQ job processor (separate process)
- `src/routes/` - API endpoints (webhooks, etc.)
- `src/queue/` - Queue configuration and job definitions
- `src/gemini/` - Google Gemini AI integration
- `src/supabase/` - Supabase operations (fines, storage)

### Express API Patterns

**Basic route structure:**

```typescript
// src/routes/webhook.ts
import { Router } from "express";

const router = Router();

router.post("/webhook/fine-uploaded", async (req, res) => {
  try {
    const { fineId } = req.body;

    // Validate input
    if (!fineId) {
      return res.status(400).json({ error: "Fine ID required" });
    }

    // Add to queue
    await fineProcessingQueue.add("process-fine", { fineId });

    res.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
```

**Error handling:**

```typescript
// Always use try-catch
try {
  await operation();
} catch (error) {
  console.error("Operation failed:", error);
  // Log to monitoring service
  // Return appropriate error response
}
```

### BullMQ Queue System

**Queue Configuration** (`src/queue/queue.ts`):

```typescript
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL);

export const fineProcessingQueue = new Queue("fine-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  },
});
```

**Adding Jobs:**

```typescript
// In webhook or API route
await fineProcessingQueue.add(
  "process-fine",
  {
    fineId: "123",
    userId: "user-456",
  },
  {
    priority: 1, // Higher priority
    delay: 5000, // Wait 5 seconds before processing
  },
);
```

**Processing Jobs** (`worker.ts`):

```typescript
import { Worker } from "bullmq";
import { processFine } from "./processors/fine-processor";

const worker = new Worker(
  "fine-processing",
  async (job) => {
    console.log(`Processing job ${job.id}:`, job.name);

    switch (job.name) {
      case "process-fine":
        return await processFine(job.data);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 5, // Process 5 jobs simultaneously
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000, // Per second
    },
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
```

### Queue Best Practices

**✅ DO:**

- Use exponential backoff for retries
- Set reasonable timeouts (not too long)
- Clean up old jobs to prevent Redis bloat
- Log job progress and failures
- Use priority for urgent jobs
- Monitor queue health

**❌ DON'T:**

- Block the worker with synchronous operations
- Store large payloads in jobs (use references/IDs)
- Ignore failed jobs (investigate and fix)
- Run CPU-intensive operations in queue (offload to separate service)

---

## 🤖 Google Gemini AI Integration

### Client Setup

**Initialize once** (`src/gemini/client.ts`):

```typescript
import { GoogleGenerativeAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

export const genAI = new GoogleGenerativeAI(apiKey);
export const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // or gemini-1.5-pro for better quality
});
```

### Document Extraction Pattern

**OCR + Structured Extraction** (`src/gemini/extract.ts`):

```typescript
import { model } from "./client";
import { fineExtractionSchema } from "./schemas";

export async function extractFineData(imageBuffer: Buffer) {
  try {
    const prompt = `
      Analyze this French traffic fine document and extract:
      - Fine number
      - Date of infraction
      - Location
      - Fine amount
      - Points deducted
      - Type of violation
      
      Return as JSON matching this schema.
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      { text: prompt },
    ]);

    const text = result.response.text();
    const json = JSON.parse(text);

    // Validate with zod
    const validated = fineExtractionSchema.parse(json);
    return validated;
  } catch (error) {
    console.error("Gemini extraction failed:", error);
    throw new Error("Failed to extract fine data");
  }
}
```

### Schema Validation (`src/gemini/schemas.ts`)

```typescript
import { z } from "zod";

export const fineExtractionSchema = z.object({
  fineNumber: z.string(),
  date: z.string().datetime(),
  location: z.string(),
  amount: z.number().positive(),
  pointsDeducted: z.number().min(0).max(12),
  violationType: z.enum(["speeding", "parking", "red_light", "license"]),
});

export type FineExtraction = z.infer<typeof fineExtractionSchema>;
```

### Best Practices

**✅ DO:**

- Implement retry logic for API failures
- Cache results when possible
- Monitor token usage and costs
- Handle partial extractions gracefully
- Validate output with zod schemas
- Use appropriate model for task (flash vs pro)

**❌ DON'T:**

- Send personally identifiable info unnecessarily
- Retry infinitely (set max attempts)
- Block on Gemini calls (use queues)
- Trust raw output without validation

**Retry Pattern:**

```typescript
async function extractWithRetry(buffer: Buffer, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await extractFineData(buffer);
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

---

## 🧪 Testing Strategy

### Test Runner

**Node.js built-in test runner** with `tsx` for TypeScript:

```bash
# Run all tests
cd processing-server
npm test

# Run specific test file
npm test -- tests/gemini/extract.test.ts

# Watch mode
npm test -- --watch
```

### Test Structure

**Mirror source directory:**

```
processing-server/
  src/
    gemini/
      extract.ts
  tests/
    gemini/
      extract.test.ts  ← Mirrors src structure
```

### Test Patterns

**Basic test structure:**

```typescript
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

describe("Fine Extraction", () => {
  beforeEach(() => {
    // Setup
  });

  it("should extract fine number from document", () => {
    const result = extractFineNumber(mockDocument);
    assert.strictEqual(result, "12345678");
  });

  it("should handle missing data gracefully", () => {
    const result = extractFineNumber(invalidDocument);
    assert.strictEqual(result, null);
  });

  afterEach(() => {
    // Cleanup
  });
});
```

**Async tests:**

```typescript
it("should process fine successfully", async () => {
  const result = await processFine({ fineId: "123" });
  assert.ok(result.success);
  assert.strictEqual(result.status, "analyzed");
});
```

### Mocking

**Mock Supabase:**

```typescript
import { beforeEach } from "node:test";

let mockSupabase;
beforeEach(() => {
  mockSupabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
    }),
  };
});
```

**Mock Gemini:**

```typescript
const mockGemini = {
  generateContent: async () => ({
    response: {
      text: () => JSON.stringify({ fineNumber: "12345" }),
    },
  }),
};
```

### Test Coverage

**Focus areas:**

- ✅ Unit tests for pure functions (normalizers, validators)
- ✅ Integration tests for API endpoints
- ✅ Queue job processing logic
- ✅ Gemini extraction with mock responses
- ✅ Database operations with mock Supabase

**Less critical:**

- UI components (covered by E2E tests in separate tool)
- Configuration files
- Type definitions

---

## 🎯 Common Patterns

### DO's ✅

**Next.js:**

- Use Server Components by default
- Add `'use client'` only when necessary
- Use Server Actions for mutations
- Colocate Server and Client components logically

**TypeScript:**

- Enable strict mode
- Use `const` by default
- Prefer `interface` for objects
- Generate Supabase types regularly

**Supabase:**

- Use correct client for context (server/client/middleware)
- Enable RLS on all tables
- Validate auth on both sides
- Never expose service_role key in frontend

**Forms:**

- Use react-hook-form + zod pattern
- Validate on client AND server
- French error messages
- Use shadcn Form components

**Styling:**

- Use design tokens (bg-primary, text-foreground)
- Mobile-first responsive design
- Dark mode support via next-themes
- Never edit /components/ui/ directly

**Queue:**

- Use BullMQ for background jobs
- Implement retry with backoff
- Clean up old jobs
- Monitor queue health

**Testing:**

- Write tests for business logic
- Mock external services
- Run tests before commits
- Use Node test runner with tsx

### DON'Ts ❌

**Never:**

- Edit shadcn/ui components in /components/ui/
- Use `var` (use `const` or `let`)
- Hardcode configuration (use env vars)
- Expose sensitive keys in frontend
- Commit directly to main branch
- Mix English/French in UI (keep French)
- Call `supabase.auth.getSession()` repeatedly
- Use `any` type without good reason
- Store large data in queue jobs
- Ignore TypeScript errors
- Skip validation on server side

**Avoid:**

- Large Server Components (split into smaller ones)
- Deep nesting of components
- Inline styles (use Tailwind)
- Relative imports across many directories
- Blocking operations in queue workers
- Retrying forever (set max attempts)

---

## 📚 Additional Resources

For deeper guidance on specific topics:

**Next.js:**

- [Next.js App Router Documentation](https://nextjs.org/docs)
- [Server Actions Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

**Supabase:**

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Supabase Auth with Next.js SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security (RLS) Guide](https://supabase.com/docs/guides/auth/row-level-security)

**shadcn/ui:**

- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

**BullMQ:**

- [BullMQ Documentation](https://docs.bullmq.io)
- [Queue Patterns Guide](https://docs.bullmq.io/patterns)

**Google Gemini:**

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google Gen AI SDK](https://github.com/googleapis/js-genai)

**Testing:**

- [Node Test Runner Docs](https://nodejs.org/api/test.html)
- See `processing-server/tests/` for examples

**Code Examples:**

- `app/dashboard/_components/dashboard-client.tsx` - Real-time subscriptions
- `components/profile/profile-form.tsx` - Form handling
- `app/dashboard/settings/profile/actions.ts` - Server Actions
- `processing-server/src/worker.ts` - Queue processing

---

## 🔄 Maintenance

**Keep AGENTS.md updated:**

- Update in same PR as code changes
- Code reviewers check AGENTS.md quality
- Remove stale information promptly
- Test with AI agent after updates

**When to update:**

- New major features or patterns added
- Tech stack changes (new dependencies)
- Best practices evolve
- Common pitfalls discovered
- Project structure reorganization

---

**Last Updated:** 2025-02-14
**Project**: Contesto v1.0
**Stack**: Next.js 15 + React 19 + Supabase + Express + BullMQ + Gemini
