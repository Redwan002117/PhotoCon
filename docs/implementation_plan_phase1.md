# Implementation Plan - Phase 1: Client-Side Image Tools

## Goal
Implement the MVP set of image tools (Flip, Rotate, Crop) using **HTML5 Canvas** for zero-latency, private, client-side editing.

## Architecture: The "ToolShell" Pattern
To avoid repeating code for every tool, we will build a reusable `ToolLayout` or `ToolShell` that handles:
1.  **File Upload**: Drag & Drop zone.
2.  **Canvas Rendering**: displaying the image.
3.  **Export/Download**: Saving the result.
4.  **Toolbar Slot**: Where specific tools inject their controls.

## Component Structure
```
/src
  /components
    /tools
      ToolShell.tsx       # Wrapper with Upload/Download logic
      CanvasPreview.tsx   # Handles the 2D Context & real-time rendering
      /actions
        FlipControls.tsx  # Buttons for Horizontal/Vertical flip
        RotateControls.tsx# Slider/Buttons for rotation
        CropControls.tsx  # Apply crop logic
      ImageUploader.tsx   # Drag and drop zone (using react-dropzone)
  /app/(tools)
    /flip-image/page.tsx  # Uses ToolShell + FlipControls
    /rotate-image/page.tsx# Uses ToolShell + RotateControls
    /crop-image/page.tsx  # Uses ToolShell + CropControls
```

## State Management
*   **Zustand** or **React Context** to manage the Image Bitmap and active transformations.
*   **Transform Pipeline**: 
    Original Image -> Apply Flip -> Apply Rotate -> Apply Crop -> Canvas Draw.

## Error Handling (The "Healing Factor")
*   **Strict Typing**: All canvas operations will be typed.
*   **Boundary Checking**: Prevent cropping outside image bounds.
*   **Fallback Rendering**: If Canvas fails (e.g., too large), show a user-friendly error.
*   **Auto-Fix**: If the image is too large for the browser (iOS limit), automatically downscale it.

## Verification
*   **User Test**:
    1. Upload 4K image.
    2. Flip Horizontal.
    3. Download -> Verify result is flipped.
