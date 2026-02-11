'use client';

import React from 'react';
import { useImageStore } from '@/lib/store';
import { ImageUploader } from './ImageUploader';
import { CanvasPreview } from './CanvasPreview';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

interface ToolShellProps {
    title: string;
    description: string;
    children?: React.ReactNode; // Tool-specific controls
    previewComponent?: React.ReactNode; // Optional replacement for CanvasPreview
}

export const ToolShell = ({ title, description, children, previewComponent }: ToolShellProps) => {
    const { file, resetImage } = useImageStore();

    // Download Handler (Basic implementation for CanvasPreview)
    // For Crop, the CropControls might handle download or applying.
    // For now, this download button downloads the *current canvas* state.
    const handleDownload = () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'edited-image.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">{title}</h1>
                <p className="text-lg text-slate-600">{description}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[600px]">
                {!file ? (
                    <div className="py-20">
                        <ImageUploader />
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Preview Area */}
                        <div className="flex-1 min-h-[400px] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-slate-700">Preview</h3>
                                <Button variant="ghost" size="sm" onClick={resetImage} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <X className="w-4 h-4 mr-2" />
                                    Close / Reset
                                </Button>
                            </div>

                            {/* Render Custom Preview or Default Canvas */}
                            <div className="flex-1 flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
                                {previewComponent || <CanvasPreview />}
                            </div>
                        </div>

                        {/* Controls Area */}
                        <div className="w-full lg:w-[380px] bg-slate-50 p-6 rounded-xl h-fit border border-slate-200">
                            {children}

                            <div className="mt-8 pt-6 border-t">
                                <Button className="w-full" size="lg" onClick={handleDownload}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Image
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
