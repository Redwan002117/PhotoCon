'use client';

import React, { useRef, useState, useEffect } from 'react';
import ReactCrop, { Crop as ReactCropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useImageStore } from '@/lib/store';

export const CropCanvas = () => {
    const { previewUrl, setCrop } = useImageStore();
    const imgRef = useRef<HTMLImageElement>(null);
    const [aspect, setAspect] = useState<number | undefined>(undefined);

    // Local state for smooth dragging, synced to store on change
    const [crop, setConfiguredCrop] = useState<ReactCropType>();

    // Initialize crop to full image on load (optional) or center
    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        // Default to a 80% center crop or just empty
        // makeAspectCrop(...)
    };

    useEffect(() => {
        if (!previewUrl) {
            setConfiguredCrop(undefined);
            setCrop(null);
        }
    }, [previewUrl, setCrop]);

    return (
        <div className="flex items-center justify-center min-h-[400px] w-full bg-slate-100 p-4">
            {previewUrl && (
                <ReactCrop
                    crop={crop}
                    onChange={(c) => {
                        setConfiguredCrop(c);
                        setCrop(c as any); // Sync to store (PixelCrop match)
                    }}
                    aspect={aspect}
                >
                    <img
                        ref={imgRef}
                        src={previewUrl}
                        alt="Crop preview"
                        onLoad={onImageLoad}
                        style={{ maxHeight: '600px', objectFit: 'contain' }}
                    />
                </ReactCrop>
            )}
        </div>
    );
};
