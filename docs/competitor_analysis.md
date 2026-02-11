# Competitor Analysis: Imagy.app
**Source Data**: `extract-data-2026-02-11.json`
**Date**: 2026-02-11

## Overview
Imagy.app is a client-side heavy image manipulation platform sharing a similar tech stack with PhotoCon (React, Next.js, Tailwind). However, it leverages WebAssembly (WASM) heavily to support a vast array of file formats, including RAW camera files.

## Technical Architecture
*   **Frontend**: React, Next.js, Tailwind CSS.
*   **Core Engines**: 
    *   `ImageMagick (WebAssembly)`: Handling complex format conversions (RAW, TIFF, BMP).
    *   `FFmpeg (WebAssembly)`: Video-to-image conversions (MP4 to GIF/JPG).
    *   `@uswriting/exiftool`: Metadata management.

## Feature Gap Analysis

| Feature | PhotoCon (Current) | Imagy (Target) | Gap |
| :--- | :--- | :--- | :--- |
| **Resizing** | Bulk Resize (Canvas) | Bulk + Individual + File Size Target | **Target File Size (KB)** |
| **Cropping** | Basic Crop (Canvas) | Crop + Shape (Circle) + Background Color | Circle Crop, BG Color |
| **Conversion** | PDF->JPG, HEIC->JPG | RAW, TIFF, SVG, AVIF, WebP <-> All | **Universal Converter** |
| **Compression** | Basic Quality Slider | Advanced Compression (MozJPEG, PNGQuant) | **Dedicated Compressor** |
| **Creative** | Flip, Rotate | Split Image, Aspect Ratio Changer | Split Image |

## Strategic Recommendations

### 1. Implement "Universal Converter" (High Priority)
To achieve parity, we must move beyond the native Canvas API (which supports only PNG/JPG/WebP/BMP) and integrate a WASM-based solution like **ImageMagick** or **Vips**.
*   **Action**: Create `app/(tools)/converter/` using `imagemagick-wasm`.
*   **Support**: RAW (CR2, NEF), TIFF, SVG, and high-efficiency AVIF.

### 2. Add "Image Compressor" Tool
Users want to reduce file size for SEO/Web. Canvas `quality` parameter is a good start, but specialized algorithms (like those in Squoosh.app) are better.
*   **Action**: Create `app/(tools)/compress/` with "Target File Size" feature.

### 3. "Split Image" Tool
A unique feature found in Imagy is splitting images for Instagram grids (3x1, 3x2, etc.).
*   **Action**: Low-effort, high-value addition using Canvas.

## Updated Roadmap
I have added the following phases to the project plan:

*   **Phase 4: Advanced Core (WASM)**
    *   Integrate `imagemagick-wasm`.
    *   Build Universal Image Converter.
    *   Support RAW formats (DNG, CR2, NEF).
*   **Phase 5: Optimization & Creative**
    *   Build Image Compressor (File size targeting).
    *   Build Split Image Tool.
