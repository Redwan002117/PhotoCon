# Phase 4 Implementation Plan: Universal Converter (WASM)

## Goal
Implement a client-side "Universal Image Converter" capable of handling advanced formats (RAW, TIFF, HEIC, etc.) that the browser's native Canvas API cannot process. This bridges the gap with `imagy.app`.

## Tech Stack
*   **Library**: `@imagemagick/magick-wasm` (WebAssembly port of ImageMagick).
*   **Framework**: Next.js 15 (Client Components).
*   **UI**: Tailwind CSS + Shadcn/UI.

## 1. Setup & Configuration
WebAssembly in Next.js requires specific handling to serve the `.wasm` binary.
*   [ ] Install `@imagemagick/magick-wasm`.
*   [ ] Create a `postinstall` script or manually copy the `magick.wasm` file to `public/wasm/` to ensure it's serveable by the browser.
*   [ ] Configure Next.js headers (if necessary) for `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` to enable SharedArrayBuffer (improves WASM perf).

## 2. Core Logic (`useMagick`)
Create a custom hook to handle the complex initialization of the WASM environment.
*   **File**: `hooks/useMagick.ts`
*   **Logic**:
    *   Check if WASM is loaded.
    *   Fetch `magick.wasm` from `public/`.
    *   Initialize the ImageMagick environment.
    *   Provide a `convertFile(file: File, targetFormat: string)` function.

## 3. UI Component (`UniversalConverter`)
*   **File**: `components/tools/UniversalConverter.tsx`
*   **Features**:
    *   Multi-file upload (Drag & Drop).
    *   "Convert To" dropdown (JPG, PNG, WEBP, AVIF, PDF, BMP, TIFF).
    *   Progress indicators (Conversion can be slow).
    *   Download buttons (Individual + Zip).
    *   **Specific Feature**: "Input Format" badge showing strict types (e.g., "Canon CR2 Raw").

## 4. Page Implementation
*   **Route**: `/converter`
*   **Metadata**: SEO optimized title/description.

## 5. Verification
*   Test with a sample RAW file (e.g., `.CR2` or `.NEF` from an online sample).
*   Test with `.TIFF` file.
*   Verify memory usage (WASM can be heavy).
