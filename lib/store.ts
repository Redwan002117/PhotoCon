import { create } from 'zustand';

// Define Crop type (matching react-image-crop roughly)
export interface Crop {
    unit: 'px' | '%';
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageState {
    file: File | null;
    previewUrl: string | null;
    originalDimensions: { width: number; height: number } | null;

    // Transformations
    flipX: boolean;
    flipY: boolean;
    rotation: number;
    crop: Crop | null;

    setImage: (file: File) => void;
    resetImage: () => void;
    toggleFlipX: () => void;
    toggleFlipY: () => void;
    setRotation: (deg: number) => void;
    setCrop: (crop: Crop | null) => void;
}

export const useImageStore = create<ImageState>((set) => ({
    file: null,
    previewUrl: null,
    originalDimensions: null,

    flipX: false,
    flipY: false,
    rotation: 0,
    crop: null,

    setImage: (file) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            set({
                file,
                previewUrl: url,
                originalDimensions: { width: img.width, height: img.height },
                flipX: false,
                flipY: false,
                rotation: 0,
                crop: null
            });
        };
        img.src = url;
    },

    resetImage: () => set((state) => {
        if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
        return {
            file: null,
            previewUrl: null,
            originalDimensions: null,
            flipX: false,
            flipY: false,
            rotation: 0,
            crop: null
        };
    }),

    toggleFlipX: () => set((state) => ({ flipX: !state.flipX })),
    toggleFlipY: () => set((state) => ({ flipY: !state.flipY })),
    setRotation: (rotation) => set({ rotation }),
    setCrop: (crop) => set({ crop }),
}));
