# PhotoCon Feature Roadmap
**Based on deep analysis of Imagy.app infrastructure**

This document outlines the features, tools, and content strategy required to build **PhotoCon** as a direct competitor to `imagy.app`.

## 1. Core Web Tools (The "App" Side)
Imagy.app is not just a blog; it hosts a suite of server-side and client-side web tools. PhotoCon should implement these using **WebAssembly (Wasm)** or **Next.js server actions** for maximum performance and privacy.

### 🖼️ Image Editing & Manipulation
*   **Flip Image**: Mirror images horizontally/vertically.
*   **Rotate Image**: 90°, 180°, or custom angles.
*   **Resize Image**: (*Inferred*) Standard resizing capabilities.
*   **Crop Image**: (*Inferred*) Essential cropping functionality.
*   **Image Brightener**: Adjust brightness/gamma.
*   **Darken Image**: Reduce brightness.
*   **Vignette Effect**: Add darkened edges for cinematic look.
*   **Grain Filter**: Add noise/film grain texture.

### 🛠️ Utilities & Enhancements
*   **Remove Background**: AI-powered background removal (Critical Feature).
*   **Blur Faces**: Auto-detect and blur faces for privacy.
*   **Pixelate Image**: Censor areas or add retro effects.
*   **Add Text to Image**: Watermarking or meme creation.
*   **Add Emoji to Photo**: Sticker overlay.
*   **Overlay Images**: Superimpose images (watermarking/compositing).
*   **Combine Images**: Merge visuals (side-by-side, vertical, or grid).
*   **Add Grid to Photo**: For composition or artistic effect.
*   **Grid Maker for Drawing**: Reference grids for artists.
*   **Color Picker**: Extract hex/RGB codes from uploads.

### 🔄 Converters
*   **PDF to PNG**: High-quality document to image.
*   **PDF to JPG**: Standard document conversion.
*   **PDF to Image**: General converter.
*   **AVIF to JPG**: Modern format to standard.
*   **AVIF to PNG**: Modern format to lossless.

### 📊 Analysis
*   **Animated Image Analyzer**: Break down GIFs/WebP animations.

## 2. Content Strategy (The "Blog" Side)
Imagy.app drives traffic through massive amounts of "How-to" tutorials for *other* software. PhotoCon should replicate this SEO strategy.

**Key Topics to Cover:**
*   **Open Source Tools**: GIMP, Krita, Inkscape, FireAlpaca.
*   **Commercial Giants**: Adobe Photoshop, Illustrator, InDesign, XD, Figma.
*   **Common Tasks**: "How to resize", "How to remove background", "How to curve text", "How to grid".

## 3. Recommended Tech Stack for PhotoCon
To support both the Tools and the Content properly:

*   **Framework**: **Next.js 14+ (App Router)**
*   **Styling**: **Tailwind CSS** + **shadcn/ui** (Radix UI) - *Matches Imagy's stack exactly.*
*   **Image Processing**: 
    *   **Sharp (Node.js)** for fast server-side conversions (AVIF, PDF).
    *   **Canvas API / WebGL** for client-side editing (Rotate, Crop, Filters).
    *   **TensorFlow.js** or **ONNX Runtime** for Client-side AI (Background Removal, Face Blur).
*   **Content**: **MDX** (Markdown + React) for interactive tutorials.

## 4. Prioritized Implementation Plan

**Phase 1: MVP Utilities (Client-Side)**
*   Build the Next.js shell with shadcn/ui.
*   Implement `Flip`, `Rotate`, `Combine`, and `Overlay` using HTML5 Canvas.
*   *Why?* Low server cost, high interactivity.

**Phase 2: Converters (Server-Side)**
*   Implement PDF & AVIF conversion endpoints using `sharp` and `pdf-lib`.
*   *Why?* High value, captured from Imagy's extensive conversion links.

**Phase 3: AI Features**
*   Implement Background Removal and Face Blur.
*   *Note:* Use client-side models to save server costs, or standard APIs if budget allows.

**Phase 4: Advanced Core (WASM)**
*   Integrate `imagemagick-wasm` for raw power closer to native apps.
*   Build **Universal Converter**: Support RAW, TIFF, SVG, and AVIF.
*   Build **Advanced Compressor**: Client-side optimization (Target File Size/Quality) to rival Squoosh.

**Phase 5: Creative & Social Tools**
*   **Split Image**: Grid maker for Instagram.
*   **Watermark Tool**: Overlay text/logos.
*   **Meme Maker**: Simple text overlay on templates.

**Phase 6: Content Engine**
*   Launch the blog section with initial tutorials targeting "GIMP" and "Inkscape" keywords to capture traffic often missed by major Adobe tutorials.
