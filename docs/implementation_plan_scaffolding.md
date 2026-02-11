# Implementation Plan - PhotoCon Scaffolding

## Goal Description
Scaffold the **PhotoCon** web application, a high-performance image tool and content platform.
The architecture matches `imagy.app` (Next.js) for SEO and UI speed, while integrating **Rust (via WebAssembly)** for "native-grade" client-side image processing.

## Proposed Stack
*   **Frontend/Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript (for Next.js), Rust (for Imagy Engine)
*   **Styling**: Tailwind CSS + shadcn/ui
*   **Deployment**: Vercel / Cloudflare Pages

## Proposed Changes

### [NEW] Project Initialization
*   Initialize Next.js app in `d:\App_Projects\PhotoCon`.
*   Configure `jsconfig.json` / `tsconfig.json` for path aliases.
*   Setup `tailwind.config.ts`.
*   Initialize `shadcn-ui`.

### [NEW] Directory Structure
```
/src
  /app          # Next.js App Router
    /(marketing)# Landing page & Blog (SEO focused)
    /(tools)    # Tool pages (e.g., /compress-image)
  /components
    /ui         # shadcn components
    /tools      # Tool-specific UI (uploaders, canvas)
  /lib          # Utils
  /engine       # Rust/Wasm source code (future)
```

## Verification Plan

### Automated Tests
*   **Build Verification**: Run `npm run build` to ensure the scaffold compiles without errors.
*   **Lint Check**: Run `npm run lint`.

### Manual Verification
*   **Local Launch**: Start dev server (`npm run dev`) and verify:
    *   Home page loads.
    *   Tailwind styles are applied (check for a styled header).
    *   shadcn/ui button component renders correctly.
