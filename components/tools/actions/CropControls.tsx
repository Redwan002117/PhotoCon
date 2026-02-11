'use client';

import React from 'react';
import { useImageStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export const CropControls = () => {
    const { crop, file, setImage, previewUrl } = useImageStore();

    const applyCrop = () => {
        if (!crop || !file || !previewUrl) return;

        // Solution: Look for the image in the DOM by selector
        const imgElement = document.querySelector('img[alt="Crop preview"]') as HTMLImageElement;
        if (!imgElement) return;

        const canvas = document.createElement('canvas');

        const scaleX = imgElement.naturalWidth / imgElement.width;
        const scaleY = imgElement.naturalHeight / imgElement.height;

        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(
            imgElement,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );

        canvas.toBlob((blob) => {
            if (blob) {
                const newFile = new File([blob], file.name, { type: 'image/png' });
                setImage(newFile); // "Bake" the crop
            }
        }, 'image/png');
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-600 mb-4">
                Drag on the image to select the area you want to keep.
            </p>

            <Button
                onClick={applyCrop}
                className="w-full h-12 text-lg"
                disabled={!crop || crop.width === 0 || crop.height === 0}
            >
                <Check className="w-5 h-5 mr-2" />
                Apply Crop
            </Button>

            <p className="text-xs text-slate-400 text-center mt-2">
                This will update the current image permanently.
            </p>
        </div>
    );
};
