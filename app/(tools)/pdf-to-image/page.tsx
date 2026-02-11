import React from 'react';
import { ToolShell } from '@/components/tools/ToolShell';
import { PDFUploader } from '@/components/tools/PDFUploader';

export const metadata = {
    title: 'PDF to Image Converter - PhotoCon',
    description: 'Convert PDF pages to high-quality PNG or JPG images for free.'
};

export default function PDFToImagePage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">PDF to Image Converter</h1>
                <p className="text-lg text-slate-600">Extract pages from your PDF documents as high-quality images.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[400px] flex items-center justify-center">
                <PDFUploader />
            </div>
        </div>
    );
}
