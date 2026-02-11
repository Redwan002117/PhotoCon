import React from 'react';
import { ToolShell } from '@/components/tools/ToolShell';
import { CropControls } from '@/components/tools/actions/CropControls';
import { CropCanvas } from '@/components/tools/CropCanvas';

export const metadata = {
    title: 'Crop Image Online - PhotoCon',
    description: 'Crop your images to exact pixel dimensions or aspect ratios.'
};

export default function CropImagePage() {
    return (
        <ToolShell
            title="Crop Image"
            description="Trim unwanted parts of your photo. Free online image cropper."
            previewComponent={<CropCanvas />}
        >
            <CropControls />
        </ToolShell>
    );
}
