# Implementation Plan - Bulk Image Resizer

## Goal
Allow users to resize and convert multiple images at once, entirely client-side.

## Features
*   **Bulk Upload**: Drag & drop multiple images.
*   **Resize Controls**:
    *   By Percentage (e.g., 50%, 200%).
    *   By Dimensions (Width/Height) with Aspect Ratio lock.
*   **Format Conversion**: Target format (JPG, PNG, WebP).
*   **Quality Control**: For JPG/WebP (0.1 - 1.0).
*   **Output**: Download individual files or a ZIP archive (using `jszip`).

## Architecture
*   **Component**: `BulkResizer.tsx`
    *   State: List of files with their status (Pending, Processing, Done).
    *   Processing: `Promise.all` over the file list.
    *   Logic:
        1. Read File -> `img` object.
        2. Create off-screen Canvas.
        3. Draw with new dimensions.
        4. `canvas.toBlob(type, quality)`.
        5. Add to Zip.
*   **Page**: `/app/(tools)/resize-image/page.tsx`

## Dependencies
*   `jszip`: For bundling the result.
*   `file-saver`: (Optional) Next.js might handle blob downloads natively, but `file-saver` is reliable for Zips. *We will try standard anchor tag download first.*

## Verification
1.  Upload 3 images.
2.  Set width to 500px (Linked height).
3.  Set format to WebP.
4.  Process -> Download Zip.
5.  Extract and verify dimensions/format.
