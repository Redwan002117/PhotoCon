'use client';

import React, { useRef, useEffect } from 'react';
import { useImageStore } from '@/lib/store';

export const CanvasPreview = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { previewUrl, originalDimensions, flipX, flipY, rotation } = useImageStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !previewUrl || !originalDimensions) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = previewUrl;

        img.onload = () => {
            // Handle Rotation for Canvas Size
            // If rotated 90 or 270, swap width/height
            const isRotated90 = (Math.abs(rotation) % 180) === 90;

            canvas.width = isRotated90 ? img.height : img.width;
            canvas.height = isRotated90 ? img.width : img.height;

            // Clear and Draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();

            // Move to center
            ctx.translate(canvas.width / 2, canvas.height / 2);

            // Rotate
            ctx.rotate((rotation * Math.PI) / 180);

            // Scale (Flip)
            ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

            // Draw image centered (using original dimensions)
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            ctx.restore();
        };

    }, [previewUrl, originalDimensions, flipX, flipY, rotation]);

    return (
        <div className="relative w-full h-[600px] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
            {/* We scale the canvas via CSS to fit the container, but keep internal resolution high */}
            <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain shadow-lg"
            />
        </div>
    );
};
