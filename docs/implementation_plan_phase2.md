# Implementation Plan - Phase 2: Server-Side Converters

## Goal
Implement secure, high-performance file conversion endpoints, starting with **PDF to Image (PNG/JPG)**.

## Architecture
Since PDF conversion is resource-intensive and often requires native libraries, we will handle this **Server-Side** using Next.js Route Handlers (API Routes).

### Tech Stack
*   **PDF Processing**: `pdf-lib` (for manipulation) or `pdf2pic` (wrapper around GraphicsMagick/Ghostscript).
    *   *Decision*: converting PDF to Image purely in Node.js without external CLI dependencies (like Ghostscript) is tricky.
    *   *Option A*: `pdf-img-convert` (uses Puppeteer/Mozilla's PDF.js) - Good for high fidelity, heavy.
    *   *Option B*: `pdf-lib` + `sharp`. `pdf-lib` produces PDFs, not images.
    *   *Option C*: **`pdfjs-dist`** + **`canvas`** (node-canvas). Matches the standard web way but runs on server.
    *   *Option D*: **`graphicsmagick`** (Requires system install).
    *   *Selection*: **`pdfjs-dist`** (Mozilla's parser) is the most portable Node.js solution that doesn't require installing binaries on the host OS (unlike Ghostscript). We can render the PDF page to a canvas context and export as image.

### API Structure
*   `POST /api/convert/pdf-to-image`:
    *   Input: `Multipart/form-data` (The PDF file).
    *   Processing: 
        1. Receive Buffer.
        2. Parse with `pdfjs-dist`.
        3. Render Page 1 (or all) to Canvas.
        4. Convert Canvas to Buffer (PNG/JPG).
    *   Output: Image Blob or Zip (if multiple pages).

## Component Structure
```
/src
  /app/api/convert/pdf-to-image/route.ts  # The heavy lifting
  /components/tools/
    PDFUploader.tsx                       # Specialized uploader
    ConversionStatus.tsx                  # Progress indicator
  /app/(tools)/pdf-to-image/page.tsx
```

## Security & Performance
*   **File Size Limit**: Enforce 10MB limit.
*   **Input Validation**: Strict Magic Number checking for PDF signature.
*   **Cleanup**: No temp files saved to disk; process in RAM if possible, or auto-cleanup `/tmp`.

## Verification
*   **Status Code**: API returns 200.
*   **Output**: Returned file is a valid PNG.
