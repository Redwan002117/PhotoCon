# Implementation Plan - Modern Landing Page

## Goal
Replace the default Next.js homepage with a high-conversion, beautiful landing page that routes users to the tools.

## Design Philosophy
*   **Modern & Clean**: Heavy use of white/slate space, crisp typography (Inter), and subtle borders.
*   **Engaging**: `framer-motion` for entry animations (fade up, stagger children).
*   **Accessible**: large touch targets, clear contrast.
*   **Navigation-First**: The primary goal is to get the user to a tool.

## Structure
1.  **Hero Section**:
    *   H1: "The Ultimate Privacy-First Image Toolkit"
    *   Sub: "Edit, Convert, and Optimize your images entirely in your browser. No uploads, no waiting, 100% free."
    *   CTA: Primary "Start Editing" (Scroll to grid) + Secondary "GitHub" (if open source) or "Documentation".

2.  **Features Grid (The core ui)**:
    *   A grid of cards, each representing a tool.
    *   **Card Design**: Icon + Title + Description + "Launch" arrow.
    *   **Hover State**: Slight lift + shadow + border color change.

3.  **Tools to Showcase**:
    *   Flip / Rotate
    *   Crop
    *   PDF to Image
    *   Bulk Resize

4.  **Tech Details**:
    *   Stack: Next.js, Tailwind, Framer Motion.
    *   Icons: Lucide React.

## Verification
*   Check responsiveness on Mobile vs Desktop.
*   Verify all links on cards work.
*   Ensure zero layout shift on load.
