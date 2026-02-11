import React from 'react';
import { BulkResizer } from '@/components/tools/BulkResizer';

export const metadata = {
    title: 'Bulk Image Resizer - PhotoCon',
    description: 'Resize multiple images at once. Free online batch image resizer supporting JPG, PNG, WebP.'
};

export default function BulkResizePage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Bulk Image Resizer</h1>
                <p className="text-lg text-slate-600">Resize, convert, and optimize multiple photos in seconds. 100% Client-side.</p>
            </div>

            <BulkResizer />
        </div>
    );
}
