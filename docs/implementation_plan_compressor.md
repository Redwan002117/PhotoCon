# Phase 4b: Advanced Image Compressor (WASM)

## Goal
Build a tool that reduces image file size to a specific target (e.g., "50KB") or quality percentage, entirely client-side.

## Tech Stack
*   **Engine**: `@imagemagick/magick-wasm` (already installed).
*   **Algorithm**: Binary Search for "Target Size" optimization.
*   **UI**: Shadcn/UI (Slider, Input, Select).

## 1. Core Logic (`useImageCompressor`)
Extend `useMagick` or create a new hook `hooks/useImageCompressor.ts`.
*   **Function**: `compressToSize(file: File, targetSizeKB: number, format: MagickFormat)`
*   **Algorithm**:
    1.  Load image.
    2.  Set lower_bound=0, upper_bound=100.
    3.  Loop (max 6 iterations):
        *   quality = (lower + upper) / 2
        *   `image.quality = quality`
        *   `image.write(format)` -> measure blob size.
        *   If size > target: upper = quality.
        *   If size < target: lower = quality.
    4.  Return best blob.

## 2. UI Component (`ImageCompressor`)
*   **File**: `components/tools/ImageCompressor.tsx`
*   **Uniques**:
    *   "Target Size" input (KB/MB).
    *   "Quality" Slider (Visual feedback mode).
    *   Before/After size comparison (Green badge for savings: "-80%").
    *   Split View comparison (Visual).

## 3. Page (`/compress-image`)
*   Standard `ToolShell` wrapper.

## 4. Updates
*   Add to `Features.tsx`.
*   Update `Navbar` submenu.
