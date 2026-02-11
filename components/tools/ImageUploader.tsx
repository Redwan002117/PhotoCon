'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useImageStore } from '@/lib/store';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils'; // Using shadcn utility

export const ImageUploader = () => {
    const setImage = useImageStore((state) => state.setImage);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            setImage(acceptedFiles[0]);
        }
    }, [setImage]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif']
        },
        maxFiles: 1,
        multiple: false
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ease-in-out",
                isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 bg-slate-50",
                isDragReject && "border-red-500 bg-red-50"
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                <UploadCloud className={cn("w-12 h-12 mb-4", isDragActive && "text-blue-500")} />
                {isDragActive ? (
                    <p className="mb-2 text-sm text-blue-600 font-semibold">Drop the image here...</p>
                ) : (
                    <>
                        <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs">SVG, PNG, JPG or GIF (MAX. 8000x8000px)</p>
                    </>
                )}
            </div>
        </div>
    );
};
